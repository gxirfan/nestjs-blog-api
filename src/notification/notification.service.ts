import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { VoteCreatedEvent, ReplyCreatedEvent } from './events/notification.events';
import { IPaginationResponse } from 'src/common/interfaces/pagination-response.interface';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) { }

  // --- EVENT LISTENERS ---

  @OnEvent('vote.created')
  async handleVoteCreated(payload: VoteCreatedEvent) {

    if (payload.voterId === payload.postOwnerId) return;

    // if you want to send notification only for upvote: if (payload.direction !== 1) return;

    const type = payload.direction === 1 ? NotificationType.VOTE_UP : NotificationType.VOTE_DOWN;
    const action = payload.direction === 1 ? 'upvoted' : 'downvoted';

    await this.create({
      recipientId: payload.postOwnerId,
      senderId: payload.voterId,
      type: type,
      message: `@${payload.voterNickname} ${action} your post: "${payload.postTitle.substring(0, 30)}..."`,
      targetUrl: `/post/${payload.postSlug}`,
      relatedPostId: payload.postId,
    });
  }

  @OnEvent('post.reply')
  async handleReplyCreated(payload: ReplyCreatedEvent) {
    if (payload.replierId === payload.postOwnerId) return;

    await this.create({
      recipientId: payload.postOwnerId,
      senderId: payload.replierId,
      type: NotificationType.REPLY,
      message: `@${payload.replierNickname} replied to your post: "${payload.parentPostTitle.substring(0, 30)}..."`,
      targetUrl: `/post/${payload.replySlug}`,
      relatedPostId: payload.parentPostId,
    });
  }

  // --- CRUD ---

  private async create(data: any) {
    return this.notificationModel.create(data);
  }

  async getUserNotifications(userId: string): Promise<IPaginationResponse<NotificationDocument>> {
    const data = await this.notificationModel
      .find({ recipientId: userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username nickname avatar')
      .exec();

    const unreadCount = await this.notificationModel.countDocuments({
      recipientId: userId,
      isRead: false
    });

    return { data, meta: { total: unreadCount } };
  }

  async getUserNotificationsPaginated(userId: string, queryDto: PaginationQueryDto): Promise<IPaginationResponse<NotificationDocument>> {
    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .skip((queryDto.page - 1) * queryDto.limit)
        .limit(queryDto.limit)
        .populate('senderId', 'username nickname avatar')
        .exec(),
      this.notificationModel.countDocuments({ recipientId: userId })
    ]);

    return { data, meta: { total, page: queryDto.page, limit: queryDto.limit, totalPages: Math.ceil(total / queryDto.limit) } };
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) throw new Error('Notification not found.');
    return notification;
  }

  async markAllAsRead(userId: string): Promise<NotificationDocument[]> {
    await this.notificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const updatedNotifications = await this.notificationModel.find({ recipientId: userId, isRead: true });
    if (!updatedNotifications) throw new Error('Notifications not found.');
    return updatedNotifications;
  }
}