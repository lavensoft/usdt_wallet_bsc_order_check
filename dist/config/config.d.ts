export default class Config {
    static MINIMUM_BNB_GAS: number;
    static FEE_WALLET_ADDRESS: string;
    static FEE_WALLET_PRIV_KEY: string;
    static BSC_END_POINT: string;
    static BSC_SC_END_POINT: string;
    static BSC_SC_API_KEY: string;
    static BSC_CLIENT: string;
    static USDT_ADDRESS: string;
    static USDT_ABI: ({
        inputs: any[];
        payable: boolean;
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        name?: undefined;
        constant?: undefined;
        outputs?: undefined;
    } | {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        payable?: undefined;
        stateMutability?: undefined;
        constant?: undefined;
        outputs?: undefined;
    } | {
        constant: boolean;
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        payable: boolean;
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
}
