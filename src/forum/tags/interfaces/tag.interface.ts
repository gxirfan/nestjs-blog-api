import { IAuditFields } from "src/common/interfaces/common.interface";

export interface ITag extends IAuditFields {
    id: string;
    title: string;
    description: string;
    slug: string;
    userId: string;
}