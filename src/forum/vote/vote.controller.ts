import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { VoteMapper } from './mapper/vote.mapper';
import { VoteResponseDto } from './dtos/vote-response.dto';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dtos/create-vote.dto';
import { GetVoteStatusDto } from './dtos/get-vote-status.dto';
import { VoteDocument } from './schemas/vote.schema';

@UseInterceptors(TransformInterceptor)
@Controller('vote')
export class VoteController {
    constructor(private readonly voteService: VoteService) {}

    @UseGuards(AuthenticatedGuard)
    @Post()
    async createVote(@Req() req, @Body() voteDto: CreateVoteDto): Promise<VoteDocument | null> {
        return this.voteService.createVote(req.user.id, voteDto);
    }

    @UseGuards(AuthenticatedGuard)
    @Get()
    async findOneByUser(@Req() req, @Query() voteDto: GetVoteStatusDto): Promise<VoteResponseDto | null> {
        const vote = await this.voteService.findOneByUser(req.user.id, voteDto);
        if (!vote) return null;
        return VoteMapper.toResponseDto(vote);
    }

    @UseGuards(AuthenticatedGuard)
    @Get('user-voted-post-list')
    async findUserVotedPostList(@Req() req): Promise<VoteResponseDto[]> {
        return VoteMapper.toResponseDtoList(await this.voteService.findUserVotedPostList(req.user.id));
    }
}
