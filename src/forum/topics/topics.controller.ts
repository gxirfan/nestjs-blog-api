import { Controller, UseGuards, Post, Req, Body, Get, Param, UseInterceptors, SerializeOptions, Patch, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { CreateTopicDto } from './dto/create-topic.dto';
import { ITopicResponse } from './interfaces/topic-response.interface';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { TopicMapper } from './mappers/topic.mapper';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { MetaDto } from 'src/common/dto/meta.dto';

@UseInterceptors(TransformInterceptor)
@Controller('topics')
export class TopicsController {
    constructor(private readonly topicsService: TopicsService) {}

    @UseGuards(AuthenticatedGuard)
    @Post()
    async createTopic(@Req() req, @Body() createTopicDto: CreateTopicDto): Promise<ITopicResponse> {
        return TopicMapper.toSingleResponseDto(await this.topicsService.createTopic(req.user.id, createTopicDto));
    }

    @Get()
    @ResponseMessage('Topics fetched successfully.')
    async findAll(): Promise<ITopicResponse[]> { 
        return TopicMapper.toResponseDto(await this.topicsService.findAll());
    }

    @Get('all')
    @ResponseMessage('Topics fetched successfully.')
    async findAllPaginated(@Query() query: PaginationQueryDto): Promise<{ data: ITopicResponse[], meta: MetaDto }> {
        const { data, meta } = await this.topicsService.findAllPaginated(query.page, query.limit);
        return { data: TopicMapper.toResponseDto(data), meta };
    }

    @Get('all/:tagId')
    @ResponseMessage('Topics fetched successfully.')
    async findAllByTagIdPaginated(@Param('tagId') tagId: string, @Query() query: PaginationQueryDto): Promise<{ data: ITopicResponse[], meta: MetaDto }> {
        const { data, meta } = await this.topicsService.findAllByTagIdPaginated(tagId, query.page, query.limit);
        return { data: TopicMapper.toResponseDto(data), meta };
    }

    @Get(':slug')
    @ResponseMessage('Topic fetched successfully.')
    async findOneBySlug(@Req() req, @Param('slug') slug: string): Promise<ITopicResponse> {
        const clientIdentifier = req.user?.id || req.ip;
        const topic = await this.topicsService.findOneBySlug(req.user?.id, slug);
        this.topicsService.incrementViewCount(topic.id, clientIdentifier);
        return TopicMapper.toSingleResponseDto(topic);
    }

    @Get(':tagId')
    @ResponseMessage('Topics fetched successfully.')
    async findOneByTagId(@Param('tagId') tagId: string): Promise<ITopicResponse[]> {
        return TopicMapper.toResponseDto(await this.topicsService.findOneByTagId(tagId));
    }

    @UseGuards(AuthenticatedGuard)
    @Patch(':id')
    @ResponseMessage('Topic updated successfully.')
    async updateOneById(@Req() req, @Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto): Promise<ITopicResponse> {
        return TopicMapper.toSingleResponseDto(await this.topicsService.updateOneById(id, req.user.id, updateTopicDto));
    }
}
