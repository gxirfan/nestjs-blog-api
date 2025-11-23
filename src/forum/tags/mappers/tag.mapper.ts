import { TagDocument } from '../schemas/tag.schema';
import { ITagResponse } from '../interfaces/tag.response.interface';

export class TagMapper {
    public static toResponseDto(tags: TagDocument[]): ITagResponse[] {
        if (!tags || tags.length === 0) return [];
        
        return tags.map(tagDoc => {
            const tagObject = tagDoc.toObject({ virtuals: true });
            const userObject = tagObject.userId; 

            const response: ITagResponse = {
                id: tagObject.id, 
                title: tagObject.title,
                description: tagObject.description,
                slug: tagObject.slug,
                
                userId: userObject.id,
                username: userObject.username,
                userRole: userObject.role,
                nickname: userObject.nickname,
                author: userObject.firstName + ' ' + userObject.lastName,
                email: userObject.email,

                createdAt: tagObject.createdAt.toISOString(),
                updatedAt: tagObject.updatedAt.toISOString(),
                status: tagObject.status,
            };
            return response;
        });
    }

    public static toSingleResponseDto(tagDoc: TagDocument): ITagResponse {
        return TagMapper.toResponseDto([tagDoc])[0] as ITagResponse;
    }
}