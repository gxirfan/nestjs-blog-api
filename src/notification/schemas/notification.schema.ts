import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Post } from 'src/forum/posts/schemas/post.schema';
import { INotification } from '../interfaces/notification.interface';

export type NotificationDocument = INotification & Document;

export enum NotificationType {
  VOTE_UP = 'vote_up',
  VOTE_DOWN = 'vote_down',
  REPLY = 'reply',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  recipientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ required: true })
  targetUrl: string;

  @Prop({ type: Types.ObjectId, ref: Post.name })
  relatedPostId: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);