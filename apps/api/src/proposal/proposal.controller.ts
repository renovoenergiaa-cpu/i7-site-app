import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Proposals')
@Controller('proposals')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProposalController {
  constructor(private proposalService: ProposalService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar proposta de aluguel ou compra' })
  create(@Request() req, @Body() body: any) {
    return this.proposalService.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar minhas propostas' })
  getUserProposals(@Request() req) {
    return this.proposalService.getUserProposals(req.user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Aceitar proposta e gerar contrato (Proprietário)' })
  accept(@Request() req, @Param('id') id: string) {
    return this.proposalService.acceptProposal(id, req.user.id);
  }
}
