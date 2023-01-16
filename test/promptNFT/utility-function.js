const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");

const promptNFTName = "testPromptNFT";
const promptNFTSymbol = "TPN";

const prepareContract = async ([wallet, other], provider) => {
  let promptNFTContractOwnerSigner;
  let userSigner;
  let marketSigner;
  let remainSignerArray;
  let promptNFTContract;

  // * -------------------------------------------------------------------------
  // * Get sample account signers.
  // * -------------------------------------------------------------------------
  [
    promptNFTContractOwnerSigner,
    userSigner,
    marketSigner,
    ...remainSignerArray
  ] = await ethers.getSigners();

  // * -------------------------------------------------------------------------
  // * Deploy rentMarket smart contract.
  // * -------------------------------------------------------------------------
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
      },
    }
  );

  const exclusive = true;
  const rentMarketContract = await rentMarketContractFactory
    .connect(marketSigner)
    .deploy(exclusive);
  let response = await rentMarketContract.deployed();

  // * -------------------------------------------------------------------------
  // * Deploy promptNFT smart contract.
  // * -------------------------------------------------------------------------
  const rentMarketContractAddress = response.address;
  const promptNFTContractFactory = await ethers.getContractFactory("promptNFT");
  promptNFTContract = await promptNFTContractFactory
    .connect(promptNFTContractOwnerSigner)
    .deploy(promptNFTName, promptNFTSymbol, rentMarketContractAddress);
  response = await promptNFTContract.deployed();
  // console.log("promptNFT deployed address: ", response.address);

  // * -------------------------------------------------------------------------
  // * Register collection to rent market.
  // * -------------------------------------------------------------------------
  const collectionUri =
    "https://js-nft.s3.ap-northeast-2.amazonaws.com/collection.json";
  rentMarketContract
    .connect(marketSigner)
    .registerCollection(response.address, collectionUri);

  return {
    // Return signer values.
    promptNFTContractOwnerSigner,
    userSigner,
    marketSigner,
    remainSignerArray,
    // Return contract values.
    promptNFTContract,
  };
};

const initializeBeforeEach = async () => {
  // * -------------------------------------------------------------------------
  // * Deploy smart contract with fixture and mint NFT.
  // * -------------------------------------------------------------------------
  const {
    // Signer values.
    promptNFTContractOwnerSigner,
    userSigner,
    marketSigner,
    remainSignerArray,
    // Contract values.
    promptNFTContract,
  } = await loadFixture(prepareContract);

  // * -------------------------------------------------------------------------
  // * Burn all NFTs.
  // * -------------------------------------------------------------------------
  let txArray = [];
  const totalSupply = await promptNFTContract.connect(userSigner).totalSupply();
  for (let i = 0; i < totalSupply; i++) {
    const tokenId = await promptNFTContract.connect(userSigner).tokenByIndex(i);
    const tx = await promptNFTContract
      .connect(promptNFTContractOwnerSigner)
      .burn(tokenId);
    txArray.push(tx.wait());
  }
  await Promise.all(txArray);

  return {
    // Signer values.
    promptNFTContractOwnerSigner,
    userSigner,
    marketSigner,
    remainSignerArray,
    // Contract values.
    promptNFTContract,
  };
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  initializeBeforeEach,
  sleep,
  promptNFTName,
  promptNFTSymbol,
};
