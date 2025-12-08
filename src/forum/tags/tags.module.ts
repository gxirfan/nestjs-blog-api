import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from './schemas/tag.schema';
import { UserModule } from 'src/user/user.module';
import { CensorModule } from 'src/common/censor/censor.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]),
    CensorModule
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService]
})
export class TagsModule {}
