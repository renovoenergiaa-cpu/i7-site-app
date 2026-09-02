import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; content: string; target: string }) {
    return this.prisma.announcement.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { reads: true } }
      }
    });
  }

  async markAsRead(announcementId: string, userId: string) {
    return this.prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
      update: {},
      create: {
        announcementId,
        userId,
      },
    });
  }
}
