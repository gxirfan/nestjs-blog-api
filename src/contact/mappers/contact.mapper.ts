import { IContactResponse } from "../interfaces/contact.response.interface";
import { ContactMessageDocument } from "../schemas/contact-message.schema";

export class ContactMapper {
    public static toResponseDto(contactMessage: ContactMessageDocument[]): IContactResponse[] {
        if (!contactMessage) return [];
        
        const contactObject = contactMessage.map((contact) => contact.toObject({ virtuals: true }));
        
        const response: IContactResponse[] = contactObject.map((contact) => ({
            id: contact.id,
            name: contact.name,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            isRead: contact.isRead,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
        }));
        
        return response;
    }

    public static toSingleResponseDto(contactMessage: ContactMessageDocument): IContactResponse {
        return this.toResponseDto([contactMessage])[0] as IContactResponse;
    }
}