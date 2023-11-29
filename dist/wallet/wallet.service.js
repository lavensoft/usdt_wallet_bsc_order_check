"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const nest_web3_1 = require("nest-web3");
const config_1 = require("../config/config");
const axios_1 = require("axios");
let WalletService = class WalletService {
    constructor(web3Service) {
        this.web3Service = web3Service;
        this.client = this.web3Service.getClient(config_1.default.BSC_CLIENT);
        this.usdtContract = new this.client.eth.Contract(config_1.default.USDT_ABI, config_1.default.USDT_ADDRESS);
    }
    async create() {
        const account = this.client.eth.accounts.create();
        return account;
    }
    importWallet(privateKey) {
        const account = this.client.eth.accounts.privateKeyToAccount(privateKey);
        return account;
    }
    async getBalance(req) {
        const bnb = await this.client.eth.getBalance(req.address);
        const usdt = await this.usdtContract.methods.balanceOf(req.address).call();
        return {
            bnb: Number(this.client.utils.fromWei(bnb, 'ether')),
            usdt: Number(this.client.utils.fromWei(usdt, 'ether')),
        };
    }
    async getTransactions(req) {
        const res = await axios_1.default.get(`${config_1.default.BSC_SC_END_POINT}?module=account&action=tokentx&contractaddress=${req.contractAddress}&address=${req.address}&page=${req.page}&offset=${req.offset}&apikey=${config_1.default.BSC_SC_API_KEY}&sort=${req.sort}`);
        console.log(res.data.result);
        return (res?.data?.result || []).map((i) => ({
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
    async checkTransactions(req) {
        const res = await axios_1.default.get(`${config_1.default.BSC_SC_END_POINT}?module=account&action=tokentx&contractaddress=${req.contractAddress}&address=${req.address}&apikey=${config_1.default.BSC_SC_API_KEY}&sort=desc`);
        const result = res?.data?.result || [];
        let amount = 0;
        const dateUnix = Math.round(new Date(req.fromDate).getTime() / 1000);
        result.forEach((i) => {
            if (Number(i.timeStamp) >= dateUnix &&
                i.to == req.address.toLowerCase() &&
                i.tokenSymbol == 'USDT') {
                amount += Number(this.client.utils.fromWei(i.value, 'ether'));
            }
        });
        return amount;
    }
    async getWallet(req) {
        const balance = await this.getBalance(req);
        return {
            balance,
        };
    }
    async gasEstimate(req) {
        const gas = await new Promise((res, rej) => {
            this.usdtContract.methods
                .transfer(req.to, this.client.utils.toWei(req.amount.toString(), 'ether'))
                .estimateGas({ from: req.address })
                .then((gasAmount) => {
                res(gasAmount);
            })
                .catch((error) => rej(error));
        });
        return gas;
    }
    async transferGas(req) {
        const senderAddress = this.client.eth.accounts.privateKeyToAccount(req.feePrivKey).address;
        const nonce = await this.client.eth.getTransactionCount(senderAddress);
        const txObject = {
            from: senderAddress,
            to: req.to,
            value: this.client.utils.toWei(req.amount.toString(), 'ether'),
            gas: '21000',
            gasPrice: this.client.utils.toWei('5', 'gwei'),
            nonce: nonce,
        };
        const signedTx = await this.client.eth.accounts.signTransaction(txObject, req.feePrivKey);
        const tx = await this.client.eth.sendSignedTransaction(signedTx.rawTransaction);
        return tx.transactionHash;
    }
    async transfer(req) {
        const amount = this.client.utils.toHex(this.client.utils.toWei(req.amount.toString(), 'ether'));
        const data = this.usdtContract.methods.transfer(req.to, amount).encodeABI();
        const txObject = {
            from: req.address,
            to: config_1.default.USDT_ADDRESS,
            gas: this.client.utils.toHex(210000),
            gasPrice: this.client.utils.toHex(await this.client.eth.getGasPrice()),
            data: data,
        };
        try {
            const balance = await this.getBalance({
                address: req.address,
            });
            if (balance.bnb < config_1.default.MINIMUM_BNB_GAS) {
                await this.transferGas({
                    amount: config_1.default.MINIMUM_BNB_GAS,
                    to: req.address,
                    feePrivKey: req.feePrivKey,
                });
                await new Promise((res) => {
                    const balanceInterval = setInterval(async () => {
                        console.log('CHECK INTERVAL');
                        const balance = await this.getBalance({
                            address: req.address,
                        });
                        console.log(balance);
                        if (balance.bnb >= config_1.default.MINIMUM_BNB_GAS) {
                            res(1);
                            clearInterval(balanceInterval);
                        }
                    }, 3000);
                });
            }
            const signedTx = await this.client.eth.accounts.signTransaction(txObject, req.privateKey);
            const tx = await this.client.eth.sendSignedTransaction(signedTx.rawTransaction);
            return tx;
        }
        catch (error) {
            throw error;
        }
    }
    async createTransactionObject(req) {
        console.log(req);
        const amount = this.client.utils.toHex(this.client.utils.toWei(req.amount.toString(), 'ether'));
        const data = this.usdtContract.methods.transfer(req.to, amount).encodeABI();
        const txObject = {
            from: req.address,
            to: req.to,
            gas: this.client.utils.toHex(210000),
            gasPrice: this.client.utils.toHex(await this.client.eth.getGasPrice()),
            data: data,
        };
        return txObject;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nest_web3_1.Web3Service])
], WalletService);
//# sourceMappingURL=wallet.service.js.map