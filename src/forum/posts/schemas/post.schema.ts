import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IPost } from "../interfaces/post.interface";
import { Document, Types } from "mongoose";
import { User } from "src/user/schemas/user.schema";
import { Topic } from "src/forum/topics/schemas/topic.schema";

export type PostDocument = IPost & Document;

const postDocumentToJsonTransformer = (doc, ret) => {
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
    toJSON: { virtuals: true, versionKey: false, transform: postDocumentToJsonTransformer },
})
export class Post {
    
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true, unique: true, index: true })
    slug: string;
    
    @Prop({ required: true, trim: true })
    content: string;
    
    @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
    userId: Types.ObjectId;
    
    @Prop({ required: true, type: Types.ObjectId, ref: Topic.name, index: true })
    topicId: Types.ObjectId;
    
    @Prop({ required: false, type: Types.ObjectId, ref: Post.name, default: null, index: true })
    parentId: Types.ObjectId | null;

    @Prop({ required: false, type: Number, default: 0 })
    postCount: number;

    @Prop({ required: false, type: Date, default: Date.now })
    lastPostAt: Date | null;

    @Prop({ required: false, type: Number, default: 0 })
    viewCount: number;

    @Prop({ required: true, default: true })
    status: boolean;

    @Prop({ type: Number, default: 0 })
    score: number;
    @Prop({ type: Number, default: 0 })
    upvotes: number;
    @Prop({ type: Number, default: 0 })
    downvotes: number;
}
    
export const PostSchema = SchemaFactory.createForClass(Post);
