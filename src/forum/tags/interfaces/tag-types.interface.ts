import { Types } from 'mongoose';
import { TagDocument } from '../schemas/tag.schema';

interface LeanTagObject {
    _id: string | Types.ObjectId; 
    title: string;
    description: string;
    slug: string;
    userId: string | Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    userRole: string;
    nickname: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
}
export type MappableTagData = TagDocument | LeanTagObject;