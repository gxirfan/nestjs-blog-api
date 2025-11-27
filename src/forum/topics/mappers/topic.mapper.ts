import { TopicDocument } from '../schemas/topic.schema';
import { ITopicResponse } from '../interfaces/topic-response.interface';

export class TopicMapper {

    public static toResponseDto(topics: TopicDocument[]): ITopicResponse[] {
        if (!topics || topics.length === 0) return [];
        
        return topics.map((topicDoc) => {
            const topicObject = topicDoc.toObject({ virtuals: true });
            
            const author = topicObject.userId; 
            const tag = topicObject.tagId;

            const response: ITopicResponse = {
                id: topicObject.id,
                title: topicObject.title,
                slug: topicObject.slug,
                content: topicObject.content,
                
                tagId: tag.id,
                tagTitle: tag.title, 
                tagSlug: tag.slug,
                tagDescription: tag.description,
                
                viewCount: topicObject.viewCount,
                postCount: topicObject.postCount,

                userId: author.id,
                authorUsername: author.username,
                authorNickname: author.nickname,
                authorBio: author.bio,
                authorRole: author.role,
                author: `${author.firstName} ${author.lastName}`,
                lastPostAt: topicObject.lastPostAt.toISOString(),
                createdAt: topicObject.createdAt.toISOString(),
                updatedAt: topicObject.updatedAt.toISOString(),
                status: topicObject.status,
            };
            
            return response;
        });
    }

    public static toSingleResponseDto(topic: TopicDocument): ITopicResponse {
    return TopicMapper.toResponseDto([topic])[0] as ITopicResponse;
    }
}