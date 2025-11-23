import { IAuditFields } from "src/common/interfaces/common.interface";

export interface IPost extends IAuditFields{
    title: string;
    content: string;
    userId: string;
    topicId: string;
    slug: string;
    lastPostAt: Date | null;
    viewCount: number;
    status: boolean;
    parentId: string | null;
}