import { Module } from '@nestjs/common';
import { TokensBlacklistService } from './services/tokens_blacklist.service';

@Module({
  providers: [TokensBlacklistService],
  exports: [TokensBlacklistService]
})
export class TokensBlacklistModule {}
