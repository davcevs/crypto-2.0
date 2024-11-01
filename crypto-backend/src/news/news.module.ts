import { NewsController } from './news.controller';
import { NewsService } from './news.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
