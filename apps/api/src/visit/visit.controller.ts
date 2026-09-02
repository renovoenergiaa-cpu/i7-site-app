import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { VisitService } from './visit.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Visits')
@Controller('visits')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class VisitController {
  constructor(private visitService: VisitService) {}

  @Post()
  @ApiOperation({ summary: 'Agendar visita presencial ou por vídeo' })
  create(@Request() req, @Body() body: any) {
    return this.visitService.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar minhas visitas agendadas' })
  getUserVisits(@Request() req) {
    return this.visitService.getUserVisits(req.user.id);
  }
}
