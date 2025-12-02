import { IAuditFields } from "src/common/interfaces/common.interface";

export class PostResponseDto implements IAuditFields{
    id: string;
    title: string;
    slug: string;
    content: string;
    userId: string;
    author: string;
    authorNickname: string;
    authorBio: string;
    authorRole: string;
    
    topicId: string;
    topicTitle: string;
    topicSlug: string;
    topicTagId: string;

    parentId?: string;
    parentTitle?: string;
    parentSlug?: string;
    parentContent?: string;
    postCount?: number;
    viewCount: number;

    lastPostAt?: Date;

    parentUserId?: string;
    parentAuthor?: string;
    parentAuthorNickname?: string;
    parentAuthorBio?: string;
    parentAuthorRole?: string;
    status: boolean;

    createdAt: Date;
    updatedAt: Date;
}