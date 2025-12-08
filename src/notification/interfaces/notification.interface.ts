export interface INotification {
    recipientId: string;
    senderId: string;
    type: string;
    message: string;
    targetUrl: string;
    relatedPostId: string;
    isRead: boolean;
}
