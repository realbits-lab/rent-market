const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");

const rewardTokenName = "RewardToken";
const rewardTokenSymbol = "RWT";
//* The first account in hardhat local blockchain.
const shareContractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const prepareContract = async ([wallet, other], provider) => {
  //* Get account signers.
  const [rewardTokenContractOwnerSigner, userSigner, ...remainSignerArray] =
    await ethers.getSigners();

  //* Deploy reward token contract.
  // console.log("try to call ethers.getContractFactory(rewardToken)");
  const rewardTokenContractFactory = await ethers.getContractFactory(
    "rewardToken"
  );
  // console.log("rewardTokenContractFactory: ", rewardTokenContractFactory);
  const rewardTokenContract = await rewardTokenContractFactory.deploy(
    rewardTokenName,
    rewardTokenSymbol,
    shareContractAddress
  );
  // console.log("rewardTokenContract: ", rewardTokenContract);
  const deployedResponse = await rewardTokenContract.deployed();
  // console.log("rewardTokenContract deployed address: ", deployedResponse.address);

  return {
    // Return deployer.
    rewardTokenContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Return reward token contract.
    rewardTokenContract,
  };
};

const initializeBeforeEach = async () => {
  //* Deploy contract with fixture.
  return ({
    //* Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    //* Contract values.
    rewardTokenContract,
  } = await loadFixture(prepareContract));
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
};
