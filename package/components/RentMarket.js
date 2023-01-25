import { ethers } from "ethers";
import axios from "axios";
import detectEthereumProvider from "@metamask/detect-provider";
import { Alchemy, Network } from "alchemy-sdk";

import {
  switchNetworkMumbai,
  switchNetworkLocalhost,
  changeIPFSToGateway,
  isObject,
  AlertSeverity,
  getChainName,
} from "./RentMarketUtil";
import rentMarketABI from "../contracts/rentMarket.json";
import rentNFTABI from "../contracts/rentNFT.json";
import promptNFTABI from "../contracts/promptNFT.json";

// TODO: Set the highest gas limit on every call.
// TODO: Make the return value type as the same as contract return value.
class RentMarket {
  // For alchemy API call max count.
  // TODO: Handle maximum count.
  MAX_LOOP_COUNT = 10;

  //----------------------------------------------------------------------------
  // Alchemy variables.
  //----------------------------------------------------------------------------
  // https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
  ALCHEMY_DEFAULT_PAGE_COUNT = 100;
  NFT_MODE = process.env.NEXT_PUBLIC_NFT_MODE;

  // * -------------------------------------------------------------------------
  // * Constructor function.
  // * -------------------------------------------------------------------------
  constructor({
    rentMarketAddress,
    localNftContractAddress,
    blockchainNetwork,
    onEventFunc,
    onErrorFunc,
  }) {
    // console.log("call constructor()");
    // console.log("onEventFunc: ", onEventFunc);
    // console.log("onErrorFunc: ", onErrorFunc);
    // console.log("rentMarketAddress: ", rentMarketAddress);
    // console.log("localNftContractAddress: ", localNftContractAddress);
    // console.log("blockchainNetwork: ", blockchainNetwork);

    // * -----------------------------------------------------------------------
    // * Set blockchain network and alchemy sdk.
    // * -----------------------------------------------------------------------
    this.inputBlockchainNetworkName = getChainName({
      chainId: blockchainNetwork,
    });
    switch (this.inputBlockchainNetworkName) {
      case "matic":
        this.alchemy = new Alchemy({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
          network: Network.MATIC_MAINNET,
        });
        this.ALCHEMY_BASE_URL = `https://polygon-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTs/`;
        break;

      case "maticmum":
      default:
        this.alchemy = new Alchemy({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
          network: Network.MATIC_MUMBAI,
        });
        this.ALCHEMY_BASE_URL = `https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTs/`;
        break;
    }

    // * -----------------------------------------------------------------------
    // * Set rent market smart contract address.
    // * -----------------------------------------------------------------------
    this.rentMarketAddress = rentMarketAddress;

    // * -----------------------------------------------------------------------
    // * Set test nft smart contract address.
    // * -----------------------------------------------------------------------
    this.localNftContractAddress = localNftContractAddress;

    // * -----------------------------------------------------------------------
    // * Define variables.
    // * -----------------------------------------------------------------------
    this.metamaskProvider = undefined;
    this.provider = undefined;
    this.signer = undefined;
    this.signerAddress = undefined;
    this.currentBlockchainNetworkName = undefined;
    this.rentMarketContract = undefined;
    this.testNFTContract = undefined;

    // * -----------------------------------------------------------------------
    // * The rent market data list.
    // * -----------------------------------------------------------------------
    this.tokenArray = [];
    this.collectionArray = [];
    this.serviceArray = [];
    this.requestNFTArray = [];
    this.registerNFTArray = [];
    this.allMyNFTArray = [];
    this.allRentNFTArray = [];
    this.pendingRentFeeArray = [];
    this.accountBalanceArray = [];

    // * -----------------------------------------------------------------------
    // * The my data list.
    // * -----------------------------------------------------------------------
    this.myRentNFTArray = [];
    this.myRegisteredNFTArray = [];
    this.myUnregisteredNFTArray = [];

    this.onEventFunc = onEventFunc;
    this.onErrorFunc = onErrorFunc;
  }

  async initializeProvider() {
    // console.log("call initializeProvider()");

    // *------------------------------------------------------------------------
    // * Get metamask provider and set this variable.
    // *------------------------------------------------------------------------
    this.metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    // console.log("this.metamaskProvider: ", this.metamaskProvider);

    // * Check metamask is installed.
    if (this.metamaskProvider !== null) {
      this.provider = new ethers.providers.Web3Provider(this.metamaskProvider);

      // * Register metamask event.
      this.metamaskProvider.on("accountsChanged", this.handleAccountsChanged);
      this.metamaskProvider.on("chainChanged", this.handleChainChanged);
      this.metamaskProvider.on("disconnect", this.handleDisconnect);

      // * Get signer.
      this.signer = this.provider.getSigner();
      // console.log("this.signer: ", this.signer);
      try {
        this.signerAddress = await this.signer.getAddress();
      } catch (error) {
        console.error(error);
        // throw error;
      }

      // * Get metamask chain id.
      const blockchainNetwork = await this.metamaskProvider.request({
        method: "eth_chainId",
      });
      this.currentBlockchainNetworkName = getChainName({
        chainId: blockchainNetwork,
      });

      // * Show error, if block chain is not the same as setting.
      // console.log("this.inputBlockchainNetworkName: ", this.inputBlockchainNetworkName);
      // console.log(
      //   "this.currentBlockchainNetworkName: ",
      //   this.currentBlockchainNetworkName
      // );
      if (
        this.inputBlockchainNetworkName !== this.currentBlockchainNetworkName
      ) {
        this.onErrorFunc &&
          this.onErrorFunc({
            severity: AlertSeverity.warning,
            message: `Metamask blockchain should be
        ${this.inputBlockchainNetworkName}, but you are using 
        ${this.currentBlockchainNetworkName}.`,
          });

        this.setAlchemyProvider();
      }
    } else {
      this.setAlchemyProvider();
    }
    // console.log("this.provider: ", this.provider);
  }

  setAlchemyProvider() {
    // console.log("call setAlchemyProvider()");

    // * Get alchemy provider without metamask.
    this.provider = new ethers.providers.AlchemyProvider(
      this.inputBlockchainNetworkName,
      process.env.NEXT_PUBLIC_ALCHEMY_KEY
    );
  }

  async initializeData() {
    // console.log("call initializeData()");
    // console.log("this.currentBlockchainNetworkName: ", this.currentBlockchainNetworkName);
    // console.log("this.rentMarketAddress: ", this.rentMarketAddress);
    // console.log("this.inputBlockchainNetworkName: ", this.inputBlockchainNetworkName);

    // * Get the rent market contract.
    this.rentMarketContract = new ethers.Contract(
      this.rentMarketAddress,
      rentMarketABI["abi"],
      this.provider
    );
    // console.log("this.rentMarketContract: ", this.rentMarketContract);

    // * Get the local nft contract.
    if (this.inputBlockchainNetworkName === "localhost") {
      if (this.NFT_MODE === "rent") {
        this.testNFTContract = new ethers.Contract(
          this.localNftContractAddress,
          rentNFTABI["abi"],
          this.provider
        );
      } else if (this.NFT_MODE === "prompt") {
        this.testNFTContract = new ethers.Contract(
          this.localNftContractAddress,
          promptNFTABI["abi"],
          this.provider
        );
      } else {
        this.testNFTContract = new ethers.Contract(
          this.localNftContractAddress,
          rentNFTABI["abi"],
          this.provider
        );
      }
      // console.log("this.testNFTContract: ", this.testNFTContract);
    }

    // * Fetch data.
    try {
      await this.fetchToken();

      await this.fetchCollection();

      await this.fetchService();

      await this.fetchRegisterData();

      await this.fetchPendingRentFee();

      await this.fetchAccountBalance();
      this.onEventFunc();

      await this.getMyContentData();
      this.onEventFunc();

      // * Register contract event.
      // await this.registerEvent();
    } catch (error) {
      throw error;
    }
  }

  clearAllData() {
    this.tokenArray = [];
    this.collectionArray = [];
    this.serviceArray = [];
    this.requestNFTArray = [];
    this.registerNFTArray = [];
    this.allMyNFTArray = [];
    this.allRentNFTArray = [];
    this.pendingRentFeeArray = [];
    this.accountBalanceArray = [];

    this.myRentNFTArray = [];
    this.myRegisteredNFTArray = [];
    this.myUnregisteredNFTArray = [];

    this.onEventFunc();
  }

  async initializeAll() {
    // console.log("call initializeAll()");

    try {
      // * Get provider and register event and signer, chain ID.
      await this.initializeProvider();

      // * Get rentMarket contract and fetch all data from the contract.
      await this.initializeData();
    } catch (error) {
      throw error;
    }
  }

  // TODO: Add polygon case.
  async requestChangeNetwork() {
    // console.log("requestChangeNetwork");
    if (this.inputBlockchainNetworkName === "localhost") {
      switchNetworkLocalhost(this.metamaskProvider);
    } else if (this.inputBlockchainNetworkName === "maticmum") {
      switchNetworkMumbai(this.metamaskProvider);
    } else {
      console.error(
        "No support blockchain network: ",
        this.inputBlockchainNetworkName
      );
    }
  }

  async handleAccountsChanged(accounts) {
    // console.log("-- accountsChanged event");
    // console.log("accounts: ", accounts);
    // console.log("call handleAccountsChanged()");

    if (accounts.length === 0) {
      this.onErrorFunc &&
        this.onErrorFunc({
          severity: AlertSeverity.warning,
          message: "No account is set in metamask.",
        });
    }

    this.signerAddress = accounts[0];
    // console.log("this.signerAddress: ", this.signerAddress);

    this.onErrorFunc &&
      this.onErrorFunc({
        severity: AlertSeverity.info,
        message: `Account is changed to ${accounts[0]}`,
      });

    // Reset data.
    await this.initializeData();
  }

  async handleChainChanged(chainId) {
    // console.log("call handelChainChanged()");
    // console.log("chainId: ", chainId);

    this.currentBlockchainNetworkName = getChainName({ chainId: chainId });
    // console.log("this.currentBlockchainNetworkName: ", this.currentBlockchainNetworkName);

    if (this.inputBlockchainNetworkName === this.currentBlockchainNetworkName) {
      await this.initializeData();
    }
  }

  async handleDisconnect() {
    // console.log("call handleDisconnect()");
  }

  async registerEvent() {
    // console.log("call registerEvent()");

    // * Subscription for Alchemy's pendingTransactions API.
    this.alchemy.ws.on(
      {
        method: "alchemy_pendingTransactions",
        toAddress: this.rentMarketAddress,
      },
      function (tx) {
        console.log("tx: ", tx);
      }
    );

    return;

    this.rentMarketContract.on(
      "RegisterToken",
      async function (tokenAddress, name) {
        // console.log("-- RegisterToken event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnregisterToken",
      async function (tokenAddress, name) {
        // console.log("-- UnregisterToken event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RegisterCollection",
      async function (collectionAddress, uri) {
        // console.log("-- RegisterCollection event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnregisterCollection",
      async function (collectionAddress, uri) {
        // console.log("-- UnregisterCollection event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RegisterService",
      async function (serviceAddress, uri) {
        // console.log("-- RegisterService event");
        // console.log("serviceAddress: ", serviceAddress);
        // Update request service data.
        await this.fetchService();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnregisterService",
      async function (serviceAddress, uri) {
        // console.log("-- UnregisterService event");
        // console.log("serviceAddress: ", serviceAddress);
        // Update register data.
        await this.fetchService();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RegisterNFT",
      async function (
        nftAddress,
        tokenId,
        rentFee,
        rentDuration,
        NFTOwnerAddress
      ) {
        // console.log("-- RegisterNFT event");
        // console.log("tokenId: ", tokenId.toString());
        // Update request data.
        // await this.fetchRequestData();
        await this.getMyContentData();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "ChangeNFT",
      async function (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        rentDuration,
        NFTOwnerAddress,
        changerAddress
      ) {
        // console.log("-- ChangeNFT event");
        // console.log("tokenId: ", tokenId.toString());
        // Update register data.
        await this.fetchRegisterData();
        await this.getMyContentData();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnregisterNFT",
      async function (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        rentDuration,
        NFTOwnerAddress,
        UnregisterAddress
      ) {
        // console.log("-- UnregisterNFT event");
        // console.log("tokenId: ", tokenId.toString());
        // Update register data.
        await this.fetchRegisterData();
        await this.getMyContentData();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RentNFT",
      async function (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        isRentByToken,
        rentDuration,
        renterAddress,
        renteeAddress,
        serviceAddress,
        rentStartTimestamp
      ) {
        // console.log("-- RentNFT event");
        // console.log("tokenId: ", tokenId.toString());
        // Update register and rente data and interconnect them.
        await this.fetchRegisterData();
        await this.fetchPendingRentFee();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnrentNFT",
      async function (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        isRentByToken,
        rentDuration,
        renterAddress,
        renteeAddress,
        serviceAddress,
        rentStartTimestamp
      ) {
        // console.log("-- UnrentNFT event");
        // console.log("tokenId: ", tokenId.toString());
        // Update register and rente data and interconnect them.
        await this.fetchRegisterData();
        await this.fetchPendingRentFee();
        await this.fetchAccountBalance();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "SettleRentData",
      async function (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        isRentByToken,
        rentDuration,
        renterAddress,
        renteeAddress,
        serviceAddress,
        rentStartTimestamp
      ) {
        // console.log("-- SettleRentData event");
        // console.log("tokenId: ", tokenId.toString());
        // Update register data.
        await this.fetchRegisterData();
        await this.fetchPendingRentFee();
        await this.fetchAccountBalance();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "WithdrawMyBalance",
      async function (recipient, tokenAddress, amount) {
        // console.log("-- WithdrawMyBalance event");
        // Update account data.
        await this.fetchAccountBalance();
        this.onEventFunc();
      }
    );
  }

  async fetchToken() {
    // console.log("call fetchToken()");

    try {
      const allTokenArray = await this.getAllToken();
      this.tokenArray = allTokenArray;
    } catch (error) {
      throw error;
    }
  }

  async fetchCollection() {
    // * Get request collection array.
    const allCollectionArray = await this.getAllCollection();
    // console.log("allCollectionArray: ", allCollectionArray);

    // * Set request collection data array.
    this.collectionArray = allCollectionArray;
  }

  async fetchService() {
    // * Get request service array.
    const allServiceArray = await this.getAllService();
    // console.log("allServiceArray: ", allServiceArray);

    // * Set request service data array.
    this.serviceArray = allServiceArray;
  }

  async fetchRegisterData() {
    // console.log("call fetchRegisterData()");

    // * Get registerNFT data array with renter, rentee address and start block number.
    const allRegisterNFTArray = await this.getAllRegisterData();
    // console.log("rentMarketAddress: ", rentMarketAddress);
    // console.log("allRegisterNFTArray: ", allRegisterNFTArray);

    // * Get rentNFT data array.
    const allRentNFTArray = await this.getAllRentData();
    // console.log("allRentNFTArray: ", allRentNFTArray);

    // * Set registerNFT data list with register and rent NFT data array intersection.
    // Should show rent status if any rent data.
    // https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
    const registerNFTArray = await Promise.all(
      allRegisterNFTArray.map(async (registerNFTElement) => {
        // * Find the matched one in the allRentNFTArray and set renter, rentee address and start block number.
        const foundElement = allRentNFTArray.find(
          (rentNFTElement) =>
            registerNFTElement.nftAddress === rentNFTElement.nftAddress &&
            // registerNFTElement.tokenId === rentNFTElement.tokenId
            registerNFTElement.tokenId.eq(rentNFTElement.tokenId) === true
        );

        // * Get metadta.
        if (foundElement) {
          // console.log("Call addMetadata");
          return this.addMetadata(foundElement);
        } else {
          // console.log("Call addMetadata");
          return this.addMetadata(registerNFTElement);
        }
      })
    );
    // console.log("registerNFTArray: ", registerNFTArray);

    // * Set renteeNFT data.
    const myRenteeNFTArray = await Promise.all(
      allRentNFTArray.map(async (element) => {
        if (element.renteeAddress === this.signerAddress) {
          // console.log("Call addMetadata");
          return this.addMetadata(element);
        }
      })
    );

    // Remove undefined element.
    // console.log("myRenteeNFTArray: ", myRenteeNFTArray);
    const filteredMyRenteeeNFTArray = myRenteeNFTArray.filter(
      (element) => element !== undefined
    );
    // console.log("filteredMyRenteeeNFTArray: ", filteredMyRenteeeNFTArray);

    // * Set request, register, renter, and rentee NFT data array.
    this.registerNFTArray = registerNFTArray;
    this.myRentNFTArray = filteredMyRenteeeNFTArray;
    this.allRentNFTArray = allRentNFTArray;
  }

  async fetchPendingRentFee() {
    // * Data type.
    // struct pendingRentFee {
    //     address renterAddress;
    //     address serviceAddress;
    //     address feeTokenAddress;
    //     uint256 amount;
    // }

    // * Get and set pending rent fee data array.
    this.pendingRentFeeArray = await this.getAllPendingRentFee();
  }

  async fetchAccountBalance() {
    // * Data type.
    // struct accountBalance {
    //     address accountAddress;
    //     address tokenAddress;
    //     uint256 amount;
    // }

    // * Get and set account balance data array.
    this.accountBalanceArray = await this.getAllAccountBalance();
  }

  getRentMarketContract() {
    return this.rentMarketContract;
  }

  async getAllToken() {
    // console.log("call getAllToken()");

    // * Call rentMarket getAllToken function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    if (isObject(this.rentMarketContract) === false) {
      throw new Error("Rent market contract is not defined.");
    }

    const response = await this.rentMarketContract.getAllToken();
    // console.log("getAllToken response: ", response);

    // * Get register data from smart contract.
    let tokenArray = [];
    response.forEach(function (element) {
      tokenArray.push({
        key: element.tokenAddress,
        tokenAddress: element.tokenAddress,
        name: element.name,
      });
    });

    // * Return token data.
    return tokenArray;
  }

  async getAllCollection() {
    // * Call rentMarket getAllCollection function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllCollection();
    // console.log("getAllCollection response: ", response);

    // * Get register data from smart contract.
    let collectionArray = [];
    response.forEach(async (element) => {
      const response = await axios.get(element.uri);
      const metadata = response.data;
      // console.log("collection metadata: ", metadata);
      collectionArray.push({
        key: element.collectionAddress,
        collectionAddress: element.collectionAddress,
        uri: element.uri,
        metadata: metadata,
      });
    });

    // * Return collection data.
    return collectionArray;
  }

  async getAllService() {
    // * Call rentMarket getAllService function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllService();
    // console.log("getAllService response: ", response);

    // * Get register data from smart contract.
    let serviceArray = [];
    response.forEach(function (element) {
      serviceArray.push({
        key: element.serviceAddress,
        serviceAddress: element.serviceAddress,
        uri: element.uri,
      });
    });

    // * Return service data.
    return serviceArray;
  }

  async getAllRegisterData() {
    // * Call rentMarket getAllRegisterData function.
    const response = await this.rentMarketContract.getAllRegisterData();
    // console.log("getAllRegisterData response: ", response);

    // * Get register data from smart contract.
    let registerData = [];
    response.forEach(function (element) {
      // * Use a raw format instead of string.
      // * Remove key.
      // registerData.push({
      //   key: element.nftAddress + element.tokenId.toString(),
      //   nftAddress: element.nftAddress,
      //   tokenId: element.tokenId.toString(),
      //   rentFee: element.rentFee.toString(),
      //   feeTokenAddress: element.feeTokenAddress,
      //   rentFeeByToken: element.rentFeeByToken.toString(),
      //   isRentByToken: element.isRentByToken,
      //   rentDuration: element.rentDuration.toString(),
      //   // For intersection with rentData, fill the rest with default value.
      //   renterAddress: "0",
      //   renteeAddress: "0",
      //   serviceAddress: "0",
      //   rentStartTimestamp: "0",
      // });
      registerData.push({
        nftAddress: element.nftAddress,
        tokenId: element.tokenId,
        rentFee: element.rentFee,
        feeTokenAddress: element.feeTokenAddress,
        rentFeeByToken: element.rentFeeByToken,
        isRentByToken: element.isRentByToken,
        rentDuration: element.rentDuration,
        // For intersection with rentData, fill the rest with default value.
        renterAddress: "0",
        renteeAddress: "0",
        serviceAddress: "0",
        rentStartTimestamp: "0",
      });
    });

    // * Return register data.
    return registerData;
  }

  async getAllRentData() {
    // * Call rentMarket getAllRentData function.
    const response = await this.rentMarketContract.getAllRentData();
    // console.log("getAllRentData response: ", response);

    // struct rentData {
    //     address nftAddress;
    //     uint256 tokenId;
    //     uint256 rentFee;
    //     address feeTokenAddress;
    //     uint256 rentFeeByToken;
    //     bool isRentByToken;
    //     uint256 rentDuration;
    //     address renterAddress;
    //     address renteeAddress;
    //     address serviceAddress;
    //     uint256 rentStartTimestamp;
    // }
    // * Get rent data from smart contract.
    let rentData = [];
    response.forEach(function (e) {
      // * Use a raw format.
      // rentData.push({
      //   nftAddress: e.nftAddress,
      //   tokenId: e.tokenId.toString(),
      //   rentFee: e.rentFee.toString(),
      //   feeTokenAddress: e.feeTokenAddress,
      //   rentFeeByToken: e.rentFeeByToken.toString(),
      //   isRentByToken: e.isRentByToken,
      //   rentDuration: e.rentDuration.toString(),
      //   renterAddress: e.renterAddress,
      //   renteeAddress: e.renteeAddress,
      //   serviceAddress: e.serviceAddress,
      //   rentStartTimestamp: e.rentStartTimestamp,
      // });
      rentData.push({
        nftAddress: e.nftAddress,
        tokenId: e.tokenId,
        rentFee: e.rentFee,
        feeTokenAddress: e.feeTokenAddress,
        rentFeeByToken: e.rentFeeByToken,
        isRentByToken: e.isRentByToken,
        rentDuration: e.rentDuration,
        renterAddress: e.renterAddress,
        renteeAddress: e.renteeAddress,
        serviceAddress: e.serviceAddress,
        rentStartTimestamp: e.rentStartTimestamp,
      });
    });

    // * Return register data.
    return rentData;
  }

  async getAllPendingRentFee() {
    // * Call rentMarket getAllPendingRentFee function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllPendingRentFee();
    // console.log("getAllPendingRentFee response: ", response);

    // * Get pending rent fee from smart contract.
    // struct pendingRentFee {
    //     address renterAddress;
    //     address serviceAddress;
    //     address feeTokenAddress;
    //     uint256 amount;
    // }
    let pendingRentFeeArray = [];
    response.forEach(function (element) {
      pendingRentFeeArray.push({
        renterAddress: element.renterAddress,
        serviceAddress: element.serviceAddress,
        feeTokenAddress: element.feeTokenAddress,
        amount: element.amount,
      });
    });

    // * Return pending rent fee array.
    return pendingRentFeeArray;
  }

  async getAllAccountBalance() {
    // * Call rentMarket getAllAccountBalance function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllAccountBalance();
    // console.log("getAllAccountBalance response: ", response);

    // * Get account balance array from smart contract.
    // struct accountBalance {
    //     address accountAddress;
    //     address tokenAddress;
    //     uint256 amount;
    // }
    let accountBalanceArray = [];
    response.forEach(function (element) {
      accountBalanceArray.push({
        accountAddress: element.accountAddress,
        tokenAddress: element.tokenAddress,
        amount: element.amount,
      });
    });

    // * Return account balance array.
    return accountBalanceArray;
  }

  async getMyContentData() {
    // console.log("call getMyContentData()");

    // * Get my all minted NFT.
    // console.log(
    //   "this.currentBlockchainNetworkName: ",
    //   this.currentBlockchainNetworkName
    // );

    try {
      if (this.currentBlockchainNetworkName === "localhost") {
        // Use local node.
        this.allMyNFTArray = await this.fetchMyNFTDataOnLocalhost();
      } else {
        // Use public node.
        this.allMyNFTArray = await this.fetchMyNFTData();
      }
    } catch (error) {
      throw error;
    }
    // console.log("this.allMyNFTArray: ", this.allMyNFTArray);

    // * Update my registered and unregistered NFT data.
    await this.updateMyContentData();
  }

  async updateMyContentData() {
    if (this.signerAddress === undefined || this.signerAddress === null) {
      return;
    }

    // * -----------------------------------------------------------------------
    // * Get all register nft data.
    // * -----------------------------------------------------------------------
    const allRegisterNFTArray =
      await this.rentMarketContract.getAllRegisterData();
    // console.log("allRegisterNFTArray: ", allRegisterNFTArray);
    // console.log("this.allMyNFTArray: ", this.allMyNFTArray);

    // * -----------------------------------------------------------------------
    // * Set my register nft data.
    // * -----------------------------------------------------------------------
    const myRegisteredNFTArray = allRegisterNFTArray
      .map((registerElement) => {
        const foundIndex = this.allMyNFTArray.findIndex(
          (myElement) =>
            // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
            registerElement.nftAddress.localeCompare(
              myElement.nftAddress,
              undefined,
              { sensitivity: "accent" }
            ) === 0 && registerElement.tokenId.eq(myElement.tokenId) === true
        );
        // console.log("foundIndex: ", foundIndex);
        // console.log("found element: ", this.allMyNFTArray[foundIndex]);
        // console.log("registerElement: ", registerElement);

        if (foundIndex !== -1) {
          return {
            nftAddress: registerElement.nftAddress,
            tokenId: registerElement.tokenId,
            rentFee: registerElement.rentFee,
            feeTokenAddress: registerElement.feeTokenAddress,
            rentFeeByToken: registerElement.rentFeeByToken,
            rentDuration: registerElement.rentDuration,
            metadata: this.allMyNFTArray[foundIndex].metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log("myRegisteredNFTArray: ", myRegisteredNFTArray);
    this.myRegisteredNFTArray = myRegisteredNFTArray;

    // * -----------------------------------------------------------------------
    // * Set my unregister nft data.
    // * -----------------------------------------------------------------------
    const myUnregisteredNFTArray = this.allMyNFTArray
      .map((myElement) => {
        const foundIndex = myRegisteredNFTArray.findIndex(
          (registerElement) =>
            registerElement.nftAddress.localeCompare(
              myElement.nftAddress,
              undefined,
              { sensitivity: "accent" }
            ) === 0 && registerElement.tokenId.eq(myElement.tokenId) === true
        );

        if (foundIndex === -1) {
          return {
            nftAddress: myElement.nftAddress,
            tokenId: myElement.tokenId,
            metadata: myElement.metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log("myUnregisteredNFTArray: ", myUnregisteredNFTArray);
    this.myUnregisteredNFTArray = myUnregisteredNFTArray;
  }

  async addMetadata(element) {
    // 1. Check pre-existed metadata.
    // console.log("element: ", element);
    if (element.metadata !== undefined) {
      return element;
    }

    // 2. Set default tokenURI function ABI based on OpenZeppelin code.
    const tokenURIAbi = [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "tokenURI",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];

    let newData = element;
    let nftContract;

    if (
      this.inputBlockchainNetworkName === "localhost" &&
      this.testNFTContract.address.localeCompare(
        element.nftAddress,
        undefined,
        { sensitivity: "accent" }
      ) === 0
    ) {
      nftContract = this.testNFTContract;
    } else {
      nftContract = new ethers.Contract(
        element.nftAddress,
        tokenURIAbi,
        this.provider
      );
    }

    // * Get json metadata fomr tokenURI.
    try {
      // const rawTokenURI = await nftContract.tokenURI(element.tokenId);
      const rawTokenURI = await nftContract.tokenURI(
        ethers.BigNumber.from(element.tokenId)
      );

      // * Get image from json metadata.
      const tokenURI = changeIPFSToGateway(rawTokenURI);
      // console.log("rawTokenURI: ", rawTokenURI);
      // console.log("tokenURI: ", tokenURI);
      const response = await axios.get(tokenURI);
      const metadata = response.data;

      // * Get name, description, and attributes from json metadata.
      // console.log("metadata: ", metadata);
      // console.log("name: ", metadata.name);
      // console.log("description: ", metadata.description);
      // console.log("attributes: ", JSON.stringify(metadata.attributes, null, 2));
      newData.metadata = metadata;

      // * Return image(url), name, description, and attributes.
      return newData;
    } catch (error) {
      console.error(error);
      return element;
    }
  }

  async registerToken(tokenAddress, tokenName) {
    // console.log("tokenAddress: ", tokenAddress);
    // console.log("tokenName: ", tokenName);
    // console.log("this.signer: ", this.signer);

    // * Call registerToken function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerToken(tokenAddress, tokenName);
    } catch (error) {
      throw error;
    }
  }

  async unregisterToken(element) {
    // * Call unregisterToken function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterToken(element.tokenAddress);
    } catch (error) {
      throw error;
    }
  }

  async registerCollection(collectionAddress, collectionUri) {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerCollection(collectionAddress, collectionUri);
    } catch (error) {
      throw error;
    }
  }

  async unregisterCollection(collectionAddress) {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterCollection(collectionAddress);
    } catch (error) {
      throw error;
    }
  }

  async registerService(serviceAddress, serviceName) {
    // console.log("serviceAddress: ", serviceAddress);
    // console.log("serviceName: ", serviceName);
    // console.log("this.signer: ", this.signer);

    // * Call registerService function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerService(serviceAddress, serviceName);
    } catch (error) {
      throw error;
    }
  }

  async unregisterService(element) {
    // * Call unregisterService function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterService(element.serviceAddress);
    } catch (error) {
      throw error;
    }
  }

  async registerNFT(element) {
    // console.log("element.nftAddress: ", element.nftAddress);
    // console.log("element.tokenId: ", element.tokenId);

    // * Call registerNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  }

  async changeNFT(
    element,
    rentFee,
    feeTokenAddress,
    rentFeeByToken,
    rentDuration
  ) {
    // console.log("element: ", element);
    // console.log("typeof rentFee: ", typeof rentFee);
    // console.log("rentFee: ", rentFee);
    // console.log("typeof feeTokenAddress: ", typeof feeTokenAddress);
    // console.log("feeTokenAddress: ", feeTokenAddress);
    // console.log("typeof rentFeeByToken: ", typeof rentFeeByToken);
    // console.log("rentFeeByToken: ", rentFeeByToken);
    // console.log("typeof rentDuration: ", typeof rentDuration);
    // console.log("rentDuration: ", rentDuration);

    // * Call acceptRegisterNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .changeNFT(
          element.nftAddress,
          element.tokenId,
          ethers.utils.parseUnits(rentFee, "ether"),
          feeTokenAddress,
          ethers.utils.parseUnits(rentFeeByToken, "ether"),
          rentDuration
        );
    } catch (error) {
      throw error;
    }
  }

  async unregisterNFT(element) {
    // console.log("element.nftAddress: ", element.nftAddress);
    // console.log("element.tokenId: ", element.tokenId);

    // * Call unregisterNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  }

  // Fetch all minted token on local blockchain network.
  async fetchMyNFTDataOnLocalhost() {
    try {
      const allMintTokens = await this.getAllMintTokenOnLocalhost();
      // console.log("allMintTokens: ", allMintTokens);
      return allMintTokens;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // * Get all minted token on local blockchain network.
  async getAllMintTokenOnLocalhost() {
    // *------------------------------------------------------------------------
    // * Get token balance of owner.
    // *------------------------------------------------------------------------
    const balance = (
      await this.testNFTContract.balanceOf(this.signerAddress)
    ).toNumber();
    // console.log("this.signerAddress: ", this.signerAddress);
    // console.log("balance: ", balance);

    // *------------------------------------------------------------------------
    // * Get all token list.
    // *------------------------------------------------------------------------
    let tokenArray = [];
    for (let i = 0; i < balance; i++) {
      let tokenId;
      let rawTokenURI;
      let tokenURI;
      let response;
      let metadata;

      // * Get token ID from enumerator index.
      try {
        tokenId = await this.testNFTContract.tokenOfOwnerByIndex(
          this.signerAddress,
          i
        );
        const tokenIdNumber = tokenId.toNumber();
        rawTokenURI = await this.testNFTContract.tokenURI(tokenIdNumber);
        tokenURI = changeIPFSToGateway(rawTokenURI);
        response = await axios.get(tokenURI);
        metadata = response.data;
        // console.log("metadata: ", metadata);
      } catch (error) {
        throw error;
      }

      tokenArray.push({
        nftAddress: this.localNftContractAddress,
        tokenId: tokenId,
        metadata: metadata,
      });
    }

    // *------------------------------------------------------------------------
    // * Return token data.
    // *------------------------------------------------------------------------
    return tokenArray;
  }

  // Fetch all minted token on public blockchain network.
  async fetchMyNFTData() {
    // console.log("call fetchMyNFTData()");

    let tokenArray = [];
    let alchemyAPIUrl;
    let pageKey;
    let responseCount;
    let response;
    let responseNftArray;
    let loopCount = 0;

    if (this.signerAddress === undefined || this.signerAddress === null) {
      return;
    }

    const filterAddress = this.collectionArray.map(
      (element) => element.collectionAddress
    );
    // console.log("filterAddress: ", filterAddress);

    if (filterAddress.length === 0) {
      return;
    }
    const filterString = `&contractAddresses%5B%5D=${filterAddress}`;

    try {
      do {
        // Check maximum loop count.
        if (++loopCount > this.MAX_LOOP_COUNT) {
          break;
        }

        // * Set alchemy API URL.
        alchemyAPIUrl = pageKey
          ? `${this.ALCHEMY_BASE_URL}?owner=${this.signerAddress}&pageKey=${pageKey}`
          : `${this.ALCHEMY_BASE_URL}?owner=${this.signerAddress}`;
        alchemyAPIUrl = `${alchemyAPIUrl}${filterString}`;
        // console.log("get alchemyAPIUrl: ", alchemyAPIUrl);

        try {
          response = await axios({
            method: "get",
            url: alchemyAPIUrl,
          });
        } catch (error) {
          console.error(error);
          throw error;
        }
        // console.log(JSON.stringify(response.data, null, 2));

        // * Get response and set variables.
        pageKey = response.data["pageKey"];
        // Set response count while loop.
        if (responseCount === undefined) {
          responseCount = response.data["totalCount"];
        } else {
          responseCount -= this.ALCHEMY_DEFAULT_PAGE_COUNT;
        }
        responseNftArray = response.data["ownedNfts"];
        // console.log("pageKey: ", pageKey);
        // console.log("responseCount: ", responseCount);

        // * Add nft array list to tokenArray.
        // https://docs.alchemy.com/alchemy/enhanced-apis/nft-api/getnfts
        responseNftArray.forEach((element) => {
          // console.log("element: ", element);
          tokenArray.push({
            key: `${element.contract.address}/${Number(element.id.tokenId)}`,
            nftAddress: element.contract.address,
            tokenId: Number(element.id.tokenId),
            metadata: element.metadata,
          });
        });

        // * Update my content data by now.
        this.allMyNFTArray = tokenArray;

        const totalCount = response.data["totalCount"];
        const readCount = response.data["totalCount"] - responseCount;

        this.onErrorFunc &&
          this.onErrorFunc({
            severity: AlertSeverity.info,
            message: `Reading NFT (${readCount}/${totalCount}) is processed.`,
          });

        // * Update my nft register and unregister data.
        // * Update other component by onEventFunc function.
        this.updateMyContentData();
        this.onEventFunc();
      } while (pageKey && responseCount > this.ALCHEMY_DEFAULT_PAGE_COUNT);
      // console.log("tokenArray.length: ", tokenArray.length);

      // Make await for a fast loop.
      this.updateMyContentData();
      this.onEventFunc({ message: "Reading NFT data is done." });

      // * Return tokenArray.
      return tokenArray;
    } catch (error) {
      throw error;
    }
  }

  isEmpty(value) {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (value != null && typeof value === "object" && !Object.keys(value).length)
    ) {
      return true;
    } else {
      return false;
    }
  }

  async rentNFT(element, serviceAddress) {
    // console.log("element: ", element);
    // console.log("serviceAddress: ", serviceAddress);

    // * Check metamask install.
    if (this.metamaskProvider === null) {
      try {
        this.onErrorFunc({
          message: "Metamask is not connected.",
          severity: AlertSeverity.error,
        });
      } catch (error) {
        throw error;
      }
      return;
    }

    // * Call rentNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .rentNFT(element.nftAddress, element.tokenId, serviceAddress, {
          // https://docs.ethers.io/v5/api/utils/display-logic/
          //
          // wei	0
          // kwei	3
          // mwei	6
          // gwei	9
          // szabo	12
          // finney	15
          // ether	18
          //
          //                                    1 Ether = 1,000,000,000,000,000,000 WEI = 1 (EXA)WEI
          //               1 (MILLI)ETHER = 0.001 ETHER = 1,000,000,000,000,000 WEI = 1 (PETA)WEI
          //            1 (MICRO)ETHER = 0.000001 ETHER = 1,000,000,000,000 WEI = 1 (TERA)WEI
          //          1 (Nano)ETHER = 0.000000001 ETHER = 1,000,000,000 WEI = 1 (GIGA)WEI
          //       1 (PICO)ETHER = 0.000000000001 ETHER = 1,000,000 WEI = 1 (MEGA)WEI
          //   1 (FEMTO)ETHER = 0.000000000000001 ETHER = 1,000 WEI = 1 (KILO)WEI
          // 1 (ATTO)ETHER = 0.000000000000000001 ETHER = 1 WEI

          // value: ethers.utils.parseUnits(element.rentFee, "wei"),
          value: element.rentFee,
          // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
          // gasLimit: 500_000,
        });
    } catch (error) {
      throw error;
    }
  }

  async unrentNFT(element) {
    // * Call rentNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unrentNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  }

  async settleRentData(nftAddress, tokenId) {
    // console.log("call settleRentData");
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .settleRentData(nftAddress, tokenId);
    } catch (error) {
      throw error;
    }
  }

  async withdrawMyBalance(recipient, tokenAddress) {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .withdrawMyBalance(recipient, tokenAddress);
    } catch (error) {
      throw error;
    }
  }

  async isOwnerOrRenter(account) {
    // console.log("this.rentMarketContract: ", this.rentMarketContract);

    let response;

    try {
      response = await this.rentMarketContract
        .connect(this.signer)
        .isOwnerOrRenter(account);
    } catch (error) {
      throw error;
    }

    return response;
  }
}

export default RentMarket;
