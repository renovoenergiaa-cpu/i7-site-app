import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logEvent(params: {
    userId?: string;
    action: string;
    resource: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          resource: params.resource,
          details: params.details,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (e) {
      console.log(`[AUDIT LOG]: ${params.action} on ${params.resource} by User ${params.userId || 'Anonymous'} from IP ${params.ipAddress || 'unknown'}`);
    }
  }
}
