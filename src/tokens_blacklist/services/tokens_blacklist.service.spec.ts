import { Test, TestingModule } from '@nestjs/testing';
import { TokensBlacklistService } from './tokens_blacklist.service';

describe('TokensBlacklistService', () => {
  let service: TokensBlacklistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokensBlacklistService],
    }).compile();

    service = module.get<TokensBlacklistService>(TokensBlacklistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
