import { ForbiddenException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { ITagResponse } from './interfaces/tag.response.interface';
import { UserService } from 'src/user/user.service';
import { Tag, TagDocument } from './schemas/tag.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateTagDto } from './dto/update-tag.dto';
import slugify from 'slugify';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { MetaDto } from 'src/common/dto/meta.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TagsService {

    constructor(@InjectModel(Tag.name) private readonly tagSchema: Model<TagDocument>, private readonly userService: UserService) {}

    private async createUniqueSlug(title: string): Promise<string> {
        
        const baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;

        let existingTag = await this.tagSchema.exists({ slug }).exec();

        while (existingTag) {
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000; 

            slug = `${baseSlug}-${randomSuffix}`;
            
            existingTag = await this.tagSchema.exists({ slug }).exec();
        }

        return slug;
    }

    async createTag(userId:string, createTagDto: CreateTagDto): Promise<TagDocument> {
        const tag: CreateTagDto = {
            title: createTagDto.title,
            description: createTagDto.description,
            slug: await this.createUniqueSlug(createTagDto.title),
            userId,
        }
        const tagDocument = new this.tagSchema(tag);

        const user = await this.userService.findOneById(userId);
        
        if (!user || Array.isArray(user)) {
            throw new Error('User not found');
        }

        const createdTag = await tagDocument.save();

        const newTag = await this.findOneBySlug(userId, createdTag.slug);

        return newTag;
    }

    async findAllStatusTrue(): Promise<TagDocument[]> {
        return await this.tagSchema.find({ status: true }, {_id: 1}).exec();
    }

    async findAllPaginated(query: PaginationQueryDto): Promise<{ data: TagDocument[], meta: MetaDto }> {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.tagSchema.find({ status: true })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .sort({ createdAt: -1 })
            .exec(),
            this.tagSchema.countDocuments({ status: true }).exec(), 
        ]);

        return { data: tags, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAllByUserIdPaginated(userId:string, query: PaginationQueryDto): Promise<{ data: TagDocument[], meta: MetaDto }> {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.tagSchema.find({ userId })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .sort({ createdAt: -1 })
            .exec(),
            this.tagSchema.countDocuments({ userId }).exec(), 
        ]);

        return { data: tags, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAllByUserIdForLibraryMyTagsPaginated(userId:string, query: PaginationQueryDto): Promise<{ data: TagDocument[], meta: MetaDto }> {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.tagSchema.find({ userId })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .sort({ createdAt: -1 })
            .exec(),
            this.tagSchema.countDocuments({ userId }).exec(), 
        ]);

        return { data: tags, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAll(): Promise<TagDocument[]> {
        return await this.tagSchema.find().populate({ path: 'userId', select: 'username role nickname firstName lastName email' }).sort({ createdAt: -1 }).exec();
    }

    async findOneBySlug(userId: string, slug:string): Promise<TagDocument>{
        const tag = await this.tagSchema.findOne({slug}).populate({ path: 'userId', select: 'username role nickname firstName lastName email' }).exec();

        if (!tag) throw new NotFoundException('Tag not found');

        const user = userId ? await this.userService.findOneById(userId) : null;

        if (user && (user.role === 'admin' || user.role === 'moderator')) return tag;

        if (tag.status === false && user && Object(tag.userId).id !== userId) throw new UnauthorizedException('You are not authorized to view this tag');

        return tag;
    }

    async findOneByIdAsDocument(id:string): Promise<TagDocument>{
        const tag = await this.tagSchema.findById(id).populate({ path: 'userId', select: 'username role nickname firstName lastName email' }).exec();

        if (!tag) throw new NotFoundException('Tag not found');

        return tag;
    }

    async updateOneById(id: string, currentUserId: string, updateTagDto: UpdateTagDto): Promise<TagDocument> {
        const tag = await this.tagSchema.findOne({_id: id, userId: currentUserId}).exec();

        if (!tag) throw new NotFoundException('Tag not found');

        if ((tag && updateTagDto.title) && tag.title !== updateTagDto.title) {
            tag.slug = await this.createUniqueSlug(updateTagDto.title);
        }

        tag.set(updateTagDto);

        const updatedTag = await tag.save();

        if (!updatedTag) {
            const tagExists = await this.tagSchema.exists({ _id: id });

            if (!tagExists) throw new NotFoundException('Tag not found.');
            else throw new ForbiddenException('You do not have permission to update this tag.');
        }
        
        return updatedTag;
    }

    async updateOneByIdAsAdmin(id: string, updateTagDto: UpdateTagDto): Promise<TagDocument> {
        const updatedTag = await this.tagSchema.findOneAndUpdate({ _id: id }, updateTagDto, { new: true }).exec();

        if (!updatedTag) throw new NotFoundException('Tag not found');

        return updatedTag;
    }

    async deleteOneById(id: string): Promise<TagDocument> {
        const deletedTag = await this.tagSchema.findOneAndDelete({ _id: id }).exec();

        if (!deletedTag) throw new NotFoundException('Tag not found');

        return deletedTag;
    }
}
