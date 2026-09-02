import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { propertyId: string; dateTime: string; type: 'IN_PERSON' | 'VIDEO_CALL'; notes?: string }) {
    const property = await this.prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    // Anti-Self-Deal Business Security Rule
    if (property.ownerId === userId) {
      throw new BadRequestException('Regra de Segurança i7: Você não pode agendar uma visita para o seu próprio imóvel.');
    }

    return this.prisma.visit.create({
      data: {
        userId,
        propertyId: data.propertyId,
        dateTime: new Date(data.dateTime),
        type: data.type || 'IN_PERSON',
        notes: data.notes,
        status: 'SCHEDULED',
      },
      include: {
        property: {
          select: { title: true, street: true, number: true, neighborhood: true, city: true },
        },
      },
    });
  }

  async getUserVisits(userId: string) {
    return this.prisma.visit.findMany({
      where: { userId },
      include: {
        property: {
          include: { media: { take: 1 } },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }
}
