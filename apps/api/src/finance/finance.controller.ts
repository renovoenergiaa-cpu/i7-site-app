import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';

@Controller('finance')
@UseGuards(AuthGuard('jwt'))
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('statement')
  getStatement(@Req() req: any) {
    return this.financeService.getOwnerStatement(req.user.id);
  }

  @Get('invoices/:contractId')
  getInvoices(@Req() req: any, @Param('contractId') contractId: string) {
    return this.financeService.getTenantInvoices(contractId, req.user);
  }
}

