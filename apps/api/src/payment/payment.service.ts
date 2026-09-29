import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async payInvoice(
    paymentId: string,
    user: { id: string; role: string },
    method: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            proposal: true,
            property: true,
          },
        },
      },
    });

    if (!payment) throw new NotFoundException('Fatura não encontrada');

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      const isTenant = payment.contract?.proposal?.userId === user.id;
      if (!isTenant) {
        throw new ForbiddenException(
          'Acesso negado: Apenas o locatário responsável pode realizar o pagamento desta fatura.'
        );
      }
    }

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

