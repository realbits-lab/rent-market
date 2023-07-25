const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { parseEther, formatEther, splitSignature } = ethers.utils;
const {
  signTypedData,
  SignTypedDataVersion,
} = require("@metamask/eth-sig-util");
const { loadFixture, deployContract } = require("ethereum-waffle");

//* We suppose that.
//* - rentNFT contract owner(deployer) is the same as rentNFT token owner.

const TOKEN_ID = 1;
const RENT_FEE = "2";
const RENT_DURATION = 100;
const TEST_TOKEN_NAME = "testToken";

//* Define service, collection, and nft uri value.
const SERVICE_URI = "https://avame.s3.ap-northeast-2.amazonaws.com/avame.json";
const COLLECTION_URI =
  "https://dulls-nft.s3.ap-northeast-2.amazonaws.com/collection.json";

const MINT_START_TOKEN_ID = 1;
const MINT_END_TOKEN_ID = 10;

const TOKEN_NAME = "testToken";
const TOKEN_SYMBOL = "TTT";

const NFT_NAME = "testRentNFT";
const NFT_SYMBOL = "TRN";
const NFT_BASE_URI = "https://dulls-nft.s3.ap-northeast-2.amazonaws.com/json/";

const defaultRentFee = ethers.utils.parseUnits("1", "ether");
const defaultFeeToken = ethers.constants.AddressZero;
const defaultRentFeeByToken = BigNumber.from(0);
const defaultRentDuration = BigNumber.from(60 * 60 * 24);

//* Deply rentMarket, testNFT, and testToken contracts
const prepareContract = async ([wallet, other], provider) => {
  //*---------------------------------------------------------------------------
  //* Signer return values.
  //*---------------------------------------------------------------------------
  let rentMarketContractOwnerSigner;
  let serviceContractOwnerSigner;
  let testNFTContractOwnerSigner;
  let userSigner;
  let remainSignerArray;

  //*---------------------------------------------------------------------------
  //* Contract return values.
  //*---------------------------------------------------------------------------
  let rentMarketContract;
  let testNFTContract;
  let testTokenContract;

  //*---------------------------------------------------------------------------
  //* Other variables.
  //*---------------------------------------------------------------------------
  let response;

  //*---------------------------------------------------------------------------
  //* Get sample account signers.
  //*---------------------------------------------------------------------------
  [
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    ...remainSignerArray
  ] = await ethers.getSigners();

  //*---------------------------------------------------------------------------
  //* Deploy iterableMap library smart contract.
  //*---------------------------------------------------------------------------
  console.log("Start to deploy rentMarket.");
  const pendingRentFeeIterableMapContract = await ethers.getContractFactory(
    "pendingRentFeeIterableMap"
  );
  const pendingRentFeeIterableMapLibrary =
    await pendingRentFeeIterableMapContract.deploy();

  const tokenDataIterableMapContract = await ethers.getContractFactory(
    "tokenDataIterableMap"
  );
  const tokenDataIterableMapLibrary =
    await tokenDataIterableMapContract.deploy();

  const accountBalanceIterableMapContract = await ethers.getContractFactory(
    "accountBalanceIterableMap"
  );
  const accountBalanceIterableMapLibrary =
    await accountBalanceIterableMapContract.deploy();

  const collectionDataIterableMapContract = await hre.ethers.getContractFactory(
    "collectionDataIterableMap"
  );
  const collectionDataIterableMapLibrary =
    await collectionDataIterableMapContract.deploy();

  const serviceDataIterableMapContract = await ethers.getContractFactory(
    "serviceDataIterableMap"
  );
  const serviceDataIterableMapLibrary =
    await serviceDataIterableMapContract.deploy();

  const registerDataIterableMapContract = await ethers.getContractFactory(
    "registerDataIterableMap"
  );
  const registerDataIterableMapLibrary =
    await registerDataIterableMapContract.deploy();

  const rentDataIterableMapContract = await ethers.getContractFactory(
    "rentDataIterableMap"
  );
  const rentDataIterableMapLibrary = await rentDataIterableMapContract.deploy();

  await pendingRentFeeIterableMapLibrary.deployed();
  await tokenDataIterableMapLibrary.deployed();
  await accountBalanceIterableMapLibrary.deployed();
  await collectionDataIterableMapLibrary.deployed();
  await serviceDataIterableMapLibrary.deployed();
  await registerDataIterableMapLibrary.deployed();
  await rentDataIterableMapLibrary.deployed();

  //*---------------------------------------------------------------------------
  //* Deploy rentMarket smart contract.
  //*---------------------------------------------------------------------------
  const rentMarketContractFactory = await ethers.getContractFactory(
    "rentMarket",
    {
      libraries: {
        pendingRentFeeIterableMap:
          pendingRentFeeIterableMapLibrary.deployTransaction.creates,
        tokenDataIterableMap:
          tokenDataIterableMapLibrary.deployTransaction.creates,
        accountBalanceIterableMap:
          accountBalanceIterableMapLibrary.deployTransaction.creates,
        collectionDataIterableMap:
          collectionDataIterableMapLibrary.deployTransaction.creates,
        serviceDataIterableMap:
          serviceDataIterableMapLibrary.deployTransaction.creates,
        registerDataIterableMap:
          registerDataIterableMapLibrary.deployTransaction.creates,
        rentDataIterableMap:
          rentDataIterableMapLibrary.deployTransaction.creates,
        // balanceSnapshotLib: balanceSnapshotLibrary.deployTransaction.creates,
      },
    }
  );

  // https://docs.ethers.io/v4/api-contract.html
  rentMarketContract = await rentMarketContractFactory
    .connect(rentMarketContractOwnerSigner)
    .deploy();
  response = await rentMarketContract.deployed();
  // console.log("rentMarket deployed address: ", response.address);

  //*---------------------------------------------------------------------------
  //* Deploy testNFT smart contract.
  //*---------------------------------------------------------------------------
  // https://docs.ethers.io/v4/api-contract.html
  const testNFTContractFactory = await ethers.getContractFactory("rentNFT");
  testNFTContract = await testNFTContractFactory
    .connect(testNFTContractOwnerSigner)
    .deploy(NFT_NAME, NFT_SYMBOL, NFT_BASE_URI);
  response = await testNFTContract.deployed();

  //*---------------------------------------------------------------------------
  //* Deploy testToken contract.
  //*---------------------------------------------------------------------------
  const testTokenContractFactory = await ethers.getContractFactory("testToken");
  testTokenContract = await testTokenContractFactory.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL
  );
  response = await testTokenContract.deployed();
  // console.log("testToken deployed address: ", response.address);

  //*---------------------------------------------------------------------------
  //* Mint NFT.
  //*---------------------------------------------------------------------------
  for (let i = MINT_START_TOKEN_ID; i <= MINT_END_TOKEN_ID; i++) {
    await testNFTContract.safeMint(testNFTContractOwnerSigner.address);
  }

  return {
    //* Return signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    //* Return contract values.
    rentMarketContract,
    testNFTContract,
    testTokenContract,
  };
};

const removeAllData = async ({
  rentMarketContract,
  testNFTContract,
  testTokenContract,
  rentMarketContractOwnerSigner,
  testNFTContractOwnerSigner,
  serviceContractOwnerSigner,
}) => {
  let tx;
  let txArray = [];

  //*---------------------------------------------------------------------------
  //* Unregister token.
  //*---------------------------------------------------------------------------
  txArray = [];
  const allTokenArray = await rentMarketContract.getAllToken();
  for (element of allTokenArray) {
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .unregisterToken(element.tokenAddress);
    txArray.push(tx.wait());
  }
  await Promise.all(txArray);

  //*---------------------------------------------------------------------------
  //* Unregister collection.
  //*---------------------------------------------------------------------------
  txArray = [];
  const allCollectionArray = await rentMarketContract.getAllCollection();
  for (element of allCollectionArray) {
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .unregisterCollection(element.collectionAddress);
    txArray.push(tx.wait());
  }
  await Promise.all(txArray);

  //*---------------------------------------------------------------------------
  //* Unregister service.
  //*---------------------------------------------------------------------------
  txArray = [];
  const allServiceArray = await rentMarketContract.getAllService();
  for (element of allServiceArray) {
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .unregisterService(element.serviceAddress);
    txArray.push(tx.wait());
  }
  await Promise.all(txArray);

  //*---------------------------------------------------------------------------
  //* Unregister NFT.
  //*---------------------------------------------------------------------------
  txArray = [];
  const allRegisterArray = await rentMarketContract.getAllRegisterData();
  for (element of allRegisterArray) {
    tx = await rentMarketContract.unregisterNFT(
      element.nftAddress,
      element.tokenId
    );
    txArray.push(tx.wait());
  }
  await Promise.all(txArray);

  //*---------------------------------------------------------------------------
  //* Unrent NFT.
  //*---------------------------------------------------------------------------
  txArray = [];
  let allRentArray = await rentMarketContract.getAllRentData();
  for (element of allRentArray) {
    tx = await rentMarketContract.unrentNFT(
      element.nftAddress,
      element.tokenId
    );
    txArray.push(tx.wait());
  }
  await Promise.all(txArray);

  tx = await rentMarketContract.setMarketShareAddress(
    rentMarketContractOwnerSigner.address
  );
  await tx.wait();

  //*---------------------------------------------------------------------------
  //* Settle rent data.
  //* - Should get all rent array data again, because unrentNFT function was called above.
  //*---------------------------------------------------------------------------
  txArray = [];
  allRentArray = await rentMarketContract.getAllRentData();
  for (element of allRentArray) {
    const latestBlock = await ethers.provider.getBlock("latest");
    if (
      latestBlock.timestamp.gt(
        element.rentStartTimestamp.add(element.rentDuration)
      ) === true
    ) {
      tx = await rentMarketContract.settleRentData(
        element.nftAddress,
        element.tokenId
      );
      txArray.push(tx.wait());
    }
  }
  await Promise.all(txArray);

  //*---------------------------------------------------------------------------
  //* Withdraw base coin.
  //*---------------------------------------------------------------------------
  txArray = [];
  tx = await rentMarketContract
    .connect(testNFTContractOwnerSigner)
    .withdrawMyBalance(
      testNFTContractOwnerSigner.address,
      ethers.constants.AddressZero
    );
  txArray.push(tx.wait());
  tx = await rentMarketContract
    .connect(serviceContractOwnerSigner)
    .withdrawMyBalance(
      serviceContractOwnerSigner.address,
      ethers.constants.AddressZero
    );
  txArray.push(tx.wait());
  tx = await rentMarketContract
    .connect(rentMarketContractOwnerSigner)
    .withdrawMyBalance(
      rentMarketContractOwnerSigner.address,
      ethers.constants.AddressZero
    );
  txArray.push(tx.wait());
  await Promise.all(txArray);

  //*---------------------------------------------------------------------------
  //* Withdraw fee token.
  //*---------------------------------------------------------------------------
  txArray = [];
  tx = await rentMarketContract
    .connect(testNFTContractOwnerSigner)
    .withdrawMyBalance(
      testNFTContractOwnerSigner.address,
      testTokenContract.address
    );
  txArray.push(tx.wait());
  tx = await rentMarketContract
    .connect(serviceContractOwnerSigner)
    .withdrawMyBalance(
      serviceContractOwnerSigner.address,
      testTokenContract.address
    );
  txArray.push(tx.wait());
  tx = await rentMarketContract
    .connect(rentMarketContractOwnerSigner)
    .withdrawMyBalance(
      rentMarketContractOwnerSigner.address,
      testTokenContract.address
    );
  txArray.push(tx.wait());
  await Promise.all(txArray);
};

const initializeBeforeEach = async () => {
  let transaction;
  let txArray = [];

  //*---------------------------------------------------------------------------
  //* Deploy smart contracts with fixture and mint NFT.
  //* - rent market
  //* - test nft
  //* - test token
  //*---------------------------------------------------------------------------
  const {
    // Signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentMarketContract,
    testNFTContract,
    testTokenContract,
  } = await loadFixture(prepareContract);

  //* ---------------------------------------------------------------------------
  //* Remove all data and register service and collection.
  //* - remove
  //  * service
  //  * collection
  //  * register NFT
  //  * rent
  //  * settle
  //  * withdraw (base, token)
  //* - register
  //  * service
  //  * collection
  //* ---------------------------------------------------------------------------
  await removeAllData({
    rentMarketContract,
    testNFTContract,
    testTokenContract,
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
  });

  //*---------------------------------------------------------------------------
  //* Register token.
  //*---------------------------------------------------------------------------
  transaction = await rentMarketContract
    .connect(rentMarketContractOwnerSigner)
    .registerToken(testTokenContract.address, TEST_TOKEN_NAME);
  txArray.push(transaction.wait());

  //*---------------------------------------------------------------------------
  //* Register collection.
  //*---------------------------------------------------------------------------
  transaction = await rentMarketContract
    .connect(rentMarketContractOwnerSigner)
    .registerCollection(testNFTContract.address, COLLECTION_URI);
  txArray.push(transaction.wait());

  //*---------------------------------------------------------------------------
  //* Register service.
  //*---------------------------------------------------------------------------
  transaction = await rentMarketContract
    .connect(rentMarketContractOwnerSigner)
    .registerService(serviceContractOwnerSigner.address, SERVICE_URI);
  txArray.push(transaction.wait());

  const response = await Promise.all(txArray);
  // console.log("Promise.all response: ", response)

  return {
    // Signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentMarketContract,
    testNFTContract,
    testTokenContract,
  };
};

const registerNFT = async ({
  rentMarketContract,
  testNFTContract,
  testNFTContractOwnerSigner,
  startTokenId,
  endTokenId,
}) => {
  let txArray = [];

  //* Call registerNFT to rentMarket contract.
  for (let i = startTokenId; i <= endTokenId; i++) {
    const tx = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .registerNFT(testNFTContract.address, i);
    txArray.push(tx.wait());
  }

  //* Wait until the transaction is mined.
  const response = await Promise.all(txArray);
};

async function mineBlocks(count, provider) {
  for (let i = 0; i < count; i++) {
    await provider.send("evm_mine", []);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function erc20PermitSignature({
  owner,
  spender,
  amount,
  contract,
  signer,
}) {
  // console.log("call erc20PermitSignature()");
  // console.log("owner: ", owner);
  // console.log("spender: ", spender);
  // console.log("amount: ", amount);

  try {
    //* Deadline is 20 minutes later from current timestamp.
    const transactionDeadline = Date.now() + 20 * 60;
    // console.log("transactionDeadline: ", transactionDeadline);
    const nonce = await contract.nonces(owner);
    console.log("nonce: ", nonce);
    const contractName = await contract.name();
    console.log("contractName: ", contractName);
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];
    // console.log("chain: ", chain);
    const domain = {
      name: contractName,
      version: "1",
      chainId: 1337,
      verifyingContract: contract.address,
    };
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];
    const message = {
      owner,
      spender,
      value: amount.toString(),
      nonce: nonce.toHexString(),
      deadline: transactionDeadline,
    };
    const msgParams = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: "Permit",
      message,
    });

    // const params = [owner, msgParams];
    // const method = "eth_signTypedData_v4";
    // // console.log("params: ", params);
    // // console.log("method: ", method);
    // const signature = await ethereum.request({
    //   method,
    //   params,
    // });

    const signature = signTypedData({
      privateKey: process.env.ACCOUNT_PRIVATE_KEY,
      data: {
        types: {
          EIP712Domain,
          Permit,
        },
        domain,
        primaryType: "Permit",
        message,
      },
      version: SignTypedDataVersion.V4,
    });
    console.log("signature: ", signature);

    const signData = splitSignature(signature);
    console.log("signData: ", signData);
    const { r, s, v } = signData;
    return {
      r,
      s,
      v,
      deadline: transactionDeadline,
    };
  } catch (error) {
    console.error("error: ", error);
    return error;
  }
}

module.exports = {
  initializeBeforeEach,
  registerNFT,
  mineBlocks,
  sleep,
  defaultRentFee,
  defaultFeeToken,
  defaultRentFeeByToken,
  defaultRentDuration,
  erc20PermitSignature,
};
