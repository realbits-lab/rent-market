import { ethers } from "ethers";
import axios from "axios";
import detectEthereumProvider from "@metamask/detect-provider";

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
  ALCHEMY_BASE_URL =
    "https://polygon-mumbai.g.alchemy.com/nft/v2/LHa8IuNu6lXI6de12LL1Uw7j6HSLCyFl/getNFTs/";
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
    // * Set blockchain network.
    // * -----------------------------------------------------------------------
    this.inputBlockchainNetworkName = getChainName({
      chainId: blockchainNetwork,
    });

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

  initializeMetamask = async () => {
    // console.log("call initializeMetamask()");

    // *------------------------------------------------------------------------
    // * Get metamask provider and set this variable.
    // *------------------------------------------------------------------------
    this.metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    // console.log("this.metamaskProvider: ", this.metamaskProvider);

    // Check error.
    if (this.metamaskProvider === null) {
      throw new Error("Metamask in not installed.");
    }

    this.provider = new ethers.providers.Web3Provider(this.metamaskProvider);
    // console.log("this.provider: ", this.provider);

    // *------------------------------------------------------------------------
    // * Register metamask event.
    // *------------------------------------------------------------------------
    this.metamaskProvider.on("accountsChanged", this.handleAccountsChanged);
    this.metamaskProvider.on("chainChanged", this.handleChainChanged);
    this.metamaskProvider.on("disconnect", this.handleDisconnect);

    // *------------------------------------------------------------------------
    // * Get signer and address and register change event.
    // *------------------------------------------------------------------------
    this.signer = this.provider.getSigner();
    // console.log("this.signer: ", this.signer);
    try {
      this.signerAddress = await this.signer.getAddress();
    } catch (error) {
      throw error;
    }

    // *------------------------------------------------------------------------
    // * Get metamask chain id.
    // *------------------------------------------------------------------------
    const blockchainNetwork = await this.metamaskProvider.request({
      method: "eth_chainId",
    });
    this.currentBlockchainNetworkName = getChainName({
      chainId: blockchainNetwork,
    });

    // *------------------------------------------------------------------------
    // * Show error, if block chain is not the same as setting.
    // *------------------------------------------------------------------------
    // console.log("this.inputBlockchainNetworkName: ", this.inputBlockchainNetworkName);
    // console.log(
    //   "this.currentBlockchainNetworkName: ",
    //   this.currentBlockchainNetworkName
    // );
    if (this.inputBlockchainNetworkName !== this.currentBlockchainNetworkName) {
      this.onErrorFunc({
        message: `Metamask blockchain should be
        ${this.inputBlockchainNetworkName}, but you are using 
        ${this.currentBlockchainNetworkName}.`,
      });
    }
  };

  initializeData = async () => {
    // console.log("call initializeData()");
    // console.log("this.currentBlockchainNetworkName: ", this.currentBlockchainNetworkName);
    // console.log("this.rentMarketAddress: ", this.rentMarketAddress);
    // console.log("this.inputBlockchainNetworkName: ", this.inputBlockchainNetworkName);

    // *------------------------------------------------------------------------
    // * If blockchain is not valid, remove all memory data.
    // *------------------------------------------------------------------------
    if (this.currentBlockchainNetworkName !== this.inputBlockchainNetworkName) {
      this.clearAllData();
      return;
    }

    // *------------------------------------------------------------------------
    // * Get rent market contract instance.
    // *------------------------------------------------------------------------
    this.rentMarketContract = new ethers.Contract(
      this.rentMarketAddress,
      rentMarketABI["abi"],
      this.provider
    );
    // console.log("this.rentMarketContract: ", this.rentMarketContract);

    // *------------------------------------------------------------------------
    // * Get test nft contract instance.
    // *------------------------------------------------------------------------
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

    // *------------------------------------------------------------------------
    // * Fetch data.
    // *------------------------------------------------------------------------
    try {
      // console.log("call fetchToken()");
      this.fetchToken();

      // console.log("call fetchCollection()");
      await this.fetchCollection();

      // console.log("call fetchService()");
      await this.fetchService();

      // console.log("call fetchRegisterData()");
      await this.fetchRegisterData();

      await this.fetchPendingRentFee();

      await this.fetchAccountBalance();
      this.onEventFunc();

      // console.log("call getMyContentData()");
      await this.getMyContentData();
      this.onEventFunc();

      // Register event.
      // console.log("call registerEvent()");
      await this.registerEvent();
    } catch (error) {
      throw error;
    }
  };

  clearAllData = () => {
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
  };

  initializeAll = async () => {
    // console.log("call initializeAll()");

    try {
      // 1. Get provider and register event and signer, chain ID.
      await this.initializeMetamask();

      // 2. Get rentMarket contract and fetch all data from the contract.
      await this.initializeData();
    } catch (error) {
      throw error;
    }
  };

  // TODO: Add polygon case.
  requestChangeNetwork = async () => {
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
  };

  handleAccountsChanged = async (accounts) => {
    // console.log("-- accountsChanged event");
    // console.log("accounts: ", accounts);
    // console.log("call handleAccountsChanged()");

    if (accounts.length === 0) {
      this.onErrorFunc({
        message: "No account is set in metamask.",
      });
    }

    this.signerAddress = accounts[0];
    // console.log("this.signerAddress: ", this.signerAddress);

    this.onErrorFunc({
      message: `Account is changed to ${accounts[0]}`,
    });

    // Reset data.
    await this.initializeData();
  };

  handleChainChanged = async (chainId) => {
    // console.log("-- chainChanged event");
    // console.log("call handelChainChanged()");
    // console.log("chainId: ", chainId);

    this.currentBlockchainNetworkName = getChainName({ chainId: chainId });
    // console.log("this.currentBlockchainNetworkName: ", this.currentBlockchainNetworkName);

    if (this.inputBlockchainNetworkName === this.currentBlockchainNetworkName) {
      this.onErrorFunc({
        message: `Metamask blockchain is set to ${getChainName({
          chainId: chainId,
        })}.`,
      });

      await this.initializeData();
    } else {
      this.onErrorFunc({
        message: `Metamask blockchain is changed and should be
        ${this.inputBlockchainNetworkName}, but you are using 
        ${this.currentBlockchainNetworkName}.`,
      });
    }
  };

  handleDisconnect = async () => {
    // console.log("-- disconnect event");
    // console.log("handleDisconnect");

    this.onErrorFunc({
      message: "Metamask is disconnected.",
    });
  };

  registerEvent = async () => {
    this.rentMarketContract.on("RegisterToken", async (tokenAddress, name) => {
      // console.log("-- RegisterToken event");
      await this.fetchCollection();
      this.onEventFunc();
    });

    this.rentMarketContract.on(
      "UnregisterToken",
      async (tokenAddress, name) => {
        // console.log("-- UnregisterToken event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RegisterCollection",
      async (collectionAddress, uri) => {
        // console.log("-- RegisterCollection event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnregisterCollection",
      async (collectionAddress, uri) => {
        // console.log("-- UnregisterCollection event");
        await this.fetchCollection();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RegisterService",
      async (serviceAddress, uri) => {
        // console.log("-- RegisterService event");
        // console.log("serviceAddress: ", serviceAddress);
        // Update request service data.
        await this.fetchService();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "UnregisterService",
      async (serviceAddress, uri) => {
        // console.log("-- UnregisterService event");
        // console.log("serviceAddress: ", serviceAddress);
        // Update register data.
        await this.fetchService();
        this.onEventFunc();
      }
    );

    this.rentMarketContract.on(
      "RegisterNFT",
      async (nftAddress, tokenId, rentFee, rentDuration, NFTOwnerAddress) => {
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
      async (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        rentDuration,
        NFTOwnerAddress,
        changerAddress
      ) => {
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
      async (
        nftAddress,
        tokenId,
        rentFee,
        feeTokenAddress,
        rentFeeByToken,
        rentDuration,
        NFTOwnerAddress,
        UnregisterAddress
      ) => {
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
      async (
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
      ) => {
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
      async (
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
      ) => {
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
      async (
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
      ) => {
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
      async (recipient, tokenAddress, amount) => {
        // console.log("-- WithdrawMyBalance event");
        // Update account data.
        await this.fetchAccountBalance();
        this.onEventFunc();
      }
    );
  };

  fetchToken = () => {
    // console.log("call fetchToken()");

    this.getAllToken().then(
      (allTokenArray) => {
        this.tokenArray = allTokenArray;
      },
      (error) => {
        throw error;
      }
    );
  };

  fetchCollection = async () => {
    // 1. Get request collection array.
    const allCollectionArray = await this.getAllCollection();
    // console.log("allCollectionArray: ", allCollectionArray);

    // 2. Set request collection data array.
    this.collectionArray = allCollectionArray;
  };

  fetchService = async () => {
    // 1. Get request service array.
    const allServiceArray = await this.getAllService();
    // console.log("allServiceArray: ", allServiceArray);

    // 2. Set request service data array.
    this.serviceArray = allServiceArray;
  };

  fetchPendingRentFee = async () => {
    // 1. Data type.
    // struct pendingRentFee {
    //     address renterAddress;
    //     address serviceAddress;
    //     address feeTokenAddress;
    //     uint256 amount;
    // }

    // 2. Get and set pending rent fee data array.
    this.pendingRentFeeArray = await this.getAllPendingRentFee();
  };

  fetchAccountBalance = async () => {
    // 1. Data type.
    // struct accountBalance {
    //     address accountAddress;
    //     address tokenAddress;
    //     uint256 amount;
    // }

    // 2. Get and set account balance data array.
    this.accountBalanceArray = await this.getAllAccountBalance();
  };

  fetchRegisterData = async () => {
    // console.log("fetchRegisterData");
    // 2. Get registerNFT data array with renter, rentee address and start block number.
    // - key will be returned also as nftAddress + tokenId.
    const allRegisterNFTArray = await this.getAllRegisterData();
    // console.log("rentMarketAddress: ", rentMarketAddress);
    // console.log("allRegisterNFTArray: ", allRegisterNFTArray);

    // 3. Get rentNFT data array.
    // - key will be returned also as nftAddress + tokenId.
    const allRentNFTArray = await this.getAllRentData();
    // console.log("allRentNFTArray: ", allRentNFTArray);

    // 4. Set registerNFT data list with register and rent NFT data array intersection.
    // Should show rent status if any rent data.
    // https://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
    const registerNFTArray = await Promise.all(
      allRegisterNFTArray.map(async (registerNFTElement) => {
        // 1-4-1. Find the key in the allRentNFTArray and set renter, rentee address and start block number.
        const foundElement = allRentNFTArray.find(
          (rentNFTElement) =>
            registerNFTElement.nftAddress === rentNFTElement.nftAddress &&
            registerNFTElement.tokenId === rentNFTElement.tokenId
        );

        // 1-4-2. Get metadta.
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

    // 5. Set renteeNFT data.
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

    // 7. Set request, register, renter, and rentee NFT data array.
    this.registerNFTArray = registerNFTArray;
    this.myRentNFTArray = filteredMyRenteeeNFTArray;
    this.allRentNFTArray = allRentNFTArray;
  };

  getRentMarketContract = async () => {
    return this.rentMarketContract;
  };

  getAllRequestData = async () => {
    // 2. Call rentMarket getAllRequestData function.
    const response = await this.rentMarketContract.getAllRequestData();
    // console.log("getAllRequestData response: ", response);

    // 3. Get register data from smart contract.
    let requestData = [];
    response.forEach(function (element) {
      requestData.push({
        key: element.nftAddress + element.tokenId.toString(),
        nftAddress: element.nftAddress,
        tokenId: element.tokenId.toString(),
      });
    });

    // 4. Return request data.
    return requestData;
  };

  getAllToken = async () => {
    // console.log("call getAllToken()");

    // 1. Call rentMarket getAllToken function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    if (isObject(this.rentMarketContract) === false) {
      throw new Error("Rent market contract is not defined.");
    }

    const response = await this.rentMarketContract.getAllToken();
    // console.log("getAllToken response: ", response);

    // 2. Get register data from smart contract.
    let tokenArray = [];
    response.forEach(function (element) {
      tokenArray.push({
        key: element.tokenAddress,
        tokenAddress: element.tokenAddress,
        name: element.name,
      });
    });

    // 4. Return token data.
    return tokenArray;
  };

  getAllCollection = async () => {
    // 1. Call rentMarket getAllCollection function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllCollection();
    // console.log("getAllCollection response: ", response);

    // 2. Get register data from smart contract.
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

    // 4. Return collection data.
    return collectionArray;
  };

  getAllService = async () => {
    // 1. Call rentMarket getAllService function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllService();
    // console.log("getAllService response: ", response);

    // 2. Get register data from smart contract.
    let serviceArray = [];
    response.forEach(function (element) {
      serviceArray.push({
        key: element.serviceAddress,
        serviceAddress: element.serviceAddress,
        uri: element.uri,
      });
    });

    // 4. Return service data.
    return serviceArray;
  };

  getAllRegisterData = async () => {
    // 2. Call rentMarket getAllRegisterData function.
    const response = await this.rentMarketContract.getAllRegisterData();
    // console.log("getAllRegisterData response: ", response);

    // 3. Get register data from smart contract.
    let registerData = [];
    response.forEach(function (element) {
      registerData.push({
        key: element.nftAddress + element.tokenId.toString(),
        nftAddress: element.nftAddress,
        tokenId: element.tokenId.toString(),
        rentFee: element.rentFee.toString(),
        feeTokenAddress: element.feeTokenAddress,
        rentFeeByToken: element.rentFeeByToken.toString(),
        isRentByToken: element.isRentByToken,
        rentDuration: element.rentDuration.toString(),
        // For intersection with rentData, fill the rest with default value.
        renterAddress: "0",
        renteeAddress: "0",
        serviceAddress: "0",
        rentStartTimestamp: "0",
      });
    });

    // 4. Return register data.
    return registerData;
  };

  getAllRentData = async () => {
    // 2. Call rentMarket getAllRentData function.
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
    // 3. Get rent data from smart contract.
    let rentData = [];
    response.forEach(function (e) {
      rentData.push({
        nftAddress: e.nftAddress,
        tokenId: e.tokenId.toString(),
        rentFee: e.rentFee.toString(),
        feeTokenAddress: e.feeTokenAddress,
        rentFeeByToken: e.rentFeeByToken.toString(),
        isRentByToken: e.isRentByToken,
        rentDuration: e.rentDuration.toString(),
        renterAddress: e.renterAddress,
        renteeAddress: e.renteeAddress,
        serviceAddress: e.serviceAddress,
        rentStartTimestamp: e.rentStartTimestamp,
      });
    });

    // 4. Return register data.
    return rentData;
  };

  getAllPendingRentFee = async () => {
    // 1. Call rentMarket getAllPendingRentFee function.
    // console.log("this.rentMarketContract: ", this.rentMarketContract);
    const response = await this.rentMarketContract.getAllPendingRentFee();
    // console.log("getAllPendingRentFee response: ", response);

    // 2. Get pending rent fee from smart contract.
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

    // 3. Return pending rent fee array.
    return pendingRentFeeArray;
  };

  getAllAccountBalance = async () => {
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
  };

  getMyContentData = async () => {
    // * Get my all minted NFT.
    // console.log(
    //   "this.currentBlockchainNetworkName: ",
    //   this.currentBlockchainNetworkName
    // );

    try {
      if (
        this.currentBlockchainNetworkName === "matic" ||
        this.currentBlockchainNetworkName === "maticmum"
      ) {
        // Use public node.
        this.allMyNFTArray = await this.fetchMyNFTData();
      } else if (this.currentBlockchainNetworkName === "localhost") {
        // Use local node.
        this.allMyNFTArray = await this.fetchMyNFTDataOnLocalhost();
      } else {
        // console.log("network is empty.");
        return;
      }
      // console.log("this.allMyNFTArray: ", this.allMyNFTArray);
    } catch (error) {
      throw error;
    }
    // console.log("this.allMyNFTArray: ", this.allMyNFTArray);

    // * Update my registered and unregistered NFT data.
    await this.updateMyContentData();
  };

  updateMyContentData = async () => {
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
    // TODO: All data type should be string.
    const myRegisteredNFTArray = allRegisterNFTArray
      .map((registerElement) => {
        const foundIndex = this.allMyNFTArray.findIndex(
          (myElement) =>
            // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
            registerElement.nftAddress.localeCompare(
              myElement.nftAddress,
              undefined,
              { sensitivity: "accent" }
            ) === 0 && registerElement.tokenId.toNumber() === myElement.tokenId
        );
        // console.log("foundIndex: ", foundIndex);
        // console.log("found element: ", this.allMyNFTArray[foundIndex]);
        // console.log("registerElement: ", registerElement);

        if (foundIndex !== -1) {
          // Check rent data.
          const rentFoundIndex = this.allRentNFTArray.findIndex(
            (rentElement) =>
              // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
              registerElement.nftAddress.localeCompare(
                rentElement.nftAddress,
                undefined,
                { sensitivity: "accent" }
              ) === 0 &&
              registerElement.tokenId.toString() === rentElement.tokenId
          );

          let data = {};
          if (rentFoundIndex !== -1) {
            // Data is in rent.
            data = {
              // key: `${
              //   registerElement.nftAddress
              // }/${registerElement.tokenId.toNumber()}`,
              nftAddress: registerElement.nftAddress,
              tokenId: registerElement.tokenId.toNumber(),
              rentFee: this.allRentNFTArray[rentFoundIndex].rentFee,
              feeTokenAddress:
                this.allRentNFTArray[rentFoundIndex].feeTokenAddress,
              rentFeeByToken:
                this.allRentNFTArray[rentFoundIndex].rentFeeByToken,
              rentDuration: this.allRentNFTArray[rentFoundIndex].rentDuration,
              renterAddress: this.allRentNFTArray[rentFoundIndex].renterAddress,
              renteeAddress: this.allRentNFTArray[rentFoundIndex].renteeAddress,
              serviceAddress:
                this.allRentNFTArray[rentFoundIndex].serviceAddress,
              rentStartTimestamp:
                this.allRentNFTArray[rentFoundIndex].rentStartTimestamp,
              metadata: this.allMyNFTArray[foundIndex].metadata,
            };

            // console.log("rentFoundIndex: ", rentFoundIndex);
            // console.log("data: ", data);
          } else {
            // Data is not in rent.
            data = {
              // key: `${
              //   registerElement.nftAddress
              // }/${registerElement.tokenId.toNumber()}`,
              nftAddress: registerElement.nftAddress,
              // TODO: Handle type.
              tokenId: registerElement.tokenId.toNumber(),
              rentFee: registerElement.rentFee.toString(),
              feeTokenAddress: registerElement.feeTokenAddress,
              rentFeeByToken: registerElement.rentFeeByToken.toString(),
              rentDuration: registerElement.rentDuration.toString(),
              renterAddress: registerElement.renterAddress,
              renteeAddress: registerElement.renteeAddress,
              serviceAddress: registerElement.serviceAddress,
              rentStartTimestamp: registerElement.rentStartTimestamp,
              metadata: this.allMyNFTArray[foundIndex].metadata,
            };

            // console.log("rentFoundIndex: ", rentFoundIndex);
            // console.log("data: ", data);
          }
          return data;
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
            ) === 0 && registerElement.tokenId === myElement.tokenId
        );

        if (foundIndex === -1) {
          return {
            // key: `${myElement.nftAddress}/${myElement.tokenId}`,
            nftAddress: myElement.nftAddress,
            tokenId: myElement.tokenId,
            metadata: myElement.metadata,
          };
        }
      })
      .filter((element) => element !== undefined);
    // console.log("myUnregisteredNFTArray: ", myUnregisteredNFTArray);
    this.myUnregisteredNFTArray = myUnregisteredNFTArray;
  };

  addMetadata = async (element) => {
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

    // 3. Get json metadata fomr tokenURI.
    try {
      // const rawTokenURI = await nftContract.tokenURI(element.tokenId);
      const rawTokenURI = await nftContract.tokenURI(
        ethers.BigNumber.from(element.tokenId)
      );

      // 3-1. Get image from json metadata.
      const tokenURI = changeIPFSToGateway(rawTokenURI);
      // console.log("rawTokenURI: ", rawTokenURI);
      // console.log("tokenURI: ", tokenURI);
      const response = await axios.get(tokenURI);
      const metadata = response.data;

      // 3-2. Get name, description, and attributes from json metadata.
      // console.log("metadata: ", metadata);
      // console.log("name: ", metadata.name);
      // console.log("description: ", metadata.description);
      // console.log("attributes: ", JSON.stringify(metadata.attributes, null, 2));
      newData.metadata = metadata;

      // 3-3. Return image(url), name, description, and attributes.
      return newData;
    } catch (error) {
      console.error(error);
      return element;
    }
  };

  registerToken = async (tokenAddress, tokenName) => {
    // console.log("tokenAddress: ", tokenAddress);
    // console.log("tokenName: ", tokenName);
    // console.log("this.signer: ", this.signer);

    // 3. Call registerToken function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerToken(tokenAddress, tokenName);
    } catch (error) {
      throw error;
    }
  };

  unregisterToken = async (element) => {
    // 3. Call unregisterToken function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterToken(element.tokenAddress);
    } catch (error) {
      throw error;
    }
  };

  registerCollection = async (collectionAddress, collectionUri) => {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerCollection(collectionAddress, collectionUri);
    } catch (error) {
      throw error;
    }
  };

  unregisterCollection = async (collectionAddress) => {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterCollection(collectionAddress);
    } catch (error) {
      throw error;
    }
  };

  registerService = async (serviceAddress, serviceName) => {
    // console.log("serviceAddress: ", serviceAddress);
    // console.log("serviceName: ", serviceName);
    // console.log("this.signer: ", this.signer);

    // 1. Call registerService function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerService(serviceAddress, serviceName);
    } catch (error) {
      throw error;
    }
  };

  unregisterService = async (element) => {
    // 3. Call unregisterService function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterService(element.serviceAddress);
    } catch (error) {
      throw error;
    }
  };

  registerNFT = async (element) => {
    // console.log("element.nftAddress: ", element.nftAddress);
    // console.log("element.tokenId: ", element.tokenId);

    // 3. Call registerNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .registerNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  };

  changeNFT = async (
    element,
    rentFee,
    feeTokenAddress,
    rentFeeByToken,
    rentDuration
  ) => {
    // console.log("element: ", element);
    // console.log("typeof rentFee: ", typeof rentFee);
    // console.log("rentFee: ", rentFee);
    // console.log("typeof feeTokenAddress: ", typeof feeTokenAddress);
    // console.log("feeTokenAddress: ", feeTokenAddress);
    // console.log("typeof rentFeeByToken: ", typeof rentFeeByToken);
    // console.log("rentFeeByToken: ", rentFeeByToken);
    // console.log("typeof rentDuration: ", typeof rentDuration);
    // console.log("rentDuration: ", rentDuration);

    // 3. Call acceptRegisterNFT function.
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
  };

  unregisterNFT = async (element) => {
    // console.log("element.nftAddress: ", element.nftAddress);
    // console.log("element.tokenId: ", element.tokenId);

    // 3. Call unregisterNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unregisterNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  };

  // Fetch all minted token on local blockchain network.
  fetchMyNFTDataOnLocalhost = async () => {
    try {
      const allMintTokens = await this.getAllMintTokenOnLocalhost();
      // console.log("allMintTokens: ", allMintTokens);
      return allMintTokens;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // * Get all minted token on local blockchain network.
  getAllMintTokenOnLocalhost = async () => {
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
        tokenId = (
          await this.testNFTContract.tokenOfOwnerByIndex(this.signerAddress, i)
        ).toNumber();
        rawTokenURI = await this.testNFTContract.tokenURI(tokenId);
        tokenURI = changeIPFSToGateway(rawTokenURI);
        response = await axios.get(tokenURI);
        metadata = response.data;
        // console.log("metadata: ", metadata);
      } catch (error) {
        throw error;
      }

      tokenArray.push({
        key: `${this.localNftContractAddress}/${tokenId}`,
        nftAddress: this.localNftContractAddress,
        tokenId: tokenId,
        metadata: metadata,
      });
    }

    // *------------------------------------------------------------------------
    // * Return token data.
    // *------------------------------------------------------------------------
    return tokenArray;
  };

  // Fetch all minted token on public blockchain network.
  fetchMyNFTData = async () => {
    // console.log("call fetchMyNFTData()");

    let tokenArray = [];
    let alchemyAPIUrl;
    let pageKey;
    let responseCount;
    let response;
    let responseNftArray;
    let loopCount = 0;

    const filterAddress = this.collectionArray.map(
      (element) => element.collectionAddress
    );
    // console.log("filterAddress: ", filterAddress);
    // TODO: Chck filterAddress.length is zero.
    const filterString = `&contractAddresses%5B%5D=${filterAddress}`;

    try {
      do {
        // Check maximum loop count.
        if (++loopCount > this.MAX_LOOP_COUNT) {
          break;
        }

        // 1. Set alchemy API URL.
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

        // 2. Get response and set variables.
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

        // 3. Add nft array list to tokenArray.
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

        // Update my content data by now.
        this.allMyNFTArray = tokenArray;

        const totalCount = response.data["totalCount"];
        const readCount = response.data["totalCount"] - responseCount;

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

      // 4. Return tokenArray.
      return tokenArray;
    } catch (error) {
      throw error;
    }
  };

  isEmpty = (value) => {
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
  };

  rentNFT = async (element, serviceAddress) => {
    // console.log("element: ", element);
    // console.log("serviceAddress: ", serviceAddress);

    // 3. Call rentNFT function.
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

          value: ethers.utils.parseUnits(element.rentFee, "wei"),
          // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
          // gasLimit: 500_000,
        });
    } catch (error) {
      throw error;
    }
  };

  unrentNFT = async (element) => {
    // 1. Call rentNFT function.
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .unrentNFT(element.nftAddress, element.tokenId);
    } catch (error) {
      throw error;
    }
  };

  settleRentData = async (nftAddress, tokenId) => {
    // console.log("call settleRentData");
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .settleRentData(nftAddress, tokenId, { gasLimit: 5_000_000 });
    } catch (error) {
      throw error;
    }
  };

  withdrawMyBalance = async (recipient, tokenAddress) => {
    try {
      await this.rentMarketContract
        .connect(this.signer)
        .withdrawMyBalance(recipient, tokenAddress, { gasLimit: 5_000_000 });
    } catch (error) {
      throw error;
    }
  };

  isOwnerOrRenter = async (account) => {
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
  };
}

export default RentMarket;
