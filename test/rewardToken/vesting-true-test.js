const { expect } = require("chai");
const { BigNumber } = require("ethers");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
} = require("./utility-function");

describe("test the reward token vesting true case.", function () {
  let //* Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
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
      remainSignerArray,
      //* Contract values.
      rewardTokenContract,
      rewardTokenShareContract,
    } = await initializeBeforeEach());
  });

  it("Check the name and symbol of a reward token contract.", async function () {
    //* Get reward token name and symbol.
    const name = await rewardTokenContract.connect(userSigner).name();
    const symbol = await rewardTokenContract.connect(userSigner).symbol();

    expect(name).to.equal(rewardTokenName);
    expect(symbol).to.equal(rewardTokenSymbol);
  });

  it("Check the total allocation.", async function () {
    //* Get total allocation.
    const totalAllocation = await rewardTokenContract
      .connect(userSigner)
      .totalAllocation();
    // console.log("totalAllocation: ", totalAllocation);

    expect(totalAllocation).to.equal(
      BigNumber.from(1000000000).mul(BigNumber.from(10).pow(18))
    );
  });

  it("Check the vesting after duration.", async function () {
    let totalAllocation = await rewardTokenContract
      .connect(userSigner)
      .totalAllocation();
    let released = await rewardTokenContract.connect(userSigner).released();
    expect(released).to.equal(BigNumber.from(0));

    let releasable = await rewardTokenContract.connect(userSigner).releasable();
    console.log("releasable: ", releasable);
    expect(releasable).to.equal(BigNumber.from(0));

    let currentTimestamp = await helpers.time.latest();
    console.log("currentTimestamp: ", currentTimestamp);

    const fiveWeeks = 60 * 60 * 24 * 7 * 5;
    await helpers.time.increase(fiveWeeks + 1);

    currentTimestamp = await helpers.time.latest();
    console.log("currentTimestamp: ", currentTimestamp);

    releasable = await rewardTokenContract.connect(userSigner).releasable();
    console.log("releasable: ", releasable);

    const minimumReleasable = await rewardTokenContract
      .connect(userSigner)
      .minimumReleasable();
    console.log("minimumReleasable: ", minimumReleasable);
    expect(releasable).to.gt(minimumReleasable);
  });
});
