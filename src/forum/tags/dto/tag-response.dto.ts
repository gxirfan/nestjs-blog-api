import { IAuditFields } from "src/common/interfaces/common.interface";

export class TagResponseDto implements IAuditFields {
    id: string;
    title: string;
    description: string;
    slug: string;
    userId: string;
    username: string;
    nickname: string;
    author: string;
    authorAvatar: string;
    authorUsername: string;
    userRole: string;
    email: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}