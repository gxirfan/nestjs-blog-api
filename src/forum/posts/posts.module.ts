import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { UserModule } from 'src/user/user.module';
import { TopicsModule } from 'src/forum/topics/topics.module';
import { CensorModule } from 'src/common/censor/censor.module';

@Module({
  providers: [PostsService],
  controllers: [PostsController],
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UserModule,
    TopicsModule,
    CensorModule
  ],
  exports: [PostsService],
})
export class PostsModule {}
