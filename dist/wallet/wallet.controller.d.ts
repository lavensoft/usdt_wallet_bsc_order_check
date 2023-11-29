import { HttpException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import GetTransactionDTO from './dto/get-transaction.dto';
import TransferDTO from './dto/transfer.dto';
import CheckTransactionDTO from './dto/check-transaction.dto';
import CreateTransferObjectDTO from './dto/create-transfer-object.dto';
export declare class WalletController {
    private walletService;
    constructor(walletService: WalletService);
    create(): Promise<HttpException | {
        wallet: import("web3-core").Account;
    }>;
    getWallet(address: string): Promise<HttpException | {
        wallet: {
            balance: {
                bnb: number;
                usdt: number;
            };
        };
    }>;
    getTransactions(address: string, query: GetTransactionDTO): Promise<HttpException | {
        transactions: any;
    }>;
    transfer(address: string, body: TransferDTO, privateKey: string): Promise<HttpException | {
        tx: import("web3-core").TransactionReceipt;
    }>;
    checkTransaction(address: string, query: CheckTransactionDTO): Promise<HttpException | {
        transaction: {
            amount: number;
        };
    }>;
    createTransactionObject(body: CreateTransferObjectDTO): Promise<HttpException | {
        nonce: string;
        gasLimit: string;
        from: string;
        to: string;
        gasPrice: string;
        data: any;
        value: string;
    }>;
}
