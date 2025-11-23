import { Module } from '@nestjs/common';
import { TagsModule } from './tags/tags.module';
import { TopicsModule } from './topics/topics.module';
import { PostsModule } from './posts/posts.module';

@Module({
    imports: [TagsModule, TopicsModule, PostsModule],
})
export class ForumModule {}
