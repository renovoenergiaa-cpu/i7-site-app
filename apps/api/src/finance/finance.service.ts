import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getOwnerStatement(ownerId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { property: { ownerId } },
      orderBy: { date: 'desc' },
    });

    const transfers = await this.prisma.transfer.findMany({
      where: { ownerId },
      orderBy: { date: 'desc' },
    });

    return { expenses, transfers };
  }

  async getTenantInvoices(contractId: string, user?: { id: string; role: string }) {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      const contract = await this.prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          proposal: true,
          property: true,
        },
      });

      if (!contract) {
        throw new NotFoundException('Contrato não encontrado');
      }

      const isTenant = contract.proposal?.userId === user.id;
      const isOwner = contract.property?.ownerId === user.id;

      if (!isTenant && !isOwner) {
        throw new ForbiddenException(
          'Acesso negado: Você não possui autorização para consultar as faturas deste contrato.'
        );
      }
    }

    return this.prisma.payment.findMany({
      where: { contractId },
      orderBy: { dueDate: 'desc' },
    });
  }

  // Placeholder for future Asaas integration
  async generateAsaasInvoice(data: any) {
    // integration logic
    return { success: true, message: 'Not implemented yet' };
  }
}
