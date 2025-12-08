import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema'; 
import { Tag } from 'src/forum/tags/schemas/tag.schema'; 
import { ITopic } from '../interfaces/topic.interface';

export type TopicDocument = ITopic & Document;

const topicDocumentToJsonTransformer = (doc, ret) => {
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
    toJSON: { virtuals: true, versionKey: false, transform: topicDocumentToJsonTransformer },
})
export class Topic {
    
    @Prop({ required: true, trim: true, unique: true })
    title: string;

    @Prop({ required: true, trim: true })
    content: string; 

    @Prop({ required: true, unique: true, index: true })
    slug: string; 

    @Prop({ required: true, default: 0 })
    postCount: number;

    @Prop({ required: true, default: Date.now })
    lastPostAt: Date; 

    @Prop({ required: false, type: Number, default: 0 })
    viewCount: number;

    
    @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
    userId: Types.ObjectId; 

    @Prop({ type: Types.ObjectId, ref: Tag.name, index: true })
    tagId: Types.ObjectId;

    @Prop({ required: true, default: true })
    status: boolean;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);