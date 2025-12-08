import { TagDocument } from '../schemas/tag.schema';
import { TagResponseDto } from '../dto/tag-response.dto';

export class TagMapper {
    public static toResponseDto(tags: TagDocument[]): TagResponseDto[] {
        if (!tags || tags.length === 0) return [];
        
        return tags.map(tagDoc => {
            const tagObject = tagDoc.toObject({ virtuals: true });
            const userObject = tagObject.userId; 

            const response: TagResponseDto = {
                id: tagObject.id, 
                title: tagObject.title,
                description: tagObject.description,
                slug: tagObject.slug,
                
                userId: userObject.id,
                authorRole: userObject.role,
                authorNickname: userObject.nickname,
                author: userObject.firstName + ' ' + userObject.lastName,
                authorUsername: userObject.username,
                authorAvatar: userObject.avatar,
                email: userObject.email,

                createdAt: tagObject.createdAt.toISOString(),
                updatedAt: tagObject.updatedAt.toISOString(),
                status: tagObject.status,
            };
            return response;
        });
    }

    public static toSingleResponseDto(tagDoc: TagDocument): TagResponseDto {
        return TagMapper.toResponseDto([tagDoc])[0] as TagResponseDto;
    }
}