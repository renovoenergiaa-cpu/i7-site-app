import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProposalService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { propertyId: string; proposedAmount: number; notes?: string }) {
    const property = await this.prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    // Anti-Self-Deal Business Security Rule
    if (property.ownerId === userId) {
      throw new BadRequestException('Regra de Segurança i7: Você não pode enviar uma proposta para o seu próprio imóvel.');
    }

    return this.prisma.proposal.create({
      data: {
        userId,
        propertyId: data.propertyId,
        proposedAmount: Number(data.proposedAmount),
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        property: true,
      },
    });
  }

  async getUserProposals(userId: string) {
    return this.prisma.proposal.findMany({
      where: { userId },
      include: {
        property: {
          include: { media: { take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptProposal(proposalId: string, ownerId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { property: true },
    });

    if (!proposal || proposal.property.ownerId !== ownerId) {
      throw new NotFoundException('Proposta não encontrada ou acesso negado');
    }

    // Update proposal status
    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'ACCEPTED' },
    });

    // Create active contract and initial payment schedule
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    const contract = await this.prisma.contract.create({
      data: {
        proposalId: proposal.id,
        propertyId: proposal.propertyId,
        startDate,
        endDate,
        monthlyAmount: proposal.proposedAmount,
        status: 'ACTIVE',
        signedDocumentUrl: `https://i7-docs.s3.amazonaws.com/contracts/contract_${proposal.id}.pdf`,
      },
    });

    // Generate first payment invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    await this.prisma.payment.create({
      data: {
        contractId: contract.id,
        amount: proposal.proposedAmount,
        dueDate,
        status: 'PENDING',
        method: 'PIX',
        pixKey: 'financeiro@i7imobiliaria.com.br',
        pixQrCode: `00020126580014BR.GOV.BCB.PIX0136${contract.id}520400005303986540${proposal.proposedAmount}5802BR5915i7_IMOBILIARIA6009SAO_PAULO62070503***6304E8A2`,
        barCode: '34191.79001 01043.510047 91020.150008 5 95600000',
      },
    });

    return { proposal: updated, contract };
  }
}
