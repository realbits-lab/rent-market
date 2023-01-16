const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const {
  initializeBeforeEach,
  registerNFT,
  sleep,
} = require("./utility-function");

describe("test settleRentData true case.", function () {
  /*****************************************************************************
   * Define variables.
   ****************************************************************************/
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
    /***************************************************************************
     * Initialize contract and data.
     **************************************************************************/
    const response = await initializeBeforeEach();

    /***************************************************************************
     * Set each returned value.
     **************************************************************************/
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    // brackets are required.
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

  it("Check settle single rent case.", async () => {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    const startTokenId = 1;
    const endTokenId = 1;
    // Define progress time as second unit and should be between 2 to 9.
    const progressTime = 2;
    const defaultRentDuration = 100;
    let tx;
    let response;
    let txArray = [];

    /***************************************************************************
     * Register NFT.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Get rent fee value of the startTokenId NFT.
     **************************************************************************/
    const rentFee = (
      await rentMarketContract
        .connect(userSigner)
        .getRegisterData(testNFTContract.address, startTokenId)
    )["rentFee"];

    /***************************************************************************
     * Change NFT rentDudation as 1 second.
     **************************************************************************/
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

    /***************************************************************************
     * Rent startTokenId NFT.
     **************************************************************************/
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

    /***************************************************************************
     * Wait some times.
     **************************************************************************/
    await sleep(progressTime * 1000);

    /***************************************************************************
     * Progress blocks.
     **************************************************************************/
    await hre.network.provider.send("hardhat_mine", [`0x${progressTime}`]);

    /***************************************************************************
     * Settle rent data.
     **************************************************************************/
    txArray = [];
    const latestBlock = await ethers.provider.getBlock("latest");
    const allRentArray = await rentMarketContract.getAllRentData();

    /***************************************************************************
     * Make transaction promises.
     **************************************************************************/
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
          element["tokenId"]
        );
        txArray.push(tx);
      }
    });
    const txPromisesResult = await Promise.all(txArray);
    const waitPromises = txPromisesResult.map(async (element) => {
      return element.wait();
    });
    await Promise.all(waitPromises);

    /***************************************************************************
     * Get each balanace for owner, service, and market.
     **************************************************************************/
    const realRenterBalance = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    const realServiceBalance = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    const realMarketBalance = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    // console.log("realRenterBalance: ", realRenterBalance);
    // console.log(
    //   "realRenterBalance / e18: ",
    //   realRenterBalance / Math.pow(10, 18)
    // );
    // console.log("realServiceBalance: ", realServiceBalance / Math.pow(10, 18));
    // console.log("realMarketBalance: ", realMarketBalance / Math.pow(10, 18));

    /***************************************************************************
     * Get expected value of each quota for renter, rentee, and market.
     **************************************************************************/
    const [renterQuota, serviceQuota, marketQuota] =
      await rentMarketContract.getFeeQuota();
    let expectedRenterBalance = rentFee.mul(renterQuota).div(100);
    let expectedServiceBalance = rentFee.mul(serviceQuota).div(100);
    let expectedMarketBalance = rentFee.mul(marketQuota).div(100);
    // console.log(
    //   "expectedRenterBalance: ",
    //   expectedRenterBalance / Math.pow(10, 18)
    // );
    // console.log(
    //   "expectedServiceBalance: ",
    //   expectedServiceBalance / Math.pow(10, 18)
    // );
    // console.log(
    //   "expectedMarketBalance: ",
    //   expectedMarketBalance / Math.pow(10, 18)
    // );

    /***************************************************************************
     * Check each balance is equal to quota * rentFee.
     **************************************************************************/
    expect(realRenterBalance).to.be.equal(expectedRenterBalance);
    expect(realServiceBalance).to.be.equal(expectedServiceBalance);
    expect(realMarketBalance).to.be.equal(expectedMarketBalance);
  });

  it("Check settle multiple rent cases.", async () => {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    const startTokenId = 1;
    const endTokenId = 5;
    const defaultRentDuration = 100;
    // Define progress time as second unit and should be between 2 to 9.
    const progressTime = 2;
    let txPromisesResult;
    let waitPromises;
    let rentFeeArray = [];
    let response;
    let txArray = [];

    /***************************************************************************
     * Register NFT.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Get rent fee of the previous registered NFT.
     **************************************************************************/
    for (let i = startTokenId; i <= endTokenId; i++) {
      const tokenId = i - startTokenId + 1;
      const rentFee = (
        await rentMarketContract
          .connect(userSigner)
          .getRegisterData(testNFTContract.address, tokenId)
      )["rentFee"];
      rentFeeArray.push(rentFee);
    }

    /***************************************************************************
     * Change NFT rentDudation as 1 second.
     **************************************************************************/
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

    /***************************************************************************
     * Rent each NFT.
     **************************************************************************/
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

    /***************************************************************************
     * Wait some times.
     **************************************************************************/
    await sleep(progressTime * 1000);

    /***************************************************************************
     * Progress blocks.
     **************************************************************************/
    await hre.network.provider.send("hardhat_mine", [`0x${progressTime}`]);

    /***************************************************************************
     * Settle rent data.
     **************************************************************************/
    const latestBlock = await ethers.provider.getBlock("latest");
    const allRentArray = await rentMarketContract.getAllRentData();

    /***************************************************************************
     * Make transaction promises.
     **************************************************************************/
    txArray = [];
    allRentArray.map(async (element) => {
      if (
        BigNumber.from(latestBlock.timestamp).gt(
          element["rentStartTimestamp"].add(element["rentDuration"])
        )
      ) {
        const tx = rentMarketContract.settleRentData(
          element["nftAddress"],
          element["tokenId"]
        );
        txArray.push(tx);
      }
    });
    txPromisesResult = await Promise.all(txArray);
    waitPromises = txPromisesResult.map(async (element) => {
      return element.wait();
    });
    await Promise.all(waitPromises);

    /***************************************************************************
     * Get real value of each balanace for renter, rentee, and market.
     **************************************************************************/
    const realRenterBalance = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    const realServiceBalance = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    const realMarketBalance = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    // console.log("realRenterBalance: ", realRenterBalance / Math.pow(10, 18));
    // console.log("realServiceBalance: ", realServiceBalance / Math.pow(10, 18));
    // console.log("realMarketBalance: ", realMarketBalance / Math.pow(10, 18));

    /***************************************************************************
     * Get expected total value of each quota for owner, service, and market.
     **************************************************************************/
    let expectedRenterBalance = BigNumber.from(0);
    let expectedServiceBalance = BigNumber.from(0);
    let expectedMarketBalance = BigNumber.from(0);
    const [renterQuota, serviceQuota, marketQuota] =
      await rentMarketContract.getFeeQuota();
    for (let i = startTokenId; i <= endTokenId; i++) {
      const idx = i - startTokenId;
      expectedRenterBalance = rentFeeArray[idx]
        .mul(renterQuota)
        .div(100)
        .add(expectedRenterBalance);
      expectedServiceBalance = rentFeeArray[idx]
        .mul(serviceQuota)
        .div(100)
        .add(expectedServiceBalance);
      expectedMarketBalance = rentFeeArray[idx]
        .mul(marketQuota)
        .div(100)
        .add(expectedMarketBalance);
    }
    // console.log(
    //   "expectedRenterBalance: ",
    //   expectedRenterBalance / Math.pow(10, 18)
    // );
    // console.log(
    //   "expectedServiceBalance: ",
    //   expectedServiceBalance / Math.pow(10, 18)
    // );
    // console.log(
    //   "expectedMarketBalance: ",
    //   expectedMarketBalance / Math.pow(10, 18)
    // );

    /***************************************************************************
     * Check each balance.
     **************************************************************************/
    expect(realRenterBalance).to.be.equal(expectedRenterBalance);
    expect(realServiceBalance).to.be.equal(expectedServiceBalance);
    expect(realMarketBalance).to.be.equal(expectedMarketBalance);
  });

  it("Check normal unrent case with base coin.", async function () {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    const startTokenId = 1;
    const endTokenId = 1;
    const defaultRentDuration = 100;
    const progressTime = 2;
    let rentFee = ethers.utils.parseUnits("1", "ether");
    let rentDuration = BigNumber.from(10);
    let response;
    let tx;
    let txArray = [];

    /***************************************************************************
     * Register NFT.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Change NFT rentDudation as 1 second.
     **************************************************************************/
    tx = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .changeNFT(
        testNFTContract.address,
        startTokenId,
        rentFee,
        ethers.constants.AddressZero,
        BigNumber.from(0),
        rentDuration
      );
    await tx.wait();

    /***************************************************************************
     * Rent NFT.
     **************************************************************************/
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
    const rentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    // console.log("rentTimestamp: ", rentTimestamp);

    /***************************************************************************
     * Get rentFee and rentDuration of rent data.
     **************************************************************************/
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId);
    rentFee = response["rentFee"];
    rentDuration = response["rentDuration"];
    // console.log("rentFee: ", rentFee);
    // console.log("rentDuration: ", rentDuration);

    /***************************************************************************
     * Wait some times.
     **************************************************************************/
    await sleep(progressTime * 1000);

    /***************************************************************************
     * Progress blocks.
     **************************************************************************/
    await hre.network.provider.send("hardhat_mine", [`0x${progressTime}`]);

    /***************************************************************************
     * Unrent NFT.
     **************************************************************************/
    tx = await rentMarketContract
      .connect(userSigner)
      .unrentNFT(testNFTContract.address, startTokenId);
    await tx.wait();
    const unrentTimestamp = (await ethers.provider.getBlock("latest"))
      .timestamp;
    // console.log("unrentTimestamp: ", unrentTimestamp);

    /***************************************************************************
     * Get real value of each balanace for renter, rentee, and market.
     **************************************************************************/
    const realRenterBalance = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    const realServiceBalance = await rentMarketContract
      .connect(serviceContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);
    const realMarketBalance = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .getMyBalance(ethers.constants.AddressZero);

    /***************************************************************************
     * Get expected value of each quota and balance for renter, rentee, and market.
     **************************************************************************/
    const usedTimestamp = unrentTimestamp - rentTimestamp;
    // console.log("usedTimestamp: ", usedTimestamp);
    // console.log("rentDutaion: ", rentDuration);
    const [renterQuota, serviceQuota, marketQuota] =
      await rentMarketContract.getFeeQuota();
    const expectedRenterBalance = rentFee
      .mul(usedTimestamp)
      .div(rentDuration)
      .mul(renterQuota)
      .div(100);
    const expectedServiceBalance = rentFee
      .mul(usedTimestamp)
      .div(rentDuration)
      .mul(serviceQuota)
      .div(100);
    const expectedMarketBalance = rentFee
      .mul(usedTimestamp)
      .div(rentDuration)
      .mul(marketQuota)
      .div(100);

    /***************************************************************************
     * Check each balance.
     **************************************************************************/
    expect(realRenterBalance).to.be.equal(expectedRenterBalance);
    expect(realServiceBalance).to.be.equal(expectedServiceBalance);
    expect(realMarketBalance).to.be.equal(expectedMarketBalance);
  });
});
