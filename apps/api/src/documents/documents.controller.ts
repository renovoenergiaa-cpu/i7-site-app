import { Controller, Post, Get, UseInterceptors, UploadedFile, UseGuards, Req, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';


@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // @UseGuards(JwtAuthGuard) // Comentado temporariamente para facilitar o seu teste agora
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; type: string; propertyId?: string; contractId?: string; userId?: string }
  ) {
    // Usando um ID de usuário fixo para o teste caso não venha no body
    const testUserId = body.userId || 'admin-test-id';
    return this.documentsService.uploadDocument(file, testUserId, body);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('my-documents')
  async getDocuments(@Req() req: any) {
    const testUserId = req?.user?.id || 'admin-test-id';
    return this.documentsService.getUserDocuments(testUserId);
  }
}
