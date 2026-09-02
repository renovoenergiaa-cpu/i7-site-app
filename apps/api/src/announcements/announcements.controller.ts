import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  create(@Body() body: { title: string; content: string; target: string }) {
    return this.announcementsService.create(body);
  }

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string, @Body() body: { userId: string }, @Req() req: any) {
    const userId = req?.user?.id || body?.userId;
    if (!userId) throw new Error('User ID is required');
    return this.announcementsService.markAsRead(id, userId);
  }
}
