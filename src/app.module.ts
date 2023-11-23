import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { Web3Module } from 'nest-web3';
import Config from './config/config';

@Module({
  imports: [
    WalletModule,
    Web3Module.forRoot({
      name: Config.BSC_CLIENT,
      url: Config.BSC_END_POINT,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
