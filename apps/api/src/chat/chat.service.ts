import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    const ownerId = property.ownerId;

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        propertyId,
        users: {
          every: {
            userId: { in: [userId, ownerId] },
          },
        },
      },
      include: {
        property: { select: { title: true, neighborhood: true } },
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          propertyId,
          users: {
            create: [{ userId }, { userId: ownerId }],
          },
        },
        include: {
          property: { select: { title: true, neighborhood: true } },
          messages: {
            include: { sender: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return conversation;
  }

  async sendMessage(userId: string, conversationId: string, text: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new NotFoundException('Conversa não encontrada');

    return this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        property: { select: { id: true, title: true, media: { take: 1 } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
