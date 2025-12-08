import { Module } from '@nestjs/common';
import { CensorService } from './censor.service';

@Module({
  providers: [CensorService],
  exports: [CensorService], 
})
export class CensorModule {}