import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Abrir chamado de manutenção no imóvel' })
  create(@Request() req, @Body() body: any) {
    return this.maintenanceService.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar chamados de manutenção do locatário' })
  getUserRequests(@Request() req) {
    return this.maintenanceService.getUserRequests(req.user.id);
  }
}
