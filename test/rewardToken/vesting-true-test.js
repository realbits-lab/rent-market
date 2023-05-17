const { expect } = require("chai");
const {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
} = require("./utility-function");
const { BigNumber } = require("ethers");

describe("test the reward token vesting true case.", function () {
  //*---------------------------------------------------------------------------
  //* Define variables.
  //*---------------------------------------------------------------------------
  let //* Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    //* Contract values.
    rewardTokenContract,
    // rewardTokenVestingWalletContract,
    rewardTokenShareContract;

  beforeEach(async function () {
    //*-------------------------------------------------------------------------
    //* Initialize contract and data.
    //* - Deploy smart contract with fixture and mint NFT.
    //*-------------------------------------------------------------------------
    ({
      //* Signer values.
      rentNFTContractOwnerSigner,
      userSigner,
      remainSignerArray,
      //* Contract values.
      rewardTokenContract,
      // rewardTokenVestingWalletContract,
      rewardTokenShareContract,
    } = await initializeBeforeEach());
  });

  it("Check the name and symbol of a reward token contract.", async function () {
    //*-------------------------------------------------------------------------
    //* Define variables.
    //*-------------------------------------------------------------------------
    const name = await rewardTokenContract.connect(userSigner).name();
    const symbol = await rewardTokenContract.connect(userSigner).symbol();

    expect(name).to.equal(rewardTokenName);
    expect(symbol).to.equal(rewardTokenSymbol);
  });

  it("Check the total allocation.", async function () {
    //*-------------------------------------------------------------------------
    //* Define variables.
    //*-------------------------------------------------------------------------
    const totalAllocation = await rewardTokenContract
      .connect(userSigner)
      .totalAllocation();
    // console.log("totalAllocation: ", totalAllocation);
    expect(totalAllocation).to.equal(
      BigNumber.from(1000000000).mul(BigNumber.from(10).pow(18))
    );
  });
});
