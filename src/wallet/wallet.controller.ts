import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Headers,
  Query,
  Body,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import GetTransactionDTO from './dto/get-transaction.dto';
import Config from 'src/config/config';
import TransferDTO from './dto/transfer.dto';
import CheckTransactionDTO from './dto/check-transaction.dto';

@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  async create() {
    try {
      const wallet = await this.walletService.create();

      return {
        wallet,
      };
    } catch (e) {
      return new HttpException(
        'Failed to create wallet!',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get(':address')
  async getWallet(@Param('address') address: string) {
    try {
      if (!address) throw Error();

      const wallet = await this.walletService.getWallet({
        address,
      });

      return {
        wallet,
      };
    } catch (e) {
      console.log(e);
      return new HttpException('Failed to get wallet!', HttpStatus.FORBIDDEN);
    }
  }

  @Get(':address/transactions')
  async getTransactions(
    @Param('address') address: string,
    @Query() query: GetTransactionDTO,
  ) {
    try {
      if (!address) throw Error();

      const transactions = await this.walletService.getTransactions({
        ...query,
        address,
        contractAddress: Config.USDT_ADDRESS,
      });

      return {
        transactions,
      };
    } catch (e) {
      console.log(e);
      return new HttpException(
        'Failed to get transactions!',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post(':address/transfer')
  async transfer(
    @Param('address') address: string,
    @Body() body: TransferDTO,
    @Headers('private_key') privateKey: string,
  ) {
    try {
      if (!address || !body.to || !body.amount || !privateKey) throw Error();

      const transactions = await this.walletService.transfer({
        ...body,
        address,
        privateKey,
      });

      return {
        tx: transactions,
      };
    } catch (e) {
      console.log(e);
      return new HttpException(
        'Failed to transfer token!',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get(':address/transactions/check')
  async checkTransaction(
    @Param('address') address: string,
    @Query() query: CheckTransactionDTO,
  ) {
    try {
      if (!address) throw Error();

      const amount = await this.walletService.checkTransactions({
        ...query,
        address,
        contractAddress: Config.USDT_ADDRESS,
      });

      return {
        transaction: {
          amount,
        },
      };
    } catch (e) {
      console.log(e);
      return new HttpException(
        'Failed to get transactions!',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
