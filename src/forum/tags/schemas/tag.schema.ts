import { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as tagInterface from "../interfaces/tag.interface";
import { User } from "src/user/schemas/user.schema";

export type TagDocument = tagInterface.ITag & Document;

const tagDocumentToJsonTransformer = (doc, ret) => {
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
    toJSON: { virtuals: true, versionKey: false, transform: tagDocumentToJsonTransformer },
 })
export class Tag {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ required: true, trim: true })
    slug: string;

    @Prop({ required: true, trim: true, type: Types.ObjectId, ref: User.name })
    userId: Types.ObjectId;

    @Prop({ required: true, default: false })
    status: boolean;
}

export const TagSchema = SchemaFactory.createForClass(Tag);