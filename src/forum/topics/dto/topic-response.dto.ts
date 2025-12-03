import { IAuditFields } from "src/common/interfaces/common.interface";

export class TopicResponseDto implements IAuditFields {
    id: string;
    title: string;
    slug: string;
    content: string;
    tagId: string;
    tagTitle: string;
    tagSlug: string;
    tagDescription: string;
    userId: string;
    author: string;
    authorAvatar: string;
    authorUsername: string;
    authorNickname: string;
    authorBio: string;
    authorRole: string;

    viewCount: number;

    lastPostAt: Date;
    postCount: number;
    status: boolean;

    createdAt: Date;
    updatedAt: Date;
}