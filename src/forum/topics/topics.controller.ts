import { Controller, UseGuards, Post, Req, Body, Get, Param, UseInterceptors, SerializeOptions, Patch, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CreateTopicDto } from './dto/create-topic.dto';
import { TopicResponseDto } from './dto/topic-response.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { TopicMapper } from './mappers/topic.mapper';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CensorInterceptor } from 'src/common/censor/censor.interceptor';
import { IPaginationResponse } from 'src/common/interfaces/pagination-response.interface';

@UseInterceptors(TransformInterceptor)
@Controller('topics')
export class TopicsController {
    constructor(private readonly topicsService: TopicsService) {}

    @UseGuards(AuthenticatedGuard)
    @UseInterceptors(CensorInterceptor)
    @Post()
    async createTopic(@Req() req, @Body() createTopicDto: CreateTopicDto): Promise<TopicResponseDto> {
        return TopicMapper.toSingleResponseDto(await this.topicsService.createTopic(req.user.id, createTopicDto));
    }

    @Get()
    @ResponseMessage('Topics fetched successfully.')
    async findAll(): Promise<TopicResponseDto[]> { 
        return TopicMapper.toResponseDto(await this.topicsService.findAll());
    }

    @Get('all')
    @ResponseMessage('Topics fetched successfully.')
    async findAllPaginated(@Query() query: PaginationQueryDto): Promise<IPaginationResponse<TopicResponseDto>> {
        const { data, meta } = await this.topicsService.findAllPaginated(query);
        return { data: TopicMapper.toResponseDto(data), meta };
    }

    @Get('all/:tagId')
    @ResponseMessage('Topics fetched successfully.')
    async findAllByTagIdPaginated(@Param('tagId') tagId: string, @Query() query: PaginationQueryDto): Promise<IPaginationResponse<TopicResponseDto>> {
        const { data, meta } = await this.topicsService.findAllByTagIdPaginated(tagId, query);
        return { data: TopicMapper.toResponseDto(data), meta };
    }

    @Get('all/library/my-topics')
    @ResponseMessage('Topics fetched successfully.')
    async findAllByUserIdForLibraryMyTopicsPaginated(@Req() req, @Query() query: PaginationQueryDto): Promise<IPaginationResponse<TopicResponseDto>> {
        const { data, meta } = await this.topicsService.findAllByUserIdForLibraryMyTopicsPaginated(req.user.id, query);
        return { data: TopicMapper.toResponseDto(data), meta };
    }

    @Get(':slug')
    @ResponseMessage('Topic fetched successfully.')
    async findOneBySlug(@Req() req, @Param('slug') slug: string): Promise<TopicResponseDto> {
        const clientIdentifier = req.user?.id || req.ip;
        const topic = await this.topicsService.findOneBySlug(req.user?.id, slug);
        this.topicsService.incrementViewCount(topic.id, clientIdentifier);
        return TopicMapper.toSingleResponseDto(topic);
    }

    @Get(':tagId')
    @ResponseMessage('Topics fetched successfully.')
    async findOneByTagId(@Param('tagId') tagId: string): Promise<TopicResponseDto[]> {
        return TopicMapper.toResponseDto(await this.topicsService.findOneByTagId(tagId));
    }

    @UseGuards(AuthenticatedGuard)
    @UseInterceptors(CensorInterceptor)
    @Patch(':id')
    @ResponseMessage('Topic updated successfully.')
    async updateOneById(@Req() req, @Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto): Promise<TopicResponseDto> {
        return TopicMapper.toSingleResponseDto(await this.topicsService.updateOneById(id, req.user.id, updateTopicDto));
    }
}
