import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  getConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Post('conversation/property/:propertyId')
  @ApiOperation({ summary: 'Obter ou iniciar conversa para um imóvel' })
  getOrCreateConversation(@Request() req, @Param('propertyId') propertyId: string) {
    return this.chatService.getOrCreateConversation(req.user.id, propertyId);
  }

  @Post('message')
  @ApiOperation({ summary: 'Enviar mensagem no chat' })
  sendMessage(@Request() req, @Body() body: { conversationId: string; text: string }) {
    return this.chatService.sendMessage(req.user.id, body.conversationId, body.text);
  }
}
