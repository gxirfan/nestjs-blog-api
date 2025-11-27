import { IAuditFields } from "src/common/interfaces/common.interface";

export interface ITopic extends IAuditFields {
    id: string;
    title: string;
    slug: string;
    content: string;
    tagId: string;
    userId: string;
    viewCount: number;
    postCount: number;
    status: boolean;
}