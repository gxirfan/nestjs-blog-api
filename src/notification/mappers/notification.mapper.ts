import { NotificationDocument } from '../schemas/notification.schema';
import { NotificationResponseDto } from '../dto/notification.response.dto';
import { IPaginationResponse } from 'src/common/interfaces/pagination-response.interface';

export class NotificationMapper {
    
    public static toResponseDto(document: NotificationDocument): NotificationResponseDto {
        const doc = document.toObject ? document.toObject({ virtuals: true }) : document;
        const sender = doc.senderId ? doc.senderId : null;

        return {
            id: doc._id.toString(),
            senderId: sender?.id ? sender.id.toString() : '',
            senderUsername: sender?.username,
            senderNickname: sender?.nickname,
            senderAvatar: sender?.avatar,
            recipientId: doc.recipientId ? doc.recipientId.toString() : '',
            type: doc.type,
            message: doc.message,
            targetUrl: doc.targetUrl,
            relatedPostId: doc.relatedPostId ? doc.relatedPostId.toString() : '', 
            isRead: doc.isRead,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
        };
    }

    public static toArrayResponseDto(document: NotificationDocument[]): NotificationResponseDto[] {
        return document.map(doc => this.toResponseDto(doc));
    }

    public static toPaginatedResponseDto(
        source: IPaginationResponse<NotificationDocument>
    ): IPaginationResponse<NotificationResponseDto> {
        return {
            data: source.data.map(doc => this.toResponseDto(doc)),
            meta: source.meta,
        };
    }
}