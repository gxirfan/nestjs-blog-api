import { Test, TestingModule } from '@nestjs/testing';
import { ClapService } from './vote.service';

describe('ClapService', () => {
  let service: ClapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClapService],
    }).compile();

    service = module.get<ClapService>(ClapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
