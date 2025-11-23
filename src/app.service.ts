import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Welcome to my forum app :) I am c01sdeant |_(^_^)_|';
  }
}
