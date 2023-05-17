const { expect } = require("chai");
const {
  rewardTokenName,
  rewardTokenSymbol,
  initializeBeforeEach,
  sleep,
} = require("./utility-function");

describe("test the reward token vesting true case.", function () {
  //*---------------------------------------------------------------------------
  //* Define variables.
  //*---------------------------------------------------------------------------
  let //* Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    //* Contract values.
    rewardTokenContract;

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
});
