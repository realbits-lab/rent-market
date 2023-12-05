const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { loadFixture } = require("ethereum-waffle");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
  FIVE_WEEKS_TIMESTAMP,
} = require("./utility-function");
const { ethers } = require("hardhat");

describe("test the distribute vesting function case.", function () {
  let //* Signer values.
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
    rentMarketContract;
  let tx, response;

  beforeEach(async function () {
    //* Initialize contract and data.
    ({
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
    } = await initializeBeforeEach());
  });

  it("Check the distribute vesting token function in many accounts case.", async function () {
    const NFT_COUNT = 5;
    // 1 day.
    const RENT_DURATION = 60 * 60 * 24;

    //* Mint many nft.
    let txArray = [];
    for (i = 0; i < NFT_COUNT; i++) {
      //* Create a new signer.
      let mintSigner = ethers.Wallet.createRandom();
      mintSigner = mintSigner.connect(ethers.provider);
      console.log("mintSigner.address: ", mintSigner.address);

      // //* Transfer 1 ether to mint signer for gas fee.
      // await network.provider.send("hardhat_setBalance", [
      //   mintSigner.address,
      //   ethers.utils.hexStripZeros(ethers.utils.parseEther("1").toHexString()),
      // ]);

      tx = await rentNFTContract
        .connect(rentNFTContractSigner)
        // .safeMint(userSigner.address);
        .safeMint(mintSigner.address);
      txArray.push(tx.wait());
    }
    await Promise.all(txArray);
    console.log(`Call safeMint(${userSigner.address}) done.`);

    //* Register many nft.
    const nftCount = await rentNFTContract.connect(userSigner).totalSupply();
    console.log("nftCount: ", nftCount);

    txArray = [];
    for (i = 2; i < nftCount; i++) {
      tx = await rentMarketContract
        .connect(rentNFTContractSigner)
        .registerNFT(rentNFTContract.address, i);
      txArray.push(tx.wait());
    }
    await Promise.all(txArray);
    console.log(`Call registerNFT(${rentNFTContract.address}) done.`);

    //* Get rent fee value.
    const rentFee = (
      await rentMarketContract.getRegisterData(rentNFTContract.address, 2)
    ).rentFee;
    console.log("rentFee: ", rentFee);
    const feeTokenAddress = (
      await rentMarketContract.getRegisterData(rentNFTContract.address, 2)
    ).feeTokenAddress;
    console.log("feeTokenAddress: ", feeTokenAddress);
    const rentFeeByToken = (
      await rentMarketContract.getRegisterData(rentNFTContract.address, 2)
    ).rentFee;
    console.log("rentFeeByToken: ", rentFeeByToken);

    //* Change many nft.
    txArray = [];
    for (i = 2; i < nftCount; i++) {
      tx = await rentMarketContract.connect(rentMarketContractSigner).changeNFT(
        // nftAddress
        rentNFTContract.address,
        // tokenId
        i,
        // rentFee
        rentFee,
        // feeTokenAddress,
        rewardTokenContract.address,
        // rentFeeByToken,
        rentFee,
        // rentDuration
        1
      );
      txArray.push(tx.wait());
    }
    await Promise.all(txArray);
    console.log(`Call changeNFT() done.`);

    //* Transfer token to user.
    tx = await rewardTokenContract
      .connect(projectTeamAccountSigner)
      .transfer(userSigner.address, rentFee.mul(NFT_COUNT));
    await tx.wait();
    console.log(`Call transfer(${userSigner.address}) done.`);

    //* Approve
    tx = await rewardTokenContract
      .connect(userSigner)
      .approve(rentMarketContract.address, rentFee.mul(NFT_COUNT));
    await tx.wait();
    console.log(`Call approve(${rentMarketContract.address}) done.`);

    //* Rent many nft.
    txArray = [];
    for (i = 2; i < nftCount; i++) {
      tx = await rentMarketContract
        .connect(userSigner)
        .rentNFTByToken(rentNFTContract.address, i, serviceSigner.address);
      txArray.push(tx.wait());
    }
    await Promise.all(txArray);
    console.log(
      `Call rentNFTByToken(${rentNFTContract.address}, ${serviceSigner.address}) done.`
    );

    response = await rentMarketContract
      .connect(userSigner)
      .getAllPendingRentFee();
    // console.log("getAllPendingRentFee() response: ", response);

    //* Increase the block timestamp.
    await helpers.time.increase(RENT_DURATION + 1);

    //* Settle all nft rent.
    txArray = [];
    for (i = 2; i < nftCount; i++) {
      tx = await rentMarketContract
        .connect(userSigner)
        .settleRentData(rentNFTContract.address, i, userSigner.address);
      txArray.push(tx.wait());
    }
    await Promise.all(txArray);
    console.log(`Call settleRentData(${rentNFTContract.address}) done.`);

    //* Get all account balance.
    let accountBalanceArray = await rentMarketContract.getAllAccountBalance();
    // console.log("accountBalanceArray: ", accountBalanceArray);
    accountBalanceArray.map((e) => {
      console.log("address: ", e.renterAddress);
      console.log("amount: ", e.amount / Math.pow(10, 18));
    });

    //* Call distribute vesting token function in rent market contract.
    //* Check the gas fee.
    tx = await rentMarketContract.distributeVestingToken(
      rewardTokenContract.address,
      rewardTokenShareContract.address
    );
    await tx.wait();
    console.log(
      `Call distributeVestingToken(${rewardTokenShareContract.address}, ${rewardTokenContract.address}) done.`
    );

    //* Get all account balance.
    accountBalanceArray = await rentMarketContract.getAllAccountBalance();
    // console.log("accountBalanceArray: ", accountBalanceArray);
    accountBalanceArray.map((e) => {
      console.log("address: ", e.accountAddress);
      console.log("amount: ", e.amount / Math.pow(10, 18));
    });
  });
});
