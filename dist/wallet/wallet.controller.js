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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
const config_1 = require("../config/config");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async create() {
        try {
            const wallet = await this.walletService.create();
            return {
                wallet,
            };
        }
        catch (e) {
            return new common_1.HttpException('Failed to create wallet!', common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getWallet(address) {
        try {
            if (!address)
                throw Error();
            const wallet = await this.walletService.getWallet({
                address,
            });
            return {
                wallet,
            };
        }
        catch (e) {
            console.log(e);
            return new common_1.HttpException('Failed to get wallet!', common_1.HttpStatus.FORBIDDEN);
        }
    }
    async getTransactions(address, query) {
        try {
            if (!address)
                throw Error();
            const transactions = await this.walletService.getTransactions({
                ...query,
                address,
                contractAddress: config_1.default.USDT_ADDRESS,
            });
            return {
                transactions,
            };
        }
        catch (e) {
            console.log(e);
            return new common_1.HttpException('Failed to get transactions!', common_1.HttpStatus.FORBIDDEN);
        }
    }
    async transfer(address, body, privateKey) {
        try {
            if (!address || !body.to || !body.amount || !privateKey)
                throw Error();
            const transactions = await this.walletService.transfer({
                ...body,
                address,
                privateKey,
            });
            return {
                tx: transactions,
            };
        }
        catch (e) {
            console.log(e);
            return new common_1.HttpException('Failed to transfer token!', common_1.HttpStatus.FORBIDDEN);
        }
    }
    async checkTransaction(address, query) {
        try {
            if (!address)
                throw Error();
            const amount = await this.walletService.checkTransactions({
                ...query,
                address,
                contractAddress: config_1.default.USDT_ADDRESS,
            });
            return {
                transaction: {
                    amount,
                },
            };
        }
        catch (e) {
            console.log(e);
            return new common_1.HttpException('Failed to get transactions!', common_1.HttpStatus.FORBIDDEN);
        }
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)(':address/transactions'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)(':address/transfer'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('private_key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)(':address/transactions/check'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "checkTransaction", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map