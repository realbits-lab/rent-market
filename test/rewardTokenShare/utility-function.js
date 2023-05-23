const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");

const rewardTokenName = "RewardToken";
const rewardTokenSymbol = "RWT";
const FIVE_WEEKS_TIMESTAMP = 60 * 60 * 24 * 7 * 5;

const prepareContract = async ([wallet, other], provider) => {
  //* Get account signers.
  const [
    rewardTokenContractSigner,
    rewardTokenShareContractSigner,
    rentMarketContractSigner,
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
  const rewardTokenShareContract = await rewardTokenShareContractFactory
    .connect(rewardTokenShareContractSigner)
    .deploy(
      projectTeamAccountSigner.address,
      tokenPoolContractAddressSigner.address
    );
  const rewardTokenShareContractDeployedResponse =
    await rewardTokenShareContract.deployed();
  console.log(
    "rewardTokenShareContract deployed address: ",
    rewardTokenShareContractDeployedResponse.address
  );

  //* Deploy reward token contract.
  // console.log("try to call ethers.getContractFactory(rewardToken)");
  const rewardTokenContractFactory = await ethers.getContractFactory(
    "rewardToken"
  );
  // console.log("rewardTokenContractFactory: ", rewardTokenContractFactory);
  const rewardTokenContract = await rewardTokenContractFactory
    .connect(rewardTokenContractSigner)
    .deploy(
      rewardTokenName,
      rewardTokenSymbol,
      rewardTokenShareContractDeployedResponse.address
    );
  // console.log("rewardTokenContract: ", rewardTokenContract);
  const rewardTokenContractDeployedResponse =
    await rewardTokenContract.deployed();
  console.log(
    "rewardTokenContract deployed address: ",
    rewardTokenContractDeployedResponse.address
  );

  //* Deploy iterableMap library contract.
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

  // const balanceSnapshotLibContract = await ethers.getContractFactory(
  //   "balanceSnapshotLib"
  // );
  // const balanceSnapshotLibrary = await balanceSnapshotLibContract.deploy();

  await pendingRentFeeIterableMapLibrary.deployed();
  await tokenDataIterableMapLibrary.deployed();
  await accountBalanceIterableMapLibrary.deployed();
  await collectionDataIterableMapLibrary.deployed();
  await serviceDataIterableMapLibrary.deployed();
  await registerDataIterableMapLibrary.deployed();
  await rentDataIterableMapLibrary.deployed();
  // await balanceSnapshotLibrary.deployed();

  //* Deploy rent market contract.
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

  const exclusive = true;
  const rentMarketContract = await rentMarketContractFactory
    .connect(rentMarketContractSigner)
    .deploy(exclusive);
  const rentMarketContractDeployedResponse =
    await rentMarketContract.deployed();
  console.log(
    "rentMarket deployed address: ",
    rentMarketContractDeployedResponse.address
  );

  //* Set reward token contract address to reward token share contract.
  rewardTokenShareContract.setRewardTokenContractAddress(
    rewardTokenContractDeployedResponse.address
  );

  return {
    //* Return deployer.
    rewardTokenContractSigner,
    rewardTokenShareContractSigner,
    rentMarketContractSigner,
    userSigner,
    projectTeamAccountSigner,
    tokenPoolContractAddressSigner,
    remainSignerArray,
    //* Return reward token related contracts.
    rewardTokenContract,
    rewardTokenShareContract,
    rentMarketContract,
  };
};

const initializeBeforeEach = async () => {
  //* Deploy contract with fixture.
  return ({
    //* Signer values.
    rewardTokenContractSigner,
    rewardTokenShareContractSigner,
    rentMarketContractSigner,
    userSigner,
    projectTeamAccountSigner,
    tokenPoolContractAddressSigner,
    remainSignerArray,
    //* Contract values.
    rewardTokenContract,
    rewardTokenShareContract,
    rentMarketContract,
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
