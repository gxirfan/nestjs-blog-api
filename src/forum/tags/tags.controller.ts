import { Controller, Post, Body, Get, Param, UseGuards, Req, UseInterceptors, HttpCode, HttpStatus, SerializeOptions, Patch, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { TagMapper } from './mappers/tag.mapper';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CensorInterceptor } from 'src/common/censor/censor.interceptor';
import { IPaginationResponse } from 'src/common/interfaces/pagination-response.interface';

@UseInterceptors(TransformInterceptor)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @UseGuards(AuthenticatedGuard)
    @UseInterceptors(CensorInterceptor)
    @Post()
    async createTag(@Req() req, @Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
        return TagMapper.toSingleResponseDto(await this.tagsService.createTag(req.user.id, createTagDto));
    }

    @Get('all')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ResponseMessage("All tags fetched successfully.")
    async findAllPaginated(@Query() query: PaginationQueryDto): Promise<IPaginationResponse<TagResponseDto>> {
        const { data, meta } = await this.tagsService.findAllPaginated(query);
        return { data: TagMapper.toResponseDto(data), meta };
    }

    @Get('all/library/my-tags')
    @ResponseMessage("All tags fetched successfully.")
    async findAllByUserIdForLibraryMyTagsPaginated(@Req() req, @Query() query: PaginationQueryDto): Promise<IPaginationResponse<TagResponseDto>> {
        const { data, meta } = await this.tagsService.findAllByUserIdForLibraryMyTagsPaginated(req.user.id, query);
        return { data: TagMapper.toResponseDto(data), meta };
    }

    @Get()
    @ResponseMessage("All tags fetched successfully.")
    async findAll(): Promise<TagResponseDto[]> {
        return TagMapper.toResponseDto(await this.tagsService.findAll()); 
    }

    @Get(':slug')
    @ResponseMessage("Tag fetched successfully.")
    async findOneBySlug(@Req() req, @Param('slug') slug: string): Promise<TagResponseDto> {
        return TagMapper.toSingleResponseDto(await this.tagsService.findOneBySlug(req.user?.id, slug));
    }

    @UseGuards(AuthenticatedGuard)
    @UseInterceptors(CensorInterceptor)
    @Patch(':id')
    @ResponseMessage('Tag updated successfully.')
    async updateOneById(@Req() req, @Param('id') id: string, @Body() updateTagDto: UpdateTagDto): Promise<TagResponseDto> {
        return TagMapper.toSingleResponseDto(await this.tagsService.updateOneById(id, req.user.id, updateTagDto));
    }
}
