import { Injectable } from '@nestjs/common';
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

  async getTenantInvoices(contractId: string) {
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
