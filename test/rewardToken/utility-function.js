const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");

const rewardTokenName = "RewardToken";
const rewardTokenSymbol = "RWT";

const prepareContract = async ([wallet, other], provider) => {
  //* Get account signers.
  const [rewardTokenContractOwnerSigner, userSigner, ...remainSignerArray] =
    await ethers.getSigners();

  //* rewardToken <-> rewardTokenShare <-> rentMarket

  //* Deploy reward token share contract.
  const rewardTokenShareContractFactory = await ethers.getContractFactory(
    "rewardTokenShare"
  );
  const rewardTokenShareContract =
    await rewardTokenShareContractFactory.deploy();
  const rewardTokenShareContractDeployedResponse =
    await rewardTokenShareContract.deployed();

  //* Deploy reward token contract.
  // console.log("try to call ethers.getContractFactory(rewardToken)");
  const rewardTokenContractFactory = await ethers.getContractFactory(
    "rewardToken"
  );
  // console.log("rewardTokenContractFactory: ", rewardTokenContractFactory);
  const rewardTokenContract = await rewardTokenContractFactory.deploy(
    rewardTokenName,
    rewardTokenSymbol,
    rewardTokenShareContractDeployedResponse.address
  );
  // console.log("rewardTokenContract: ", rewardTokenContract);
  const rewardTokenContractDeployedResponse =
    await rewardTokenContract.deployed();
  // console.log("rewardTokenContract deployed address: ", rewardTokenContractDeployedResponse.address);

  return {
    //* Return deployer.
    rewardTokenContractOwnerSigner,
    userSigner,
    remainSignerArray,
    //* Return reward token related contracts.
    rewardTokenContract,
    rewardTokenShareContract,
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
    rewardTokenShareContract,
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
