import GetBalanceDTO from './dto/get-balance.dto';
import GetWalletDTO from './dto/get-wallet.dto';
import { Web3Service } from 'nest-web3';
import GetTransactionDTO from './dto/get-transaction.dto';
import TransferDTO from './dto/transfer.dto';
import CheckTransactionDTO from './dto/check-transaction.dto';
import GetGasEstimateDTO from './dto/get-gas-estimate.dto';
import TransferGasDTO from './dto/transfer-gas.dto';
import CreateTransferObjectDTO from './dto/create-transfer-object.dto';
export declare class WalletService {
    private readonly web3Service;
    constructor(web3Service: Web3Service);
    private client;
    private usdtContract;
    create(): Promise<import("web3-core").Account>;
    importWallet(privateKey: string): import("web3-core").Account;
    getBalance(req: GetBalanceDTO): Promise<{
        bnb: number;
        usdt: number;
    }>;
    getTransactions(req: GetTransactionDTO): Promise<any>;
    checkTransactions(req: CheckTransactionDTO): Promise<number>;
    getWallet(req: GetWalletDTO): Promise<{
        balance: {
            bnb: number;
            usdt: number;
        };
    }>;
    gasEstimate(req: GetGasEstimateDTO): Promise<number>;
    transferGas(req: TransferGasDTO): Promise<string>;
    transfer(req: TransferDTO): Promise<import("web3-core").TransactionReceipt>;
    createTransactionObject(req: CreateTransferObjectDTO): Promise<{
        nonce: string;
        gasLimit: string;
        from: string;
        to: string;
        gasPrice: string;
        data: any;
        value: string;
    }>;
}
