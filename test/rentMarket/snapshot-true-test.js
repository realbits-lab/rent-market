const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const {
  initializeBeforeEach,
  registerNFT,
  sleep,
} = require("./utility-function");

describe("test settleRentData true case.", function () {
  //*---------------------------------------------------------------------------
  //* Define variables.
  //*---------------------------------------------------------------------------
  let //* Signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    //* Contract values.
    rentMarketContract,
    testNFTContract,
    testTokenContract;

  beforeEach(async function () {
    //*-------------------------------------------------------------------------
    //* Initialize contract and data.
    //*-------------------------------------------------------------------------
    const response = await initializeBeforeEach();

    //*-------------------------------------------------------------------------
    //* Set each returned value.
    //* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    //* brackets are required.
    //*-------------------------------------------------------------------------
    ({
      //* Signer values.
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

  it("Check snapshot for a single settlement case.", async () => {
    //*-------------------------------------------------------------------------
    //* Define variables.
    //*-------------------------------------------------------------------------
    const startTokenId = 1;
    const endTokenId = 1;
    //* Define progress time as second unit and should be between 2 to 9.
    const progressTime = 2;
    const defaultRentDuration = 100;
    let tx;
    let response;
    let txArray = [];

    //*-------------------------------------------------------------------------
    //* Register NFT.
    //*-------------------------------------------------------------------------
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    //*-------------------------------------------------------------------------
    //* Get rent fee value of the startTokenId NFT.
    //*-------------------------------------------------------------------------
    const rentFee = (
      await rentMarketContract
        .connect(userSigner)
        .getRegisterData(testNFTContract.address, startTokenId)
    )["rentFee"];

    //*-------------------------------------------------------------------------
    //* Change NFT rentDudation as 1 second for test.
    //*-------------------------------------------------------------------------
    tx = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .changeNFT(
        testNFTContract.address,
        startTokenId,
        rentFee,
        ethers.constants.AddressZero,
        0,
        1
      );
    await tx.wait();

    //*-------------------------------------------------------------------------
    //* Rent startTokenId NFT.
    //*-------------------------------------------------------------------------
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        {
          value: rentFee,
        }
      );
    await tx.wait();

    //*-------------------------------------------------------------------------
    //* Wait some times.
    //*-------------------------------------------------------------------------
    await sleep(progressTime * 1000);

    //*-------------------------------------------------------------------------
    //* Progress blockchain network blocks.
    //*-------------------------------------------------------------------------
    await hre.network.provider.send("hardhat_mine", [`0x${progressTime}`]);

    //*-------------------------------------------------------------------------
    //* Settle rent data.
    //*-------------------------------------------------------------------------
    txArray = [];
    const latestBlock = await ethers.provider.getBlock("latest");
    const allRentArray = await rentMarketContract.getAllRentData();

    //*-------------------------------------------------------------------------
    //* Check the previous snapshot data.
    //*-------------------------------------------------------------------------
    //* renter address: testNFTContractOwnerSigner.address
    tx = await rentMarketContract.makeSnapshot();
    await tx.wait();
    let snapshotId = await rentMarketContract.getCurrentSnapshotId();

    let balanceResult = await rentMarketContract.balanceOfAt(
      testNFTContractOwnerSigner.address,
      snapshotId
    );
    // console.log("snapshotId: ", snapshotId);
    // console.log("balanceResult: ", balanceResult);
    // console.log("balanceResult[balance]: ", balanceResult["balance"]);
    // console.log(
    //   "balanceResult[balanceByToken]: ",
    //   balanceResult["balanceByToken"]
    // );
    // console.log("balanceResult[found]: ", balanceResult["found"]);
    if (balanceResult["found"] === false) {
      balanceResult["balance"] = await rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .getMyBalance(ethers.constants.AddressZero);
    }
    // console.log("balanceResult[balance]: ", balanceResult["balance"]);
    expect(balanceResult["balance"]).to.be.equal(BigNumber.from(0));
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //* service address: serviceContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      serviceContractOwnerSigner.address,
      snapshotId
    );
    // console.log("balanceResult[balance]: ", balanceResult["balance"]);
    if (balanceResult["found"] === false) {
      balanceResult["balance"] = await rentMarketContract
        .connect(serviceContractOwnerSigner)
        .getMyBalance(ethers.constants.AddressZero);
    }
    expect(balanceResult["balance"]).to.be.equal(BigNumber.from(0));
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //* market address: rentMarketContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      rentMarketContractOwnerSigner.address,
      snapshotId
    );
    // console.log("balanceResult[balance]: ", balanceResult["balance"]);
    if (balanceResult["found"] === false) {
      balanceResult["balance"] = await rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .getMyBalance(ethers.constants.AddressZero);
    }
    expect(balanceResult["balance"]).to.be.equal(BigNumber.from(0));
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //*-------------------------------------------------------------------------
    //* Make transaction for settleRentData function.
    //*-------------------------------------------------------------------------
    allRentArray.map(async (element) => {
      const currentTimestamp = BigNumber.from(latestBlock.timestamp);
      const endTimestamp = element["rentStartTimestamp"].add(
        element["rentDuration"]
      );
      // console.log("currentTimestamp: ", currentTimestamp);
      // console.log("endTimestamp: ", endTimestamp);

      if (currentTimestamp.gt(endTimestamp) === true) {
        const tx = rentMarketContract.settleRentData(
          element["nftAddress"],
          element["tokenId"],
          element["renteeAddress"]
        );
        txArray.push(tx);
      }
    });
    const txPromisesResult = await Promise.all(txArray);
    const waitPromises = txPromisesResult.map(async (element) => {
      return element.wait();
    });
    await Promise.all(waitPromises);

    //*-------------------------------------------------------------------------
    //* Get each balanace for owner, service, and market.
    //*-------------------------------------------------------------------------
    let realRenterBalance = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    let realServiceBalance = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    let realMarketBalance = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);

    //*-------------------------------------------------------------------------
    //* Get expected value of each quota for renter, rentee, and market.
    //*-------------------------------------------------------------------------
    const [renterQuota, serviceQuota, marketQuota] =
      await rentMarketContract.getFeeQuota();
    let expectedRenterBalance = rentFee.mul(renterQuota).div(100);
    let expectedServiceBalance = rentFee.mul(serviceQuota).div(100);
    let expectedMarketBalance = rentFee
      .sub(expectedRenterBalance)
      .sub(expectedServiceBalance);

    //*-------------------------------------------------------------------------
    //* Check each balance is equal to quota * rentFee.
    //*-------------------------------------------------------------------------
    expect(realRenterBalance).to.be.equal(expectedRenterBalance);
    expect(realServiceBalance).to.be.equal(expectedServiceBalance);
    expect(realMarketBalance).to.be.equal(expectedMarketBalance);

    //*-------------------------------------------------------------------------
    //* Check the post snapshot data.
    //*-------------------------------------------------------------------------
    tx = await rentMarketContract.makeSnapshot();
    await tx.wait();
    snapshotId = await rentMarketContract.getCurrentSnapshotId();

    //* renter address: testNFTContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      testNFTContractOwnerSigner.address,
      snapshotId
    );
    if (balanceResult["found"] === true) {
      realRenterBalance = balanceResult["balance"];
    }
    // console.log("snapshotId: ", snapshotId);
    // console.log("balanceResult: ", balanceResult);
    // console.log("balanceResult[balance]: ", balanceResult["balance"]);
    // console.log(
    //   "balanceResult[balanceByToken]: ",
    //   balanceResult["balanceByToken"]
    // );
    // console.log("rentFee: ", rentFee);
    // console.log("expectedRenterBalance: ", expectedRenterBalance);
    expect(realRenterBalance).to.be.equal(expectedRenterBalance);
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //* service address: serviceContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      serviceContractOwnerSigner.address,
      snapshotId
    );
    if (balanceResult["found"] === true) {
      realServiceBalance = balanceResult["balance"];
    }
    expect(realServiceBalance).to.be.equal(expectedServiceBalance);
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //* market address: rentMarketContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      rentMarketContractOwnerSigner.address,
      snapshotId
    );
    if (balanceResult["found"] === true) {
      realMarketBalance = balanceResult["balance"];
    }
    expect(realMarketBalance).to.be.equal(expectedMarketBalance);
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));
  });

  it("Check snapshot for multiple settlement cases.", async () => {
    //*-------------------------------------------------------------------------
    //* Define variables.
    //*-------------------------------------------------------------------------
    const startTokenId = 1;
    const endTokenId = 5;
    const defaultRentDuration = 100;
    //* Define progress time as second unit and should be between 2 to 9.
    const progressTime = 2;
    let txPromisesResult;
    let waitPromises;
    let rentFeeArray = [];
    let response;
    let txArray = [];

    //*-------------------------------------------------------------------------
    //* Register NFT.
    //*-------------------------------------------------------------------------
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    //*-------------------------------------------------------------------------
    //* Get rent fee of the previous registered NFT.
    //*-------------------------------------------------------------------------
    for (let i = startTokenId; i <= endTokenId; i++) {
      const tokenId = i - startTokenId + 1;
      const rentFee = (
        await rentMarketContract
          .connect(userSigner)
          .getRegisterData(testNFTContract.address, tokenId)
      )["rentFee"];
      rentFeeArray.push(rentFee);
    }

    //*-------------------------------------------------------------------------
    //* Change NFT rentDudation as 1 second.
    //*-------------------------------------------------------------------------
    txArray = [];
    for (let i = startTokenId; i <= endTokenId; i++) {
      const idx = i - startTokenId;
      const tokenId = i - startTokenId + 1;
      const tx = rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .changeNFT(
          testNFTContract.address,
          tokenId,
          rentFeeArray[idx],
          ethers.constants.AddressZero,
          0,
          1
        );
      txArray.push(tx);
    }
    txPromisesResult = await Promise.all(txArray);
    waitPromises = txPromisesResult.map(async (element) => {
      return element.wait();
    });
    await Promise.all(waitPromises);

    //*-------------------------------------------------------------------------
    //* Rent each NFT.
    //*-------------------------------------------------------------------------
    txArray = [];
    for (let i = startTokenId; i <= endTokenId; i++) {
      const idx = i - startTokenId;
      const tokenId = i - startTokenId + 1;
      tx = rentMarketContract
        .connect(userSigner)
        .rentNFT(
          testNFTContract.address,
          tokenId,
          serviceContractOwnerSigner.address,
          {
            value: rentFeeArray[idx],
          }
        );
      txArray.push(tx);
    }
    txPromisesResult = await Promise.all(txArray);
    waitPromises = txPromisesResult.map(async (element) => {
      return element.wait();
    });
    await Promise.all(waitPromises);

    //*-------------------------------------------------------------------------
    //* Wait some times.
    //*-------------------------------------------------------------------------
    await sleep(progressTime * 1000);

    //*-------------------------------------------------------------------------
    //* Progress blocks.
    //*-------------------------------------------------------------------------
    await hre.network.provider.send("hardhat_mine", [`0x${progressTime}`]);

    //*-------------------------------------------------------------------------
    //* Check the previous snapshot data.
    //*-------------------------------------------------------------------------
    tx = await rentMarketContract.makeSnapshot();
    await tx.wait();
    let snapshotId = await rentMarketContract.getCurrentSnapshotId();

    //* renter address: testNFTContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      testNFTContractOwnerSigner.address,
      snapshotId
    );
    let renterTotalFee = balanceResult["balance"];
    let renterTotalFeeByToken = balanceResult["balanceByToken"];
    // console.log("testNFTContractOwnerSigner");
    // console.log("renterTotalFee: ", renterTotalFee);

    //* service address: serviceContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      serviceContractOwnerSigner.address,
      snapshotId
    );
    let serviceTotalFee = balanceResult["balance"];
    let serviceTotalFeeByToken = balanceResult["balanceByToken"];

    //* market address: rentMarketContractOwnerSigner.address
    balanceResult = await rentMarketContract.balanceOfAt(
      rentMarketContractOwnerSigner.address,
      snapshotId
    );
    let marketTotalFee = balanceResult["balance"];
    let marketTotalFeeByToken = balanceResult["balanceByToken"];

    //*-------------------------------------------------------------------------
    //* Settle rent data.
    //*-------------------------------------------------------------------------
    const latestBlock = await ethers.provider.getBlock("latest");
    const allRentArray = await rentMarketContract.getAllRentData();

    //*-------------------------------------------------------------------------
    //* Make transaction for settleRentData function.
    //*-------------------------------------------------------------------------
    txArray = [];
    allRentArray.map(async (element) => {
      if (
        BigNumber.from(latestBlock.timestamp).gt(
          element["rentStartTimestamp"].add(element["rentDuration"])
        )
      ) {
        const tx = rentMarketContract.settleRentData(
          element["nftAddress"],
          element["tokenId"],
          element["renteeAddress"]
        );
        txArray.push(tx);
      }
    });
    txPromisesResult = await Promise.all(txArray);
    waitPromises = txPromisesResult.map(async (element) => {
      return element.wait();
    });
    await Promise.all(waitPromises);

    //*-------------------------------------------------------------------------
    //* Get real value of each balanace for renter, rentee, and market.
    //*-------------------------------------------------------------------------
    let realRenterBalance = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    let realServiceBalance = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    let realMarketBalance = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);

    //*-------------------------------------------------------------------------
    //* Get expected total value of each quota for owner, service, and market.
    //*-------------------------------------------------------------------------
    let expectedRenteeBalance = BigNumber.from(0);
    let expectedRenterBalance = BigNumber.from(0);
    let expectedServiceBalance = BigNumber.from(0);
    let expectedMarketBalance = BigNumber.from(0);
    const [renterQuota, serviceQuota, marketQuota] =
      await rentMarketContract.getFeeQuota();
    for (let i = startTokenId; i <= endTokenId; i++) {
      const idx = i - startTokenId;

      expectedRenteeBalance = rentFeeArray[idx].add(expectedRenteeBalance);

      const renterBalance = rentFeeArray[idx].mul(renterQuota).div(100);
      expectedRenterBalance = renterBalance.add(expectedRenterBalance);

      const serviceBalance = rentFeeArray[idx].mul(serviceQuota).div(100);
      expectedServiceBalance = serviceBalance.add(expectedServiceBalance);

      const marketBalance = rentFeeArray[idx]
        .sub(renterBalance)
        .sub(serviceBalance);
      expectedMarketBalance = marketBalance.add(expectedMarketBalance);
    }

    //*-------------------------------------------------------------------------
    //* Check each balance.
    //*-------------------------------------------------------------------------
    expect(realRenterBalance).to.be.equal(expectedRenterBalance);
    expect(realServiceBalance).to.be.equal(expectedServiceBalance);
    expect(realMarketBalance).to.be.equal(expectedMarketBalance);

    //*-------------------------------------------------------------------------
    //* Check the post snapshot data.
    //*-------------------------------------------------------------------------
    tx = await rentMarketContract.makeSnapshot();
    await tx.wait();
    snapshotId = await rentMarketContract.getCurrentSnapshotId();
    // console.log(
    //   "testNFTContractOwnerSigner.address: ",
    //   testNFTContractOwnerSigner.address
    // );
    for (let i = 1; i <= snapshotId; i++) {
      balanceResult = await rentMarketContract.balanceOfAt(
        testNFTContractOwnerSigner.address,
        i
      );
      // console.log("i: ", i);
      // console.log("balanceResult: ", balanceResult);
    }

    //* Check renter fee snapshot.
    balanceResult = await rentMarketContract.balanceOfAt(
      testNFTContractOwnerSigner.address,
      snapshotId
    );
    // console.log("testNFTContractOwnerSigner");
    // console.log("balanceResult: ", balanceResult);
    // console.log("realRenterBalance: ", realRenterBalance);
    // console.log("expectedRenterBalance: ", expectedRenterBalance);
    if (balanceResult["found"] === true) {
      realRenterBalance = balanceResult["balance"];
    }
    expect(realRenterBalance).to.be.equal(
      expectedRenterBalance.add(renterTotalFee)
    );
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //* Check service fee snapshot.
    balanceResult = await rentMarketContract.balanceOfAt(
      serviceContractOwnerSigner.address,
      snapshotId
    );
    if (balanceResult["found"] === true) {
      realServiceBalance = balanceResult["balance"];
    }
    expect(realServiceBalance).to.be.equal(
      expectedServiceBalance.add(serviceTotalFee)
    );
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));

    //* Check market fee snapshot.
    balanceResult = await rentMarketContract.balanceOfAt(
      rentMarketContractOwnerSigner.address,
      snapshotId
    );
    if (balanceResult["found"] === true) {
      realMarketBalance = balanceResult["balance"];
    }
    expect(realMarketBalance).to.be.equal(
      expectedMarketBalance.add(marketTotalFee)
    );
    expect(balanceResult["balanceByToken"]).to.be.equal(BigNumber.from(0));
  });
});
