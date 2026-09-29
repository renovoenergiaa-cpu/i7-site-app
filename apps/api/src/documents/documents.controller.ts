import { 
  Controller, 
  Post, 
  Get, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards, 
  Req, 
  Body, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Tipo de arquivo não permitido: ${file.mimetype}. Formatos aceitos: PDF, JPEG, PNG, WEBP.`
            ),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; type: string; propertyId?: string; contractId?: string; userId?: string }
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado para upload.');
    }

    if (!body.title || !body.type) {
      throw new BadRequestException('Título e tipo do documento são obrigatórios.');
    }

    // IDOR Prevention: Only ADMINs can upload on behalf of another user
    let targetUserId = req.user.id;
    if (body.userId && body.userId !== req.user.id) {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Acesso negado: Você não pode anexar documentos para outro usuário.');
      }
      targetUserId = body.userId;
    }

    return this.documentsService.uploadDocument(file, targetUserId, body);
  }

  @Get('my-documents')
  async getDocuments(@Req() req: any) {
    return this.documentsService.getUserDocuments(req.user.id);
  }
}

