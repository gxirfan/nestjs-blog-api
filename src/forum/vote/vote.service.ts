import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from './schemas/vote.schema';
import { EntityType } from './enums/entity-type.enum';
import { PostsService } from '../posts/posts.service';
import { GetVoteStatusDto } from './dtos/get-vote-status.dto';
import { CreateVoteDto } from './dtos/create-vote.dto';
import { UserService } from '../../user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VoteCreatedEvent } from 'src/notification/events/notification.events';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class VoteService {
    private readonly MAX_CLAPS_PER_USER = 1;

    constructor(
        @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
        private postService: PostsService,
        private userService: UserService,
        private eventEmitter: EventEmitter2,
        // @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    ) { }

    async findOneByUser(userId: string, queryDto: GetVoteStatusDto): Promise<VoteDocument | null> {
        const { postId, type } = queryDto;

        const vote = await this.voteModel.findOne({ userId, postId, type })
        .populate({ path: 'userId', select: 'username role nickname firstName lastName email avatar' })
        .populate({ path: 'postId', select: 'title content slug' })
        .exec();

        if (!vote) return null;

        return vote;
    }

    async findUserVotedPostList(userId: string): Promise<VoteDocument[]> {
        return this.voteModel.find({ userId, type: EntityType.POST })
            .populate({ path: 'postId', select: 'title slug content score' })
            .populate({ path: 'userId', select: 'username nickname' })
            .exec();
    }

    async createVote(userId: string, voteDto: CreateVoteDto): Promise<VoteDocument | null> {
        const { postId, type, direction } = voteDto;
        const filter = { userId, postId, type };
    
        const existingVote = await this.voteModel.findOne(filter);
        const existingDirection = existingVote ? existingVote.direction : 0;
    
        let result: VoteDocument | null = null;
    
        if (existingDirection === direction || direction === 0) {
            await this.voteModel.findOneAndDelete(filter);
            result = null;
    
        } else {
            result = await this.voteModel.findOneAndUpdate(
                filter,
                { $set: { direction: direction } },
                { upsert: true, new: true }
            );
        }

        if (result){
            const post = await this.postService.findOne(postId);
            const voter = await this.userService.findOneById(userId);
            if (post) {
                this.eventEmitter.emit(
                    'vote.created',
                    new VoteCreatedEvent(
                        post.id,
                        post.title,
                        post.slug,
                        userId,
                        voter.username,
                        voter.nickname,
                        voteDto.direction,
                        (post.userId as any).id
                    )
                );
            }
        }
    
        //Denormalization
        await this.updateEntityTotalScores(postId, type);
    
        return result;
    }

    private getEntityService(type: EntityType): any {
        switch (type) {
            case EntityType.POST:
                return this.postService;
            default:
                throw new NotFoundException(`Invalid entity type: ${type}`);
        }
    }

    async updateEntityTotalScores(postId: string, type: EntityType): Promise<void> {
    
        const aggregationResult = await this.voteModel.aggregate([
            { $match: { postId, type } },
            { 
                $group: {
                    _id: null,
                    score: { $sum: '$direction' },
                    upvotes: { $sum: { $cond: [{ $eq: ['$direction', 1] }, 1, 0] } },
                    downvotes: { $sum: { $cond: [{ $eq: ['$direction', -1] }, 1, 0] } },
                }
            }
        ]);
    
        const data = aggregationResult[0] || {};
    
        const entityService = this.getEntityService(type);
    
        await entityService.updateTotalScores(
            postId,
            data.score || 0,
            data.upvotes || 0,
            data.downvotes || 0,
        );
    }
}