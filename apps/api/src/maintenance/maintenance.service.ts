import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { contractId: string; description: string; priority?: string }) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        id: data.contractId,
        proposal: { userId },
      },
    });

    if (!contract) throw new NotFoundException('Contrato de locação não encontrado');

    return this.prisma.maintenanceRequest.create({
      data: {
        contractId: contract.id,
        propertyId: contract.propertyId,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        property: { select: { title: true } },
      },
    });
  }

  async getUserRequests(userId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        contract: {
          proposal: { userId },
        },
      },
      include: {
        property: { select: { title: true, neighborhood: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
