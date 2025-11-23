import { Controller, Post, Body, Get, Param, UseGuards, Req, UseInterceptors, HttpCode, HttpStatus, SerializeOptions, Patch, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { ITagResponse } from './interfaces/tag.response.interface';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { TagMapper } from './mappers/tag.mapper';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { MetaDto } from 'src/common/dto/meta.dto';

@UseInterceptors(TransformInterceptor)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @UseGuards(AuthenticatedGuard)
    @Post()
    async createTag(@Req() req, @Body() createTagDto: CreateTagDto): Promise<ITagResponse> {
        return TagMapper.toSingleResponseDto(await this.tagsService.createTag(req.user.id, createTagDto));
    }

    @Get('all')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ResponseMessage("All tags fetched successfully.")
    async findAllPaginated(@Query() query: PaginationQueryDto): Promise<{ data: ITagResponse[], meta: MetaDto }> {
        const { data, meta } = await this.tagsService.findAllPaginated(query);
        return { data: TagMapper.toResponseDto(data), meta };
    }

    @Get()
    @ResponseMessage("All tags fetched successfully.")
    async findAll(): Promise<ITagResponse[]> {
        return TagMapper.toResponseDto(await this.tagsService.findAll()); 
    }

    @Get(':slug')
    @ResponseMessage("Tag fetched successfully.")
    async findOneBySlug(@Param('slug') slug: string): Promise<ITagResponse> {
        return TagMapper.toSingleResponseDto(await this.tagsService.findOneBySlug(slug));
    }

    @UseGuards(AuthenticatedGuard)
    @Patch(':id')
    @ResponseMessage('Tag updated successfully.')
    async updateOneById(@Req() req, @Param('id') id: string, @Body() updateTagDto: UpdateTagDto): Promise<ITagResponse> {
        return TagMapper.toSingleResponseDto(await this.tagsService.updateOneById(id, req.user.id, updateTagDto));
    }
}
