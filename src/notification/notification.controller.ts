import { Controller, Get, Patch, Param, Req, UseGuards, Query, DefaultValuePipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { NotificationResponseDto } from './dto/notification.response.dto';
import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { NotificationMapper } from './mappers/notification.mapper';
import { IPaginationResponse } from 'src/common/interfaces/pagination-response.interface';

@Controller('notifications')
@UseInterceptors(TransformInterceptor)
@UseGuards(AuthenticatedGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getUserNotifications(@Req() req): Promise<IPaginationResponse<NotificationResponseDto>> {
        const rawPaginationData = await this.notificationService.getUserNotifications(req.user.id);
        return NotificationMapper.toPaginatedResponseDto(rawPaginationData);
    }

    @Get('all')
    async getUserNotificationsPaginated(@Req() req, @Query() query: PaginationQueryDto): Promise<IPaginationResponse<NotificationResponseDto>> {
        const rawPaginationData = await this.notificationService.getUserNotificationsPaginated(req.user.id, query);
        return NotificationMapper.toPaginatedResponseDto(rawPaginationData);
    }

    @Patch(':id/read')
    async markAsRead(@Req() req, @Param('id') id: string): Promise<NotificationResponseDto> {
        return NotificationMapper.toResponseDto(await this.notificationService.markAsRead(id, req.user.id));
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req): Promise<NotificationResponseDto[]> {
        return NotificationMapper.toArrayResponseDto(await this.notificationService.markAllAsRead(req.user.id));
    }
}