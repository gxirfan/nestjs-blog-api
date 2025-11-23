import { IPostResponse } from "../interfaces/post-response.interface";
import { PostDocument } from "../schemas/post.schema";

export class PostMapper {
    public static toResponseDto(posts: PostDocument[]): IPostResponse[] {
        if (!posts) return [];
        
        return posts.map(postDoc => {
            const postObject = postDoc.toObject({ virtuals: true });
            const userObject = postObject.userId;
            const topicObject = postObject.topicId;
            const parentObject = postObject.parentId;

            const response: IPostResponse = {
                id: postObject.id,
                title: postObject.title,
                slug: postObject.slug,
                content: postObject.content,
                userId: userObject.id,
                author: userObject.firstName + ' ' + userObject.lastName,
                authorNickname: userObject.nickname,
                authorBio: userObject.bio,
                authorRole: userObject.role,
                
                topicId: topicObject.id,
                topicTitle: topicObject.title,
                topicSlug: topicObject.slug,
                topicTagId: topicObject.tagId,
                
                parentId: parentObject?.id || null || undefined,
                parentTitle: parentObject?.title || null || undefined,
                parentSlug: parentObject?.slug || null || undefined,
                parentContent: parentObject?.content || null || undefined,
                parentUserId: parentObject?.userId || null || undefined,
                parentAuthor: parentObject?.author || null || undefined,
                parentAuthorNickname: parentObject?.authorNickname || null || undefined,
                parentAuthorBio: parentObject?.authorBio || null || undefined,
                parentAuthorRole: parentObject?.authorRole || null || undefined,

                viewCount: postObject.viewCount,
                postCount: postObject.postCount,

                lastPostAt: postObject.lastPostAt?.toISOString() || null || undefined,
                
                status: postObject.status,

                createdAt: postObject.createdAt.toISOString(),
                updatedAt: postObject.updatedAt.toISOString(),
                
            };
            return response;
        });
    }

    public static toSingleResponseDto(postDoc: PostDocument): IPostResponse {
        return this.toResponseDto([postDoc])[0] as IPostResponse;
    }
}
