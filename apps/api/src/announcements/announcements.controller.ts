import { Controller, Get, Post, Body, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() body: { title: string; content: string; target: string }) {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Apenas administradores podem publicar comunicados.');
    }
    return this.announcementsService.create(body);
  }

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.announcementsService.markAsRead(id, userId);
  }
}

