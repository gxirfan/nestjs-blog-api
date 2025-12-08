import { VoteDocument } from "../schemas/vote.schema";
import { VoteResponseDto } from "../dtos/vote-response.dto";

export class VoteMapper {
    public static toResponseDtoList(votes: VoteDocument[]): VoteResponseDto[] {
        return votes.map(vote => this.toResponseDto(vote));
    }
    public static toResponseDto(vote: VoteDocument): VoteResponseDto {

        const voteObject = vote.toObject({ virtuals: true });
        const votePostObject = voteObject.postId;
        const voteUserObject = voteObject.userId;
        
        const response: VoteResponseDto = {
            id: voteObject.id,
            userId: voteUserObject.id,
            username: voteUserObject.username,
            nickname: voteUserObject.nickname,

            postId: votePostObject?.id || null || undefined,
            title: votePostObject?.title || null || undefined,
            content: votePostObject?.content || null || undefined,
            slug: votePostObject?.slug || null || undefined,
            type: voteObject?.type || null || undefined,

            direction: voteObject.direction || null || undefined,
            createdAt: voteObject.createdAt || null || undefined,
            updatedAt: voteObject.updatedAt || null || undefined,
        }
        return response;
    }
}
