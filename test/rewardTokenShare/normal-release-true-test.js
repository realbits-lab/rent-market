const { expect } = require("chai");
const { BigNumber } = require("ethers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
  FIVE_WEEKS_TIMESTAMP,
} = require("./utility-function");

describe("test the reward token share release true case.", function () {
  let //* Signer values.
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
    rentMarketContract;

  beforeEach(async function () {
    //* Initialize contract and data.
    ({
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
    } = await initializeBeforeEach());
  });

  it("Check the reward token balance of reward token share contract.", async function () {
    const start = await rewardTokenContract.connect(userSigner).start();
    console.log("start: ", start);

    //* Proceed the block timestamp.
    await helpers.time.increase(FIVE_WEEKS_TIMESTAMP + 1);
    const tx = await rewardTokenContract.release();
    const response = await tx.wait();

    //* Compare the released amount as the minimum releasable.
    const released = await rewardTokenContract.connect(userSigner).released();
    // console.log("released: ", released);
    const minimumReleasable = await rewardTokenContract
      .connect(userSigner)
      .minimumReleasable();
    // console.log("minimumReleasable: ", minimumReleasable);
    expect(released).to.gt(minimumReleasable);

    //* Check the reward token balance of reward token share contract.
    const rewardTokenShareBalance =
      await rewardTokenShareContract.getRewardTokenBalance();
    // console.log("rewardTokenShareBalance: ", rewardTokenShareBalance);
    expect(rewardTokenShareBalance).eq(released);
  });

  it("Check the reward token balance of rent market contract.", async function () {
    //* Call the release function of reward token share contract.
    const tx = await rewardTokenShareContract.connect(userSigner).release();
    const response = await tx.wait();

    //* Get the reward token balance of rent market contract.
  });
});
