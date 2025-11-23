import { Controller, Delete, Get, Param, Patch, Post, Body, Req, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PostMapper } from './mappers/post.mapper';
import { IPostResponse } from './interfaces/post-response.interface';
import { MetaDto } from 'src/common/dto/meta.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@UseInterceptors(TransformInterceptor)
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @UseGuards(AuthenticatedGuard)
    @Post()
    @ResponseMessage("Post created successfully.")
    async createPost(@Req() req, @Body() createPostDto: CreatePostDto): Promise<IPostResponse> {
        return PostMapper.toSingleResponseDto(await this.postsService.createPost(req.user.id, createPostDto));
    }

    @Get('all')
    @ResponseMessage("All posts fetched successfully.")
    async findAllPaginated(@Query() query: PaginationQueryDto): Promise<{data: IPostResponse[], meta: MetaDto}> {
        const { data, meta } = await this.postsService.findAllPaginated(query.page, query.limit);
        return { data: PostMapper.toResponseDto(data), meta };
    }

    @Get('all/topic/:topicId')
    @ResponseMessage("All posts fetched successfully.")
    async findAllByTopicIdPaginated(@Param('topicId') topicId: string, @Query() query: PaginationQueryDto): Promise<{data: IPostResponse[], meta: MetaDto}> {
        const { data, meta } = await this.postsService.findAllByTopicIdPaginated(topicId, query.page, query.limit);
        return { data: PostMapper.toResponseDto(data), meta };
    }

    @Get('all/parent/:parentId')
    @ResponseMessage("All posts fetched successfully.")
    async findAllByParentIdPaginated(@Param('parentId') parentId: string, @Query() query: PaginationQueryDto): Promise<{data: IPostResponse[], meta: MetaDto}> {
        const { data, meta } = await this.postsService.findAllByParentIdPaginated(parentId, query.page, query.limit);
        return { data: PostMapper.toResponseDto(data), meta };
    }

    @Get('all/user/:userId')
    @ResponseMessage("All posts fetched successfully.")
    async findAllByUserIdForLibraryPaginated(@Param('userId') userId: string, @Query() query: PaginationQueryDto): Promise<{data: IPostResponse[], meta: MetaDto}> {
        const { data, meta } = await this.postsService.findAllByUserIdForLibraryPaginated(userId, query.page, query.limit);
        return { data: PostMapper.toResponseDto(data), meta };
    }

    @Get()
    @ResponseMessage("All posts fetched successfully.")
    async findAll(): Promise<IPostResponse[]> {
        return PostMapper.toResponseDto(await this.postsService.findAll());
    }

    @Get(':slug')
    @ResponseMessage("Post fetched successfully.")
    async findOneBySlug(@Req() req, @Param('slug') slug: string): Promise<IPostResponse> {
        const clientIdentifier = req.ip;
        const post = await this.postsService.findOneBySlug(req.user?.id, slug);
        this.postsService.incrementViewCount(post.id, clientIdentifier);
        return PostMapper.toSingleResponseDto(post);
    }

    @Get(':id')
    @ResponseMessage("Post fetched successfully.")
    async findOne(@Param('id') id: string): Promise<IPostResponse> {
        return PostMapper.toSingleResponseDto(await this.postsService.findOne(id));
    }

    @UseGuards(AuthenticatedGuard)
    @Patch(':id')
    @ResponseMessage("Post updated successfully.")
    async update(@Param('id') id: string, @Req() req, @Body() updatePostDto: UpdatePostDto): Promise<IPostResponse> {
        return PostMapper.toSingleResponseDto(await this.postsService.update(id, req.user.id, updatePostDto));
    }
}
