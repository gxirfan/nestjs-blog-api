import { Test, TestingModule } from '@nestjs/testing';
import { TopicStatsService } from './topic-stats.service';

describe('TopicStatsService', () => {
  let service: TopicStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TopicStatsService],
    }).compile();

    service = module.get<TopicStatsService>(TopicStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
