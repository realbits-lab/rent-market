const { ethers } = require("hardhat");
const { loadFixture } = require("ethereum-waffle");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const rewardTokenName = "RewardToken";
const rewardTokenSymbol = "RWT";
const FIVE_WEEKS_TIMESTAMP = 60 * 60 * 24 * 7 * 5;

const prepareContract = async ([wallet, other], provider) => {
  //* Get account signers.
  const [
    rewardTokenContractSigner,
    rewardTokenShareContractSigner,
    rentMarketContractSigner,
    rentNFTContractSigner,
    serviceSigner,
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
  // console.log(
  //   "rewardTokenShareContract deployed address: ",
  //   rewardTokenShareContractDeployedResponse.address
  // );

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
      rewardTokenShareContractDeployedResponse.address,
      projectTeamAccountSigner.address
    );
  // console.log("rewardTokenContract: ", rewardTokenContract);
  const rewardTokenContractDeployedResponse =
    await rewardTokenContract.deployed();
  // console.log(
  //   "rewardTokenContract deployed address: ",
  //   rewardTokenContractDeployedResponse.address
  // );

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
  // console.log(
  //   "rentMarket deployed address: ",
  //   rentMarketContractDeployedResponse.address
  // );

  //* Deploy rent nft contract.
  const NFT_NAME = "testRentNFT";
  const NFT_SYMBOL = "TRN";
  const NFT_BASE_URI =
    "https://dulls-nft.s3.ap-northeast-2.amazonaws.com/json/";
  const rentNFTContractFactory = await ethers.getContractFactory("rentNFT");
  rentNFTContract = await rentNFTContractFactory
    .connect(rentNFTContractSigner)
    .deploy(NFT_NAME, NFT_SYMBOL, NFT_BASE_URI);
  const rentNFTContractDeployedResponse = await rentNFTContract.deployed();
  // console.log(
  //   "rentNFT deployed address: ",
  //   rentNFTContractDeployedResponse.address
  // );

  //* Mint rent nft.
  tx = await rentNFTContract
    .connect(rentNFTContractSigner)
    .safeMint(userSigner.address);
  await tx.wait();

  //* Register rent nft contract to rent market contract.
  tx = await rentMarketContract
    .connect(rentMarketContractSigner)
    .registerCollection(rentNFTContract.address, "collection_uri");
  await tx.wait();

  //* Register reward token contract to rent market contract.
  tx = await rentMarketContract
    .connect(rentMarketContractSigner)
    .registerToken(rewardTokenContract.address, "reward_token_name");
  await tx.wait();

  //* Register service address to rent market contract.
  tx = await rentMarketContract
    .connect(rentMarketContractSigner)
    .registerService(serviceSigner.address, "service_uri");
  await tx.wait();

  //* Register rent nft.
  tx = await rentMarketContract
    .connect(rentNFTContractSigner)
    .registerNFT(rentNFTContract.address, 1);
  await tx.wait();

  response = await rentMarketContract.connect(userSigner).getAllRegisterData();
  console.log("getAllRegisterData() response: ", response);

  //* Change the rent duration.
  const data = await rentMarketContract
    .connect(userSigner)
    .getRegisterData(rentNFTContract.address, 1);
  tx = await rentMarketContract.connect(rentMarketContractSigner).changeNFT(
    data.nftAddress,
    data.tokenId,
    data.rentFee,
    // data.feeTokenAddress,
    rewardTokenContract.address,
    // data.rentFeeByToken,
    data.rentFee,
    // data.rentDuration
    1
  );

  response = await rentMarketContract.connect(userSigner).getAllRegisterData();
  console.log("getAllRegisterData() response: ", response);

  //* Send the reward token to user signer.
  // tx = await rewardTokenContract.approve(rewardTokenContractSigner.address, 10);
  // await tx.wait();
  // const allowance = await rewardTokenContract.allowance(
  //   rewardTokenContract.address,
  //   rewardTokenContractSigner.address
  // );
  // console.log("allowance: ", allowance);
  // tx = await rewardTokenContract
  //   .connect(rewardTokenContractSigner)
  //   .transferFrom(rewardTokenContract.address, userSigner.address, 10);
  // await tx.wait();
  response = await rewardTokenContract
    .connect(userSigner)
    .balanceOf(userSigner.address);
  console.log("balanceOf(userSigner.address) response: ", response);

  tx = await rewardTokenContract
    .connect(projectTeamAccountSigner)
    .transfer(userSigner.address, data.rentFee);
  await tx.wait();

  response = await rewardTokenContract
    .connect(userSigner)
    .balanceOf(userSigner.address);
  console.log("balanceOf(userSigner.address) response: ", response);

  //* Approve.
  tx = await rewardTokenContract
    .connect(userSigner)
    .approve(rentMarketContract.address, data.rentFee);

  //* Rent nft.
  tx = await rentMarketContract
    .connect(userSigner)
    .rentNFTByToken(rentNFTContract.address, 1, serviceSigner.address);
  response = await tx.wait();
  console.log("rentNFTByToken() response: ", response);

  response = await rewardTokenContract
    .connect(userSigner)
    .balanceOf(rentMarketContract.address);
  console.log("balanceOf(rentMarketContract.address) response: ", response);

  response = await rentMarketContract
    .connect(userSigner)
    .getAllPendingRentFee();
  console.log("getAllPendingRentFee() response: ", response);

  //* Increase the block timestamp.
  await helpers.time.increase(10);

  //* Settle.
  tx = await rentMarketContract
    .connect(userSigner)
    .settleRentData(rentNFTContract.address, 1);
  await tx.wait();

  //* Set reward token contract address to reward token share contract.
  tx = await rewardTokenShareContract
    .connect(rewardTokenShareContractSigner)
    .setRewardTokenContractAddress(rewardTokenContractDeployedResponse.address);
  await tx.wait();

  return {
    //* Return deployer.
    rewardTokenContractSigner,
    rewardTokenShareContractSigner,
    rentMarketContractSigner,
    rentNFTContractSigner,
    serviceSigner,
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
    rentNFTContractSigner,
    serviceSigner,
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
