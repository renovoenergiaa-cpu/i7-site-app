import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || process.env.SUPABASE_URL || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || process.env.SUPABASE_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadDocument(
    file: Express.Multer.File, 
    userId: string, 
    data: { title: string; type: string; propertyId?: string; contractId?: string }
  ) {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase credentials not configured.');
    }

    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const filePath = `documents/${userId}/${uniqueFilename}`;

    const { data: uploadData, error } = await this.supabase.storage
      .from('i7-documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('i7-documents')
      .getPublicUrl(filePath);

    let validUserId = userId;
    if (userId === 'admin-test-id') {
      let firstUser = await this.prisma.user.findFirst();
      if (!firstUser) {
        firstUser = await this.prisma.user.create({
          data: { name: 'Admin Teste', email: 'admin.test@i7.com', passwordHash: '123', role: 'ADMIN' }
        });
      }
      validUserId = firstUser.id;
    }

    return this.prisma.document.create({
      data: {
        title: data.title,
        url: publicUrlData.publicUrl,
        type: data.type,
        uploadedBy: validUserId,
        userId: validUserId,
        propertyId: data.propertyId,
        contractId: data.contractId,
      },
    });
  }

  async getUserDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
