import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicsService } from './topics.service';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { UserModule } from 'src/user/user.module'; // userId için
import { TopicsController } from './topics.controller';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
    TagsModule,
    UserModule,
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}