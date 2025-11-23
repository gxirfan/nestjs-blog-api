import { Injectable, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import slugify from 'slugify';
import { MetaDto } from 'src/common/dto/meta.dto';
import { UserService } from 'src/user/user.service';
import { TopicsService } from 'src/forum/topics/topics.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';

@Injectable()
export class PostsService {
    constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>, private readonly userService: UserService, private readonly topicService: TopicsService, @Inject(CACHE_MANAGER) private cacheManager: cacheManager.Cache) {}

    private async createUniqueSlug(title: string): Promise<string> {
        
        const baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;

        let existingPost = await this.postModel.exists({ slug }).exec();

        while (existingPost) {
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000; 

            slug = `${baseSlug}-${randomSuffix}`;
            
            existingPost = await this.postModel.exists({ slug }).exec();
        }

        return slug;
    }

    private async updateLastPostAt(postId: string) {
        await this.postModel.updateOne({ _id: postId }, { lastPostAt: new Date() }).exec();
    }

    private async updatePostCount(postId: string) {
        await this.postModel.updateOne({ _id: postId }, { postCount: await this.postModel.countDocuments({ parentId: postId, status: true }).exec() }).exec();
    }

    async createPost(userId: string, createPostDto: CreatePostDto) {
        const post = new this.postModel({
            ...createPostDto,
            userId,
            slug: await this.createUniqueSlug(createPostDto.title),
        });

        await this.topicService.updateLastPostAt(createPostDto.topicId);

        

        const savedPost = await post.save();

        if (savedPost && savedPost.parentId) {
            await this.updateLastPostAt(savedPost.parentId);
            await this.updatePostCount(savedPost.parentId);

            await this.topicService.updateLastPostAt(savedPost.topicId);
            await this.topicService.updatePostCount(savedPost.topicId, await this.countDocumentsByTopicId(savedPost.topicId));
        }

        return savedPost;
    }

    public async incrementViewCount(postId: string, clientIdentifier: string): Promise<void> {
        const cacheKey = `VIEWED_POST_${postId}_${clientIdentifier}`;
        
        const viewed = await this.cacheManager.get(cacheKey);

        if (viewed) {
            return;
        }

        this.postModel.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } }).exec();

        this.cacheManager.set(cacheKey, '1', 86400);
    }

    async findAllPaginated(page: number, limit: number): Promise<{data: PostDocument[], meta: MetaDto}> {

        const activeTopics = await this.topicService.findStatusTrue();
        const activeTopicIds = activeTopics.map(topic => topic.id);
        
        const [posts, total] = await Promise.all([
            this.postModel.find({ topicId: { $in: activeTopicIds }, status: true })
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .populate({ path: 'topicId', select: 'title slug tagId' })
            .populate({ path: 'parentId', select: 'title slug' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.postModel.countDocuments({ topicId: { $in: activeTopicIds }, status: true }).exec(), 
        ]);

        return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAll(): Promise<PostDocument[]> {
        const posts = await this.postModel.find().populate({ path: 'userId', select: 'username role nickname firstName lastName email' }).populate({ path: 'topicId', select: 'title slug tagId' }).populate({ path: 'parentId', select: 'title slug' }).sort({ createdAt: -1 }).exec();

        if (!posts) throw new NotFoundException('Posts not found');

        return posts;
    }

    async countDocumentsByTopicId(topicId: string): Promise<number> {
        return this.postModel.countDocuments({ topicId, status: true }).exec();
    }



    async findAllByTopicIdPaginated(topicId: string, page: number, limit: number): Promise<{data: PostDocument[], meta: MetaDto}> {
        const activeTopics = await this.topicService.findStatusTrue();
        const activeTopicIds = activeTopics.map(topic => topic.id).filter(id => id === topicId);

        const [posts, total] = await Promise.all([
            this.postModel.find({ topicId: { $in: activeTopicIds }, status: true })
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .populate({ path: 'topicId', select: 'title slug tagId' })
            .populate({ path: 'parentId', select: 'title slug' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.postModel.countDocuments({ topicId: { $in: activeTopicIds }, status: true }).exec(), 
        ]);
        return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAllByParentIdPaginated(parentId: string, page: number, limit: number): Promise<{data: PostDocument[], meta: MetaDto}> {
        const activeTopics = await this.topicService.findStatusTrue();
        const activeTopicIds = activeTopics.map(topic => topic.id);
        
        const [posts, total] = await Promise.all([
            this.postModel.find({ topicId: { $in: activeTopicIds }, parentId, status: true })
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .populate({ path: 'topicId', select: 'title slug tagId' })
            .populate({ path: 'parentId', select: 'title slug' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.postModel.countDocuments({ topicId: { $in: activeTopicIds }, parentId, status: true }).exec(), 
        ]);
        return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findAllByUserIdForLibraryPaginated(userId: string, page: number, limit: number): Promise<{data: PostDocument[], meta: MetaDto}> {
        const [posts, total] = await Promise.all([
            this.postModel.find({ userId })
            .populate({ path: 'userId', select: 'username role nickname firstName lastName email' })
            .populate({ path: 'topicId', select: 'title slug tagId' })
            .populate({ path: 'parentId', select: 'title slug' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(),
            this.postModel.countDocuments({ userId }).exec(), 
        ]);
        return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit)} };
    }

    async findOne(id: string): Promise<PostDocument> {
        const post = await this.postModel.findById(id).populate({ path: 'userId', select: 'username role nickname firstName lastName email' }).populate({ path: 'topicId', select: 'title slug tagId' }).populate({ path: 'parentId', select: 'title slug' }).sort({ createdAt: -1 }).exec();

        if (!post) throw new NotFoundException('Post not found');

        return post;
    }

    async findOneBySlug(userId: string, slug: string): Promise<PostDocument> {
        const post = await this.postModel.findOne({ slug }).populate({ path: 'userId', select: 'username role nickname firstName lastName email' }).populate({ path: 'topicId', select: 'title slug tagId' }).populate({ path: 'parentId', select: 'title slug' }).sort({ createdAt: -1 }).exec();

        if (!post) throw new NotFoundException('Post not found');

        const topic = await this.topicService.findOneById(post.topicId);

        if (!topic) throw new NotFoundException('Topic not found');

        
        if ((topic.status === false && topic.userId !== userId) || (post.status === false && post.userId !== userId)) throw new UnauthorizedException('You are not authorized to view this topic');

        

        return post;
    }

    async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<PostDocument> {
        // const updatedPost = await this.postModel.findByIdAndUpdate(id, updatePostDto).exec();

        // if (!updatedPost) throw new NotFoundException('Post not found');

        // if (updatedPost.userId.toString() !== userId) throw new UnauthorizedException('You are not authorized to update this post');

        // return updatedPost;

        const post = await this.postModel.findById(id).exec();

        if (!post) throw new NotFoundException('Post not found');

        const user = await this.userService.findOneById(userId);

        if (!user) throw new NotFoundException('User not found');

        if (user.role !== 'admin' && user.role !== 'moderator' && post.userId.toString() !== userId) throw new UnauthorizedException('You are not authorized to update this post');

        if (updatePostDto.title && updatePostDto.title !== post.title) post.slug = await this.createUniqueSlug(updatePostDto.title);

        const updatedPost = await this.postModel.findByIdAndUpdate(post._id, updatePostDto, { new: true }).exec();

        this.updatePostCount(post.id);

        if (!updatedPost) throw new NotFoundException('Post update failed.');

        return updatedPost;
    }

    async updateOneByIdAsAdmin(id: string, updatePostDto: UpdatePostDto): Promise<PostDocument> {
        const updatedPost = await this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();

        if (!updatedPost) throw new NotFoundException('Post not found');

        return updatedPost;
    }

    async delete(id: string): Promise<PostDocument> {
        const deletedPost = await this.postModel.findByIdAndDelete(id).exec();

        if (!deletedPost) throw new NotFoundException('Post not found');

        return deletedPost;
    }
}
