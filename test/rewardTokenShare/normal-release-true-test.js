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

describe("test the reward token share release true case.", function () {
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

  it("Check the reward token balance of reward token share contract.", async function () {
    //* Get the released amount.
    const released = await rewardTokenContract.connect(userSigner).released();
    // console.log("released: ", released);

    //* Get the minimum releasable amount.
    const minimumReleasable = await rewardTokenContract
      .connect(userSigner)
      .minimumReleasable();
    // console.log("minimumReleasable: ", minimumReleasable);
    expect(released).to.gt(minimumReleasable);

    //* Check the reward token balance of reward token share contract.
    const rewardTokenShareBalance =
      await rewardTokenShareContract.getRewardTokenBalance();
    // console.log("rewardTokenShareBalance: ", rewardTokenShareBalance);

    //* Compare the released amount as the minimum releasable.
    expect(rewardTokenShareBalance).eq(released);
  });

  it("Check the two times vesting of a reward token vesting.", async function () {
    //* Get released amount.
    const released = await rewardTokenContract.connect(userSigner).released();
    // console.log("released: ", released);

    //* Get the minimum releasable amount.
    const minimumReleasable = await rewardTokenContract
      .connect(userSigner)
      .minimumReleasable();
    // console.log("minimumReleasable: ", minimumReleasable);

    //* Compare the released amount as the minimum releasable.
    expect(released).to.gt(minimumReleasable);
    expect(released).to.lt(minimumReleasable.mul(2));
  });

  it("Check the reward token balance of rent market contract.", async function () {
    //* Compare the released amount.
    const PROJECT_TEAM_ACCOUNT_SHARE = 40;
    const TOKEN_POOL_CONTRACT_SHARE = 15;
    const RENT_MARKET_CONTRACT_SHARE = 45;

    //* Add rent market contract to reward token share contract.
    let tx = await rewardTokenShareContract
      .connect(rewardTokenShareContractSigner)
      .addRentMarketContractAddress(rentMarketContract.address);
    await tx.wait();

    response = await rentMarketContract
      .connect(userSigner)
      .getTotalAccountBalance(rewardTokenContract.address);
    // console.log("getTotalAccountBalance() response: ", response);

    let rewardTokenShareContractBalance = await rewardTokenContract.balanceOf(
      rewardTokenShareContract.address
    );
    // console.log(
    //   "rewardTokenShareContractBalance: ",
    //   rewardTokenShareContractBalance / Math.pow(10, 18)
    // );

    let projectTeamAccountBalance = await rewardTokenContract.balanceOf(
      projectTeamAccountSigner.address
    );
    // console.log("projectTeamAccountBalance: ", projectTeamAccountBalance);
    let tokenPoolContractBalance = await rewardTokenContract.balanceOf(
      tokenPoolContractAddressSigner.address
    );
    // console.log(
    //   "tokenPoolContractBalance: ",
    //   tokenPoolContractBalance / Math.pow(10, 18)
    // );
    let rentMarketContractAllowance = await rewardTokenContract.allowance(
      rewardTokenShareContract.address,
      rentMarketContract.address
    );
    // console.log("rentMarketContract.address: ", rentMarketContract.address);
    // console.log(
    //   "rentMarketContractAllowance: ",
    //   rentMarketContractAllowance / Math.pow(10, 18)
    // );

    //* Call the release function of reward token share contract.
    tx = await rewardTokenShareContract.connect(userSigner).release();
    await tx.wait();
    const released = await rewardTokenContract.connect(userSigner).released();
    // console.log("released: ", released / Math.pow(10, 18));

    //* Check the reward token share contract balance is zero.
    rewardTokenShareContractBalance = await rewardTokenContract.balanceOf(
      rewardTokenShareContract.address
    );
    // console.log(
    //   "rewardTokenShareContractBalance: ",
    //   rewardTokenShareContractBalance / Math.pow(10, 18)
    // );
    // expect(rewardTokenShareContractBalance).eq(0);

    //* Compare the project team account balance.
    projectTeamAccountBalance = await rewardTokenContract.balanceOf(
      projectTeamAccountSigner.address
    );
    // console.log("projectTeamAccountBalance: ", projectTeamAccountBalance);
    projectTeamAccountBalance = projectTeamAccountBalance.sub(
      BigNumber.from(199999999).mul(BigNumber.from(10).pow(18))
    );
    // console.log(
    //   "projectTeamAccountBalance: ",
    //   projectTeamAccountBalance / Math.pow(10, 18)
    // );
    // console.log("actual: ", released.mul(PROJECT_TEAM_ACCOUNT_SHARE).div(100));
    expect(projectTeamAccountBalance).eq(
      released.mul(PROJECT_TEAM_ACCOUNT_SHARE).div(100)
    );

    //* Compare the token pool contract balance.
    tokenPoolContractBalance = await rewardTokenContract.balanceOf(
      tokenPoolContractAddressSigner.address
    );
    // console.log(
    //   "tokenPoolContractBalance: ",
    //   tokenPoolContractBalance / Math.pow(10, 18)
    // );
    expect(tokenPoolContractBalance).eq(
      released.mul(TOKEN_POOL_CONTRACT_SHARE).div(100)
    );

    //* Compare the rent market contract balance.
    rentMarketContractAllowance = await rewardTokenContract.allowance(
      rewardTokenShareContract.address,
      rentMarketContract.address
    );
    // console.log("rentMarketContract.address: ", rentMarketContract.address);
    // console.log(
    //   "rentMarketContractAllowance: ",
    //   rentMarketContractAllowance / Math.pow(10, 18)
    // );
    expect(rentMarketContractAllowance).eq(
      released.sub(projectTeamAccountBalance).sub(tokenPoolContractBalance)
    );
  });
});
