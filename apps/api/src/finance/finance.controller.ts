import { Controller, Get, Param, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('statement')
  getStatement(@Req() req: any) {
    return this.financeService.getOwnerStatement(req.user.id);
  }

  @Get('invoices/:contractId')
  getInvoices(@Param('contractId') contractId: string) {
    return this.financeService.getTenantInvoices(contractId);
  }
}
