const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");

const rewardTokenName = "RewardToken";
const rewardTokenSymbol = "RWT";
const FIVE_WEEKS_TIMESTAMP = 60 * 60 * 24 * 7 * 5;

const prepareContract = async ([wallet, other], provider) => {
  //* Get account signers.
  const [
    rewardTokenContractOwnerSigner,
    userSigner,
    projectTeamAccountSigner,
    tokenPoolContractAddressSigner,
    ...remainSignerArray
  ] = await ethers.getSigners();

  //* rewardToken <-> rewardTokenShare <-> rentMarket

  //* Deploy reward token share contract.
  const rewardTokenShareContractFactory = await ethers.getContractFactory(
    "rewardTokenShare"
  );
  const rewardTokenShareContract = await rewardTokenShareContractFactory.deploy(
    projectTeamAccountSigner.address,
    tokenPoolContractAddressSigner.address
  );
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

  //* Set reward token contract address to reward token share contract.
  rewardTokenShareContract.setRewardTokenContractAddress(
    rewardTokenContractDeployedResponse.address
  );

  return {
    //* Return deployer.
    rewardTokenContractOwnerSigner,
    userSigner,
    projectTeamAccountSigner,
    tokenPoolContractAddressSigner,
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
  FIVE_WEEKS_TIMESTAMP,
};
