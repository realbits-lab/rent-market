const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const {
  mineBlocks,
  initializeBeforeEach,
  registerNFT,
} = require("./utility-function");

describe("test withdrawMyBalance true case.", function () {
  let // Signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentMarketContract,
    testNFTContract,
    testTokenContract;

  beforeEach(async function () {
    // 1. Initialize contract and data.
    // - 1-1. Deploy smart contracts with fixture and mint NFT.
    // - 1-2. Remove all data and register service and collection.
    // - 1-3. Register token.
    // - 1-4. Register collection.
    // - 1-5. Register service.
    const response = await initializeBeforeEach();
    // print({ response });

    // 2. Set each returned value.
    ({
      // Signer values.
      rentMarketContractOwnerSigner,
      testNFTContractOwnerSigner,
      serviceContractOwnerSigner,
      userSigner,
      remainSignerArray,
      // Contract values.
      rentMarketContract,
      testNFTContract,
      testTokenContract,
    } = response);
  });

  it("Check normal withdraw case with base coin.", async function () {
    // 1. Register NFT.
    let response;
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;
    const preRentMarketContractBalance = await ethers.provider.getBalance(
      rentMarketContract.address
    );

    // 1-1. Reqeust to register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 1-2. Change rent fee to 1 ether unit.
    tx = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .changeNFT(
        testNFTContract.address,
        startTokenId,
        ethers.utils.parseUnits("1", "ether"),
        ethers.constants.AddressZero,
        BigNumber.from(0),
        BigNumber.from(100)
      );
    await tx.wait();

    // 2. Get rentFee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const responseRentFee = response["rentFee"];
    const responseRentDuration = response["rentDuration"];
    // console.log("responseRentFee: ", responseRentFee / Math.pow(10, 18));
    // console.log("responseRentDuration: ", responseRentDuration.toNumber());

    // 3. Rent NFT.
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        {
          value: responseRentFee,
        }
      );
    await tx.wait();

    // 4. Progress responseRentDuration+1 blocks.
    // console.log("Progress responseRentDuration+1 blocks.");
    await mineBlocks(responseRentDuration.add(1).toNumber(), ethers.provider);

    // 5. Do settleRentData.
    // console.log("Do settleRentData.");
    transaction = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .settleRentData(
        testNFTContract.address,
        startTokenId,
        userSigner.address
      );
    await transaction.wait();

    // 6. Check each quota balanace for renter, rentee, and market.
    // console.log("Check each quota balanace for renter, rentee, and market.");
    const [renterQuota, serviceQuota, marketQuota] = await rentMarketContract
      .connect(userSigner)
      .getFeeQuota();
    // console.log("renterQuota: ", renterQuota);
    // console.log("serviceQuota: ", serviceQuota);
    // console.log("marketQuota: ", marketQuota);
    const renterShare = responseRentFee.mul(renterQuota).div(100);
    const serviceShare = responseRentFee.mul(serviceQuota).div(100);
    const marketShare = responseRentFee.mul(marketQuota).div(100);

    // 6-1. Check renter balance.
    expect(
      await rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .getMyBalance(ethers.constants.AddressZero)
    ).to.be.equal(renterShare);

    // 6-2. Check rentee balance.
    expect(
      await rentMarketContract
        .connect(serviceContractOwnerSigner)
        .getMyBalance(ethers.constants.AddressZero)
    ).to.be.equal(serviceShare);

    // 6-3. Check market balance.
    expect(
      await rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .getMyBalance(ethers.constants.AddressZero)
    ).to.be.equal(marketShare);

    // 7. Check rent data is empty.
    // console.log("Check rent data is empty.");
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);

    expect(response).to.deep.equal([
      ethers.constants.AddressZero,
      BigNumber.from(0),
      BigNumber.from(0),
      ethers.constants.AddressZero,
      BigNumber.from(0),
      false,
      BigNumber.from(0),
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      BigNumber.from(0),
    ]);

    // 8. Withdraw my balance.
    // console.log("Withdraw my balance.");

    // 8-1. Withdraw rentMarketContractOwnerSigner share and check the expect.
    let preTestNFTContractOwnerSignerBalance =
      await testNFTContractOwnerSigner.getBalance();
    // ethers TransactionResponse type.
    transaction = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .withdrawMyBalance(
        testNFTContractOwnerSigner.address,
        ethers.constants.AddressZero
      );
    // ethers TransactionReceipt type.
    receipt = await transaction.wait();
    gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    let postTestNFTContractOwnerSignerBalance =
      await testNFTContractOwnerSigner.getBalance();

    expect(postTestNFTContractOwnerSignerBalance).to.be.equal(
      preTestNFTContractOwnerSignerBalance.add(renterShare).sub(gasUsed)
    );

    // 8-2. Withdraw serviceContractOwnerSigner share and check the expect.
    let preServiceContractOwnerSignerBalance =
      await serviceContractOwnerSigner.getBalance();
    transaction = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .withdrawMyBalance(
        serviceContractOwnerSigner.address,
        ethers.constants.AddressZero
      );
    receipt = await transaction.wait();
    gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    let postServiceContractOwnerSignerBalance =
      await serviceContractOwnerSigner.getBalance();

    expect(postServiceContractOwnerSignerBalance).to.be.equal(
      preServiceContractOwnerSignerBalance.add(serviceShare).sub(gasUsed)
    );

    // 8-3. Wwithdraw market share and check the expect.
    let preRentMarketContractOwnerSignerBalance =
      await rentMarketContractOwnerSigner.getBalance();
    transaction = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .withdrawMyBalance(
        rentMarketContractOwnerSigner.address,
        ethers.constants.AddressZero
      );
    receipt = await transaction.wait();
    gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    let postRentMarketContractOwnerSignerBalance =
      await rentMarketContractOwnerSigner.getBalance();

    expect(postRentMarketContractOwnerSignerBalance).to.be.equal(
      preRentMarketContractOwnerSignerBalance.add(marketShare).sub(gasUsed)
    );

    // 9. Check rent market contract balance.
    const rentMarketContractBalance = await ethers.provider.getBalance(
      rentMarketContract.address
    );
    expect(rentMarketContractBalance).to.be.equal(preRentMarketContractBalance);
  });

  it("Check normal withdraw case with erc20 token.", async function () {
    // 1. Register NFT.
    let response;
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    // 1-1. Reqeust to register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 1-2. Change rent fee to 1 ether unit.
    const rentFeeByToken = ethers.utils.parseEther("5");
    transaction = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .changeNFT(
        testNFTContract.address,
        startTokenId,
        ethers.utils.parseUnits("1", "ether"),
        testTokenContract.address,
        rentFeeByToken,
        BigNumber.from(100)
      );
    await transaction.wait();

    // 2. Get rentFee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const responseRentFee = response["rentFee"];
    const responseRentDuration = response["rentDuration"];

    // 3. Transfer test token to userSigner address by rentFeeByToken.
    transaction = await testTokenContract.transfer(
      userSigner.address,
      rentFeeByToken
    );
    await transaction.wait();
    transaction = await testTokenContract
      .connect(userSigner)
      .approve(rentMarketContract.address, rentFeeByToken);
    await transaction.wait();

    // 4. Rent NFT.
    transaction = await rentMarketContract
      .connect(userSigner)
      .rentNFTByToken(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address
      );
    await transaction.wait();

    // 5. Progress 105 blocks.
    await mineBlocks(responseRentDuration.add(1).toNumber(), ethers.provider);

    // 6. Do settleRentData.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    // console.log("response: ", response);
    const responseRentFeeByToken = response["rentFeeByToken"];
    expect(responseRentFeeByToken).to.be.equal(rentFeeByToken);

    transaction = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .settleRentData(
        testNFTContract.address,
        startTokenId,
        userSigner.address
      );
    await transaction.wait();

    // 7. Check each quota balanace for renter, rentee, and market.
    const [renterQuota, serviceQuota, marketQuota] = await rentMarketContract
      .connect(userSigner)
      .getFeeQuota();
    const renterShare = responseRentFeeByToken.mul(renterQuota).div(100);
    const serviceShare = responseRentFeeByToken.mul(serviceQuota).div(100);
    const marketShare = responseRentFeeByToken.mul(marketQuota).div(100);

    // 7-1. Check renter balance.
    expect(
      await rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .getMyBalance(testTokenContract.address)
    ).to.be.equal(renterShare);

    // 7-2. Check rentee balance.
    expect(
      await rentMarketContract
        .connect(serviceContractOwnerSigner)
        .getMyBalance(testTokenContract.address)
    ).to.be.equal(serviceShare);

    // 7-3. Check market balance.
    expect(
      await rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .getMyBalance(testTokenContract.address)
    ).to.be.equal(marketShare);

    // 8. Check rent data is empty.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);

    expect(response).to.deep.equal([
      ethers.constants.AddressZero,
      BigNumber.from(0),
      BigNumber.from(0),
      ethers.constants.AddressZero,
      BigNumber.from(0),
      false,
      BigNumber.from(0),
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      BigNumber.from(0),
    ]);

    // 9. Withdraw my balance.

    // 9-1. Withdraw rentMarketContractOwnerSigner share and check the expect.
    let preTestNFTContractOwnerSignerBalance = await testTokenContract
      .connect(userSigner)
      .balanceOf(testNFTContractOwnerSigner.address);
    transaction = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .withdrawMyBalance(
        testNFTContractOwnerSigner.address,
        testTokenContract.address
      );
    receipt = await transaction.wait();
    gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    let postTestNFTContractOwnerSignerBalance = await testTokenContract
      .connect(userSigner)
      .balanceOf(testNFTContractOwnerSigner.address);

    expect(postTestNFTContractOwnerSignerBalance).to.be.equal(
      preTestNFTContractOwnerSignerBalance.add(renterShare)
    );

    // 9-2. Withdraw serviceContractOwnerSigner share and check the expect.
    let preServiceContractOwnerSignerBalance = await testTokenContract
      .connect(userSigner)
      .balanceOf(serviceContractOwnerSigner.address);
    transaction = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .withdrawMyBalance(
        serviceContractOwnerSigner.address,
        testTokenContract.address
      );
    receipt = await transaction.wait();
    gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    let postServiceContractOwnerSignerBalance = await testTokenContract
      .connect(userSigner)
      .balanceOf(serviceContractOwnerSigner.address);

    expect(postServiceContractOwnerSignerBalance).to.be.equal(
      preServiceContractOwnerSignerBalance.add(serviceShare)
    );

    // 9-3. Withdraw market share and check the expect.
    let preRentMarketContractOwnerSignerBalance = await testTokenContract
      .connect(userSigner)
      .balanceOf(rentMarketContractOwnerSigner.address);
    transaction = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .withdrawMyBalance(
        rentMarketContractOwnerSigner.address,
        testTokenContract.address
      );
    receipt = await transaction.wait();
    gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    let postRentMarketContractOwnerSignerBalance = await testTokenContract
      .connect(userSigner)
      .balanceOf(rentMarketContractOwnerSigner.address);

    expect(postRentMarketContractOwnerSignerBalance).to.be.equal(
      preRentMarketContractOwnerSignerBalance.add(marketShare)
    );
  });
});
