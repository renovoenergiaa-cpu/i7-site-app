import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PropertyService } from './property.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  @ApiOperation({ summary: 'Listar e filtrar imóveis' })
  findAll(@Query() query: any) {
    return this.propertyService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('my-properties')
  @ApiOperation({ summary: 'Listar imóveis do proprietário logado' })
  getMyProperties(@Request() req) {
    return this.propertyService.getOwnerProperties(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um imóvel por ID' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Anunciar novo imóvel (Proprietário)' })
  create(@Request() req, @Body() body: any) {
    return this.propertyService.create(req.user.id, body);
  }
}
