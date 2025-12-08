import { IAuditFields } from "src/common/interfaces/common.interface";

export class NotificationResponseDto implements IAuditFields {
    id: string;
    senderId: string;
    senderUsername: string;
    senderNickname: string;
    senderAvatar: string;
    recipientId: string;
    type: string;
    message: string;
    targetUrl: string;
    relatedPostId: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
