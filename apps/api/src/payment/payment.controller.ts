import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos e mensalidades do locatário' })
  getUserPayments(@Request() req) {
    return this.paymentService.getUserPayments(req.user.id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Realizar pagamento de fatura (PIX/Boleto/Cartão)' })
  payInvoice(@Param('id') id: string, @Body() body: { method: 'PIX' | 'BOLETO' | 'CREDIT_CARD' }) {
    return this.paymentService.payInvoice(id, body.method || 'PIX');
  }
}
