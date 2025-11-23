import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactDto } from './dto/contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';
import { Model } from 'mongoose';

@Injectable()
export class ContactService {
  constructor(@InjectModel(ContactMessage.name) private contactMessageModel: Model<ContactMessageDocument>) {}

  async handleContactSubmission(data: ContactDto): Promise<ContactMessageDocument> {
    const contactMessage = new this.contactMessageModel(data);
    return contactMessage.save();
  }

  async findAll(): Promise<ContactMessageDocument[]> {
    return this.contactMessageModel.find().exec();
  }

  async findOneById(id: string): Promise<ContactMessageDocument> {
    const contactMessage = await this.contactMessageModel.findById(id).exec();
    if (!contactMessage) {
      throw new NotFoundException('Contact message not found');
    }
    return contactMessage;
  }

  async update(id: string, contactMessage: ContactDto): Promise<ContactMessageDocument> {
    const updatedContactMessage = await this.contactMessageModel.findByIdAndUpdate(id, contactMessage, { new: true }).exec();
    if (!updatedContactMessage) {
      throw new NotFoundException('Contact message not found');
    }
    return updatedContactMessage;
  }

  async delete(id: string): Promise<ContactMessageDocument> {
    const deletedContactMessage = await this.contactMessageModel.findByIdAndDelete(id).exec();
    if (!deletedContactMessage) {
      throw new NotFoundException('Contact message not found');
    }
    return deletedContactMessage;
  }
}