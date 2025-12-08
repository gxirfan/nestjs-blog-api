import { IAuditFields } from "src/common/interfaces/common.interface";

export class TagResponseDto implements IAuditFields {
    id: string;
    title: string;
    description: string;
    slug: string;
    userId: string;
    authorNickname: string;
    author: string;
    authorAvatar: string;
    authorUsername: string;
    authorRole: string;
    email: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}