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

  it("Check the balance of a reward token share contract.", async function () {
    //* Get the released amount.
    const released = await rewardTokenContract.connect(userSigner).released();
    console.log("released: ", released);

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

  it("Check the two times release function call revert error.", async function () {
    //* Release vesting.
    await expect(rewardTokenContract.release()).to.be.revertedWith(
      "rewardToken: Releasable amount is smaller than the vesting minimum amount."
    );
  });

  it("Check the reward token balance of rent market contract.", async function () {
    //* Compare the released amount.
    const PROJECT_TEAM_ACCOUNT_SHARE = 40;
    const TOKEN_POOL_CONTRACT_SHARE = 15;
    const RENT_MARKET_CONTRACT_SHARE = 45;

    //* Get the released amount.
    const released = await rewardTokenContract.connect(userSigner).released();

    //* Add rent market contract to reward token share contract.
    tx = await rewardTokenShareContract
      .connect(rewardTokenShareContractSigner)
      .addRentMarketContractAddress(rentMarketContract.address);
    await tx.wait();

    //* Call the release function of reward token share contract.
    tx = await rewardTokenShareContract.connect(userSigner).release();
    await tx.wait();

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

  it("Check the distributeVestingToken function.", async function () {
    const allowance = await rewardTokenContract.allowance(
      rewardTokenShareContract.address,
      rentMarketContract.address
    );

    //* Get account balance array from rent market.
    //* Calculate the expected amount of each account balance.
    const totalBalance = await rentMarketContract.getTotalAccountBalance(
      rewardTokenContract.address
    );
    // console.log("totalBalance: ", totalBalance);
    let accountBalanceArray = await rentMarketContract.getAllAccountBalance();
    // console.log("accountBalanceArray: ", accountBalanceArray);

    let sumVestingBalance = BigNumber.from(0);
    const vestingAccountBalanceArray = accountBalanceArray.map(function (data) {
      let amount = data.amount;
      if (data.tokenAddress === rewardTokenContract.address) {
        const vestingAmount = allowance.mul(data.amount).div(totalBalance);
        // console.log("vestingAmount: ", vestingAmount);
        // console.log("data.amount: ", data.amount);
        amount = data.amount.add(vestingAmount);
        sumVestingBalance = sumVestingBalance.add(vestingAmount);
      }

      return {
        accountAddress: data.accountAddress,
        tokenAddress: data.tokenAddress,
        amount: amount,
      };
    });
    await Promise.all(vestingAccountBalanceArray);
    console.log("vestingAccountBalanceArray: ", vestingAccountBalanceArray);

    //* Compare the each expected amount as actual amount.
    tx = await rentMarketContract.distributeVestingToken(
      rewardTokenShareContract.address,
      rewardTokenContract.address
    );
    await tx.wait();

    accountBalanceArray = await rentMarketContract.getAllAccountBalance();
    console.log("accountBalanceArray: ", accountBalanceArray);

    console.log("allowance: ", allowance);
    console.log("sumVestingBalance: ", sumVestingBalance);
    for (let i = 0; i < accountBalanceArray.length; i++) {
      for (let j = 0; j < vestingAccountBalanceArray.length; j++) {
        if (
          accountBalanceArray[i].accountAddress ===
          vestingAccountBalanceArray[j].accountAddress
        ) {
          console.log(
            "accountBalanceArray[i].amount: ",
            accountBalanceArray[i].amount
          );
          console.log(
            "vestingAccountBalanceArray[j].amount: ",
            vestingAccountBalanceArray[j].amount
          );
          console.log(
            "accountBalanceArray[i].accountAddress: ",
            accountBalanceArray[i].accountAddress
          );
          console.log(
            "rentMarketContractSigner.address: ",
            rentMarketContractSigner.address
          );
          if (
            accountBalanceArray[i].accountAddress ===
            rentMarketContractSigner.address
          ) {
            expect(accountBalanceArray[i].amount).eq(
              vestingAccountBalanceArray[j].amount
                .add(allowance)
                .sub(sumVestingBalance)
            );
          } else {
            expect(accountBalanceArray[i].amount).eq(
              vestingAccountBalanceArray[j].amount
            );
          }
        }
      }
    }

    // const promises = accountBalanceArray.map(async function (data) {
    //   const found = await vestingAccountBalanceArray.find(async function (e) {
    //     console.log("e: ", e);
    //     console.log("data: ", data);
    //     return e.accountAddress === data.accountAddress;
    //   });

    //   console.log("found: ", found);
    //   if (found !== undefined) {
    //     expect(found.amount).eq(data.amount);
    //   }

    //   return data;
    // });
    // await Promise.all(promises);
  });
});
