import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IContactMessage } from '../interfaces/contact.message.interface';

export type ContactMessageDocument = IContactMessage & Document;

const contactMessageDocumentToJsonTransformer = (doc, ret) => {
  if (ret._id?.toString()) {
      ret.id = ret._id.toString();
  }
  delete ret._id;
  delete ret.__v;
  return ret;
};

@Schema({ 
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true, versionKey: false, transform: contactMessageDocumentToJsonTransformer },
})
export class ContactMessage{
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, maxlength: 100 })
  email: string;

  @Prop({ required: true, maxlength: 150 })
  subject: string;

  @Prop({ required: true, maxlength: 1000 })
  message: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);