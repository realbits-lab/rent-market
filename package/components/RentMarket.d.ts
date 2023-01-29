export default RentMarket;
declare class RentMarket {
    constructor({ accountAddress, rentMarketAddress, localNftContractAddress, blockchainNetwork, onEventFunc, onErrorFunc, }: {
        accountAddress: any;
        rentMarketAddress: any;
        localNftContractAddress: any;
        blockchainNetwork: any;
        onEventFunc: any;
        onErrorFunc: any;
    });
    MAX_LOOP_COUNT: number;
    ALCHEMY_DEFAULT_PAGE_COUNT: number;
    NFT_MODE: string;
    inputBlockchainNetworkName: any;
    alchemy: Alchemy;
    ALCHEMY_BASE_URL: string;
    rentMarketAddress: any;
    localNftContractAddress: any;
    metamaskProvider: any;
    provider: ethers.providers.AlchemyProvider | ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
    signerAddress: string;
    currentBlockchainNetworkName: any;
    rentMarketContract: ethers.Contract;
    testNFTContract: ethers.Contract;
    accountAddress: any;
    onEventFunc: any;
    onErrorFunc: any;
    initializeProvider(): Promise<void>;
    setAlchemyProvider(): Promise<void>;
    initializeData(): Promise<void>;
    clearAllData(): void;
    tokenArray: any[];
    collectionArray: any[];
    serviceArray: any[];
    requestNFTArray: any[];
    registerNFTArray: any[];
    allMyNFTArray: any[] | {
        nftAddress: any;
        tokenId: any;
        metadata: any;
    }[];
    allRentNFTArray: any[];
    pendingRentFeeArray: any[];
    accountBalanceArray: any[];
    myRentNFTArray: any[];
    myRegisteredNFTArray: any;
    myUnregisteredNFTArray: any[] | {
        nftAddress: any;
        tokenId: any;
        metadata: any;
    }[];
    initializeAll(): Promise<void>;
    requestChangeNetwork(): Promise<void>;
    handleAccountsChanged(accounts: any): Promise<void>;
    handleChainChanged(chainId: any): Promise<void>;
    handleDisconnect(): Promise<void>;
    registerEvent(): Promise<void>;
    fetchToken(): Promise<void>;
    fetchCollection(): Promise<void>;
    fetchService(): Promise<void>;
    fetchRegisterData(): Promise<void>;
    fetchPendingRentFee(): Promise<void>;
    fetchAccountBalance(): Promise<void>;
    getRentMarketContract(): ethers.Contract;
    getAllToken(): Promise<any[]>;
    getAllCollection(): Promise<any[]>;
    getAllService(): Promise<any[]>;
    getAllRegisterData(): Promise<any[]>;
    getAllRentData(): Promise<any[]>;
    getAllPendingRentFee(): Promise<any[]>;
    getAllAccountBalance(): Promise<any[]>;
    getMyContentData(): Promise<void>;
    updateMyContentData(): Promise<void>;
    addMetadata(element: any): Promise<any>;
    registerToken(tokenAddress: any, tokenName: any): Promise<void>;
    unregisterToken(element: any): Promise<void>;
    registerCollection(collectionAddress: any, collectionUri: any): Promise<void>;
    unregisterCollection(collectionAddress: any): Promise<void>;
    registerService(serviceAddress: any, serviceName: any): Promise<void>;
    unregisterService(element: any): Promise<void>;
    registerNFT(element: any): Promise<void>;
    changeNFT({ provider, element, rentFee, feeTokenAddress, rentFeeByToken, rentDuration, }: {
        provider: any;
        element: any;
        rentFee: any;
        feeTokenAddress: any;
        rentFeeByToken: any;
        rentDuration: any;
    }): Promise<void>;
    unregisterNFT({ provider, element }: {
        provider: any;
        element: any;
    }): Promise<void>;
    fetchMyNFTDataOnLocalhost(): Promise<{
        nftAddress: any;
        tokenId: any;
        metadata: any;
    }[]>;
    getAllMintTokenOnLocalhost(): Promise<{
        nftAddress: any;
        tokenId: any;
        metadata: any;
    }[]>;
    fetchMyNFTData(): Promise<any[]>;
    isEmpty(value: any): boolean;
    rentNFT({ provider, element, serviceAddress }: {
        provider: any;
        element: any;
        serviceAddress: any;
    }): Promise<void>;
    unrentNFT(element: any): Promise<void>;
    settleRentData({ provider, nftAddress, tokenId }: {
        provider: any;
        nftAddress: any;
        tokenId: any;
    }): Promise<void>;
    withdrawMyBalance({ provider, recipient, tokenAddress }: {
        provider: any;
        recipient: any;
        tokenAddress: any;
    }): Promise<void>;
    isOwnerOrRenter(account: any): Promise<any>;
}
import { Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";
