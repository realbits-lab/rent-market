const { expect } = require("chai");
const { BigNumber } = require("ethers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
} = require("./utility-function");

describe("test the reward token share release true case.", function () {
  let //* Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    projectTeamAccountSigner,
    tokenPoolContractAddressSigner,
    remainSignerArray,
    //* Contract values.
    rewardTokenContract,
    rewardTokenShareContract;

  beforeEach(async function () {
    //* Initialize contract and data.
    ({
      //* Signer values.
      rentNFTContractOwnerSigner,
      userSigner,
      projectTeamAccountSigner,
      tokenPoolContractAddressSigner,
      remainSignerArray,
      //* Contract values.
      rewardTokenContract,
      rewardTokenShareContract,
    } = await initializeBeforeEach());

    let released = await rewardTokenContract.connect(userSigner).released();
    // console.log("released: ", released);

    const start = await rewardTokenContract.connect(userSigner).start();
    // console.log("start: ", start);
    const duration = await rewardTokenContract.connect(userSigner).duration();
    // console.log("duration: ", duration);

    let timestamp = await helpers.time.latest();
    // console.log("timestamp: ", timestamp);
    let vestedAmount = await rewardTokenContract
      .connect(userSigner)
      .vestedAmount(timestamp);
    // console.log("vestedAmount: ", vestedAmount);

    let releasable = await rewardTokenContract.connect(userSigner).releasable();
    // console.log("releasable: ", releasable);
    // console.log("releasable/10e18: ", releasable / Math.pow(10, 18));

    let currentTimestamp = await helpers.time.latest();
    console.log("currentTimestamp: ", currentTimestamp);

    const fiveWeeks = 60 * 60 * 24 * 7 * 5;
    await helpers.time.increase(fiveWeeks + 1);

    currentTimestamp = await helpers.time.latest();
    console.log("currentTimestamp: ", currentTimestamp);

    releasable = await rewardTokenContract.connect(userSigner).releasable();
    console.log("releasable: ", releasable);
  });

  it("Check the vesting after duration.", async function () {
    const tx = await rewardTokenContract.release();
    const response = await tx.wait();
  });
});
