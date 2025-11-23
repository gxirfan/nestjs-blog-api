import { IAuditFields } from "src/common/interfaces/common.interface";

export interface IContactMessage extends IAuditFields {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
}