import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote } from './schemas/vote.schema';
import { VoteSchema } from './schemas/vote.schema';
import { PostsModule } from '../posts/posts.module';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vote.name, schema: VoteSchema },
    ]),
    UserModule,
    PostsModule
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}