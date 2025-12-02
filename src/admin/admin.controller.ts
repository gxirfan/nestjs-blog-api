import { Controller, Delete, Get, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { UpdateUserByAdminDto } from 'src/user/dto/update-user.dto';
import { AdminGuard } from './guards/admin.guard';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { TagResponseDto } from 'src/forum/tags/dto/tag-response.dto';
import { TagsService } from 'src/forum/tags/tags.service';
import { TagMapper } from 'src/forum/tags/mappers/tag.mapper';
import { UpdateTagDto } from 'src/forum/tags/dto/update-tag.dto';
import { TopicResponseDto } from 'src/forum/topics/dto/topic-response.dto';
import { TopicMapper } from 'src/forum/topics/mappers/topic.mapper';
import { TopicsService } from 'src/forum/topics/topics.service';
import { UpdateTopicDto } from 'src/forum/topics/dto/update-topic.dto';
import { PostsService } from 'src/forum/posts/posts.service';
import { PostMapper } from 'src/forum/posts/mappers/post.mapper';

@UseGuards(AuthenticatedGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly userService: UserService, private readonly tagService: TagsService, private readonly topicService: TopicsService, private readonly postsService: PostsService) {}

    //user
    @Get('get-users')
    @ResponseMessage('Users fetched successfully.')
    async findAll(): Promise<UserResponseDto[]> {
        return await this.userService.findAll();
    }

    @Get('get-user/:id')
    @ResponseMessage('User fetched successfully.')
    async findOneById(@Param('id') id: string): Promise<UserResponseDto> {
        return await this.userService.findOneById(id);
    }
    
    @Patch('update-user/:id')
    @ResponseMessage('User updated successfully.')
    async updateUser(@Param('id') id: string, @Body() user: UpdateUserByAdminDto): Promise<UserResponseDto> {
        return await this.userService.updateUserByAdmin(id, user);
    }

    @Patch('update-password/:id')
    @ResponseMessage('User password updated successfully.')
    async updatePassword(@Param('id') id: string, @Body() newPassword: string): Promise<UserResponseDto> {
        return await this.userService.updatePasswordByAdmin(id, newPassword);
    }

    @Delete('delete-user/:id')
    @ResponseMessage('User deleted successfully.')
    async deleteUser(@Param('id') id: string): Promise<UserResponseDto> {
        return await this.userService.deleteUser(id);
    }

    //tag
    @Get('get-tags')
    @ResponseMessage('Tags fetched successfully.')
    async findAllTags(): Promise<TagResponseDto[]> {
        return TagMapper.toResponseDto(await this.tagService.findAll());
    }   

    @Get('get-tag/:id')
    @ResponseMessage('Tag fetched successfully.')
    async tagFindOneById(@Param('id') id: string): Promise<TagResponseDto> {
        return TagMapper.toSingleResponseDto(await this.tagService.findOneByIdAsDocument(id));
    }

    @Patch('update-tag/:id')
    @ResponseMessage('Tag updated successfully.')
    async tagUpdateOneById(@Param('id') id: string, @Body() tag: UpdateTagDto): Promise<TagResponseDto> {
        return TagMapper.toSingleResponseDto(await this.tagService.updateOneByIdAsAdmin(id, tag));
    }

    @Delete('delete-tag/:id')
    @ResponseMessage('Tag deleted successfully.')
    async tagDeleteOneById(@Param('id') id: string): Promise<TagResponseDto> {
        return TagMapper.toSingleResponseDto(await this.tagService.deleteOneById(id));
    }

    //topic
    @Get('get-topics')
    @ResponseMessage('Topics fetched successfully.')
    async findAllTopics(): Promise<TopicResponseDto[]> {
        return TopicMapper.toResponseDto(await this.topicService.findAll());
    }

    @Get('get-topic/:id')
    @ResponseMessage('Topic fetched successfully.')
    async topicFindOneById(@Param('id') id: string): Promise<TopicResponseDto> {
        return TopicMapper.toSingleResponseDto(await this.topicService.findOneByIdAsDocument(id));
    }

    @Patch('update-topic/:id')
    @ResponseMessage('Topic updated successfully.')
    async topicUpdateOneById(@Param('id') id: string, @Body() topic: UpdateTopicDto): Promise<TopicResponseDto> {
        return TopicMapper.toSingleResponseDto(await this.topicService.updateOneByIdAsAdmin(id, topic));
    }

    @Delete('delete-topic/:id')
    @ResponseMessage('Topic deleted successfully.')
    async topicDeleteOneById(@Param('id') id: string): Promise<TopicResponseDto> {
        return TopicMapper.toSingleResponseDto(await this.topicService.deleteOneById(id));
    }

    //post
    @Delete('delete-post/:id')
    @ResponseMessage("Post deleted successfully.")
    async deletePost(@Param('id') id: string) {
        return PostMapper.toSingleResponseDto(await this.postsService.delete(id));
    }

}
