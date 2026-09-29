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

    // Path Traversal Prevention: Sanitize filename and remove directory navigation characters
    const sanitizedFilename = (file.originalname || 'document')
      .replace(/^.*[\\\/]/, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
    const filePath = `documents/${userId}/${uniqueFilename}`;

    const { data: uploadData, error } = await this.supabase.storage
      .from('i7-documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to upload to Supabase: ${error.message}`);
    }

    // Attempt signed URL first (expires in 2 hours for authorized access); fallback to getPublicUrl
    let fileUrl = '';
    const { data: signedData } = await this.supabase.storage
      .from('i7-documents')
      .createSignedUrl(filePath, 7200);

    if (signedData?.signedUrl) {
      fileUrl = signedData.signedUrl;
    } else {
      const { data: publicUrlData } = this.supabase.storage
        .from('i7-documents')
        .getPublicUrl(filePath);
      fileUrl = publicUrlData?.publicUrl || filePath;
    }

    return this.prisma.document.create({
      data: {
        title: data.title,
        url: fileUrl,
        type: data.type,
        uploadedBy: userId,
        userId: userId,
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
