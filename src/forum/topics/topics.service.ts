import { ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { UserService } from 'src/user/user.service';
import { TagsService } from 'src/forum/tags/tags.service';
import slugify from 'slugify';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { MetaDto } from 'src/common/dto/meta.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class TopicsService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: cacheManager.Cache, @InjectModel(Topic.name) private readonly topicSchema: Model<TopicDocument>, private readonly userService: UserService, private readonly tagService: TagsService) {}

    private async createUniqueSlug(title: string): Promise<string> {
    
        const baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;
    
        let existingTopic = await this.topicSchema.exists({ slug }).exec();
    
        while (existingTopic) {
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000; 
    
            slug = `${baseSlug}-${randomSuffix}`;
            
            existingTopic = await this.topicSchema.exists({ slug }).exec();
        }
    
        return slug;
    }

    async updateLastPostAt(topicId: string): Promise<void> {
        await this.topicSchema.updateOne({ _id: topicId }, { lastPostAt: new Date() }).exec();
    }

    async updatePostCount(topicId: string, postCount: number): Promise<void> {
        await this.topicSchema.updateOne({ _id: topicId }, { postCount }).exec();
    }
    
    async createTopic(userId: string, createTopicDto: CreateTopicDto): Promise<TopicDocument> {
        try {
            const user = await this.userService.findOneById(userId);

            if (!user) throw new NotFoundException('User not found');

            const tag = await this.tagService.findOneByIdAsDocument(createTopicDto.tagId);

            if (!tag) throw new NotFoundException('Tag not found');

            const topic = new this.topicSchema({
                userId: user.id,
                tagId: tag.id,
                title: createTopicDto.title,
                content: createTopicDto.content,
                slug: await this.createUniqueSlug(createTopicDto.title),
            });

            const createdTopic = await topic.save();

            return await this.findOneById(createdTopic.id);
        } catch (error) {
            if (error.code === 11000) throw new ConflictException('Topic already exists');
            throw new InternalServerErrorException('Topic could not be created', error.message);
        }
    }

    public async incrementViewCount(topicId: string, clientIdentifier: string): Promise<void> {
        const cacheKey = `VIEWED_TOPIC_${topicId}_${clientIdentifier}`;
        
        const viewed = await this.cacheManager.get(cacheKey);

        if (viewed) return;

        this.topicSchema.findByIdAndUpdate(topicId, { $inc: { viewCount: 1 } }).exec();

        this.cacheManager.set(cacheKey, '1', 86400);
    }

    async findAll(): Promise<TopicDocument[]> {
        return await this.topicSchema
            .find()
            .populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' })
            .populate({ path: 'tagId', select: 'title description slug' })
            .sort({ lastPostAt: -1 })
            .exec();
    }

    async findStatusTrue(): Promise<TopicDocument[]> {
        const tags = await this.tagService.findAllStatusTrue();
        const tagIds = tags.map(tag => tag.id);
        return await this.topicSchema.find({ tagId: { $in: tagIds }, status: true }, {_id: 1}).exec();
    }

    async findAllPaginated(query: PaginationQueryDto): Promise<{data: TopicDocument[], meta: MetaDto}> {
        const { page, limit } = query;
        const tags = await this.tagService.findAllStatusTrue();
        const tagIds = tags.map(tag => tag.id);

        const [topics, total] = await Promise.all([
            this.topicSchema.find({ tagId: { $in: tagIds } })
            .populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' })
            .populate({ path: 'tagId', select: 'title description slug status', match: { status: true } })
            .sort({ lastPostAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.topicSchema.countDocuments({ tagId: { $in: tagIds } }).exec(), 
        ]);

        return { data: topics, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAllByTagIdPaginated(tagId: string, query: PaginationQueryDto): Promise<{data: TopicDocument[], meta: MetaDto}> {
        const { page, limit } = query;
        const [topics, total] = await Promise.all([
            this.topicSchema.find({ tagId, status: true })
            .populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' })
            .populate({ path: 'tagId', select: 'title description slug status', match: { status: true } })
            .sort({ lastPostAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.topicSchema.countDocuments({ tagId, status: true }).exec(), 
        ]);
        return { data: topics, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAllByUserIdForLibraryMyTopicsPaginated(userId: string, query: PaginationQueryDto): Promise<{data: TopicDocument[], meta: MetaDto}> {
        const { page, limit } = query;
        const [topics, total] = await Promise.all([
            this.topicSchema.find({ userId })
            .populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' })
            .populate({ path: 'tagId', select: 'title description slug status', match: { status: true } })
            .sort({ lastPostAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.topicSchema.countDocuments({ userId }).exec(), 
        ]);
        return { data: topics, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findOneById(id: string): Promise<TopicDocument> {
        const topic = await this.topicSchema.findById(id).populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' }).populate({ path: 'tagId', select: 'title description slug' }).exec();

        if (!topic) throw new NotFoundException('Topic not found');

        return topic;
    }

    async findOneBySlug(userId: string, slug: string): Promise<TopicDocument> {
        const topic = await this.topicSchema.findOne({ slug }).populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' }).populate({ path: 'tagId', select: 'title description slug' }).exec();

        if (!topic) throw new NotFoundException('Topic not found');

        const user = userId ? await this.userService.findOneById(userId) : null;

        if (user && (user.role === 'admin' || user.role === 'moderator')) return topic;
        
        if ((topic.status === false && topic.userId.toString() !== userId)) {
            throw new ForbiddenException('You do not have permission to view this topic.');
        }

        return topic;
    }

    async findOneByTagId(tagId: string): Promise<TopicDocument[]> {
        return await this.topicSchema.find({ tagId }).populate({ path: 'userId', select: 'username nickname firstName lastName bio role avatar' }).populate({ path: 'tagId', select: 'title description slug' }).sort({ lastPostAt: -1 }).exec();
    }

    
        

    async findOneByIdAsDocument(id: string): Promise<TopicDocument> {
        const topic = await this.topicSchema.findById(id).exec();

        if (!topic) throw new NotFoundException('Topic not found');

        return topic;
    }

    async updateOneById(id: string, currentUserId: string, updateTopicDto: UpdateTopicDto): Promise<TopicDocument> {
        // const updatedTopic = await this.topicSchema.findOneAndUpdate({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(currentUserId) }, updateTopicDto, { new: true }).exec();

        const user = await this.userService.findOneById(currentUserId);

        if (!user) throw new NotFoundException('User not found');

        const topic = await this.topicSchema.findOne({ _id: id, userId: currentUserId });

        if (!topic) throw new NotFoundException('Topic not found');

        if ((user.role !== 'admin' && user.role !== 'moderator') && topic.userId.toString() !== currentUserId) throw new ForbiddenException('You do not have permission to update this topic.');

        if (updateTopicDto.title && updateTopicDto.title !== topic.title) topic.slug = updateTopicDto.slug = await this.createUniqueSlug(updateTopicDto.title);

        const updatedTopic = await this.topicSchema.findOneAndUpdate({ _id: topic.id }, updateTopicDto, { new: true }).exec();

        if (!updatedTopic) {
            const topicExists = await this.topicSchema.exists({ _id: topic.id });

            if (!topicExists) throw new NotFoundException('Topic not found.');
            else throw new ForbiddenException('You do not have permission to update this topic.');
        }
        
        return updatedTopic;
    }

    async updateOneByIdAsAdmin(id: string, updateTopicDto: UpdateTopicDto): Promise<TopicDocument> {
        const updatedTopic = await this.topicSchema.findOneAndUpdate({ _id: id }, updateTopicDto, { new: true }).exec();

        if (!updatedTopic) throw new NotFoundException('Topic not found');

        return updatedTopic;
    }

    async deleteOneById(id: string): Promise<TopicDocument> {
        const deletedTopic = await this.topicSchema.findOneAndDelete({ _id: id }).exec();

        if (!deletedTopic) throw new NotFoundException('Topic not found');

        return deletedTopic;
    }
}
