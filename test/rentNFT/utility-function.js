const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");

const rentNFTName = "testRentNFT";
const rentNFTSymbol = "TRN";
const rentNFTBaseUri =
  "https://dulls-nft.s3.ap-northeast-2.amazonaws.com/json/";

const prepareContract = async ([wallet, other], provider) => {
  let rentNFTContractOwnerSigner;
  let userSigner;
  let remainSignerArray;
  let rentNFTContract;

  // * Get sample account signers.
  [rentNFTContractOwnerSigner, userSigner, ...remainSignerArray] =
    await ethers.getSigners();

  // * Deploy rentNFT smart contract.
  const rentNFTContractFactory = await ethers.getContractFactory("rentNFT");
  rentNFTContract = await rentNFTContractFactory.deploy(
    rentNFTName,
    rentNFTSymbol,
    rentNFTBaseUri
  );
  const response = await rentNFTContract.deployed();
  // console.log("rentNFT deployed address: ", response.address);

  return {
    // Return signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Return contract values.
    rentNFTContract,
  };
};

const initializeBeforeEach = async () => {
  let transaction;
  let transactionArray = [];

  // * Deploy smart contract with fixture and mint NFT.
  const {
    // Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentNFTContract,
  } = await loadFixture(prepareContract);

  return {
    // Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentNFTContract,
  };
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  initializeBeforeEach,
  sleep,
  rentNFTName,
  rentNFTSymbol,
};
