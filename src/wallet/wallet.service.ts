import { Injectable } from '@nestjs/common';
import GetBalanceDTO from './dto/get-balance.dto';
import GetWalletDTO from './dto/get-wallet.dto';
import { Web3Service } from 'nest-web3';
import Config from 'src/config/config';
import axios from 'axios';
import GetTransactionDTO from './dto/get-transaction.dto';
import TransferDTO from './dto/transfer.dto';
import CheckTransactionDTO from './dto/check-transaction.dto';
import GetGasEstimateDTO from './dto/get-gas-estimate.dto';
import TransferGasDTO from './dto/transfer-gas.dto';
import CreateTransferObjectDTO from './dto/create-transfer-object.dto';

@Injectable()
export class WalletService {
  constructor(private readonly web3Service: Web3Service) {}

  private client = this.web3Service.getClient(Config.BSC_CLIENT);
  private usdtContract = new this.client.eth.Contract(
    Config.USDT_ABI as any,
    Config.USDT_ADDRESS,
  );

  async create() {
    const account = this.client.eth.accounts.create();

    return account;
  }

  importWallet(privateKey: string) {
    const account = this.client.eth.accounts.privateKeyToAccount(privateKey);

    return account;
  }

  async getBalance(req: GetBalanceDTO) {
    const bnb = await this.client.eth.getBalance(req.address);
    const usdt = await this.usdtContract.methods.balanceOf(req.address).call();

    return {
      bnb: Number(this.client.utils.fromWei(bnb, 'ether')),
      usdt: Number(this.client.utils.fromWei(usdt, 'ether')),
    };
  }

  async getTransactions(req: GetTransactionDTO) {
    const res = await axios.get(
      `${Config.BSC_SC_END_POINT}?module=account&action=tokentx&contractaddress=${req.contractAddress}&address=${req.address}&page=${req.page}&offset=${req.offset}&apikey=${Config.BSC_SC_API_KEY}&sort=${req.sort}`,
    );

    console.log(res.data.result);

    return (res?.data?.result || []).map((i: any) => ({
      timeStamp: i.timeStamp,
      from: i.from,
      to: i.to,
      value: this.client.utils.fromWei(i.value, 'ether'),
      tokenName: i.tokenName,
      tokenSymbol: i.tokenSymbol,
      gas: i.gas,
      gasPrice: this.client.utils.fromWei(i.gasPrice, 'ether'),
    }));
  }

  async checkTransactions(req: CheckTransactionDTO) {
    const res = await axios.get(
      `${Config.BSC_SC_END_POINT}?module=account&action=tokentx&contractaddress=${req.contractAddress}&address=${req.address}&apikey=${Config.BSC_SC_API_KEY}&sort=desc`,
    );

    const result = res?.data?.result || [];
    let amount = 0;
    const dateUnix = Math.round(new Date(req.fromDate).getTime() / 1000);

    result.forEach((i: any) => {
      if (
        Number(i.timeStamp) >= dateUnix &&
        i.to == req.address.toLowerCase() &&
        i.tokenSymbol == 'USDT'
      ) {
        amount += Number(this.client.utils.fromWei(i.value, 'ether'));
      }
    });

    return amount;
  }

  async getWallet(req: GetWalletDTO) {
    const balance = await this.getBalance(req);

    return {
      balance,
    };
  }

  async gasEstimate(req: GetGasEstimateDTO) {
    const gas = await new Promise((res, rej) => {
      this.usdtContract.methods
        .transfer(
          req.to,
          this.client.utils.toWei(req.amount.toString(), 'ether'),
        )
        .estimateGas({ from: req.address })
        .then((gasAmount: any) => {
          res(gasAmount);
        })
        .catch((error: Error) => rej(error));
    });

    return gas as number;
  }

  async transferGas(req: TransferGasDTO) {
    const senderAddress = this.client.eth.accounts.privateKeyToAccount(
      req.feePrivKey,
    ).address;

    const nonce = await this.client.eth.getTransactionCount(senderAddress);

    const txObject = {
      from: senderAddress,
      to: req.to,
      value: this.client.utils.toWei(req.amount.toString(), 'ether'),
      gas: '21000', // Minimum gas required for a transaction
      gasPrice: this.client.utils.toWei('5', 'gwei'), // Gas price (can be adjusted)
      nonce: nonce,
    };

    const signedTx = await this.client.eth.accounts.signTransaction(
      txObject,
      req.feePrivKey,
    );

    const tx = await this.client.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    return tx.transactionHash;
  }

  async transfer(req: TransferDTO) {
    // const wallet = this.importWallet(req.privateKey);
    const amount = this.client.utils.toHex(
      this.client.utils.toWei(req.amount.toString(), 'ether'),
    );
    const data = this.usdtContract.methods.transfer(req.to, amount).encodeABI();

    const txObject = {
      from: req.address,
      to: Config.USDT_ADDRESS,
      gas: this.client.utils.toHex(210000), // Replace with appropriate gas value
      gasPrice: this.client.utils.toHex(await this.client.eth.getGasPrice()),
      data: data,
    };

    try {
      //Calculate gas
      // const gasPrice = await this.gasEstimate({
      //   address: req.address,
      //   to: req.to,
      //   amount: req.amount,
      // });

      //Get gas balance
      const balance = await this.getBalance({
        address: req.address,
      });

      if (balance.bnb < Config.MINIMUM_BNB_GAS) {
        //Transfer gas
        await this.transferGas({
          amount: Config.MINIMUM_BNB_GAS,
          to: req.address,
          feePrivKey: req.feePrivKey,
        });

        //Check gas balance
        await new Promise((res) => {
          const balanceInterval = setInterval(async () => {
            console.log('CHECK INTERVAL');
            const balance = await this.getBalance({
              address: req.address,
            });

            console.log(balance);

            if (balance.bnb >= Config.MINIMUM_BNB_GAS) {
              res(1);
              clearInterval(balanceInterval);
            }
          }, 3000);
        });
      }

      //Send transaction
      const signedTx = await this.client.eth.accounts.signTransaction(
        txObject,
        req.privateKey,
      );
      const tx = await this.client.eth.sendSignedTransaction(
        signedTx.rawTransaction,
      );
      return tx;
    } catch (error) {
      throw error;
    }
  }

  async createTransactionObject(req: CreateTransferObjectDTO) {
    const amount = this.client.utils.toHex(
      this.client.utils.toWei(req.amount.toString(), 'ether'),
    );
    const data = this.usdtContract.methods.transfer(req.to, amount).encodeABI();

    const txObject = {
      from: req.address,
      to: Config.USDT_ADDRESS,
      gas: this.client.utils.toHex(210000), // Replace with appropriate gas value
      gasPrice: this.client.utils.toHex(await this.client.eth.getGasPrice()),
      data: data,
    };

    return txObject;
  }
}
