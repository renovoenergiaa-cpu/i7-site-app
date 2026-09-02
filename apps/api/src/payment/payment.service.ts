import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        contract: {
          proposal: {
            userId,
          },
        },
      },
      include: {
        contract: {
          include: {
            property: {
              select: { title: true, neighborhood: true, city: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async payInvoice(paymentId: string, method: 'PIX' | 'BOLETO' | 'CREDIT_CARD') {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Fatura não encontrada');

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        method,
        paidAt: new Date(),
        transactionId: `TX_i7_${Date.now()}`,
      },
    });
  }
}
