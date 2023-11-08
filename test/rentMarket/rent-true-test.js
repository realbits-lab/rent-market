const { expect } = require("chai");
const { BigNumber } = require("ethers");
const {
  initializeBeforeEach,
  registerNFT,
  defaultRentFee,
  defaultFeeToken,
  defaultRentFeeByToken,
  defaultRentDuration,
} = require("./utility-function");

describe("test rentNFT true case.", function () {
  //* Define variables.
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
    //* Initialize contract and data.
    //* - Deploy smart contracts with fixture and mint NFT.
    //* - Remove all data and register service and collection.
    //* - Register token.
    //* - Register collection.
    //* - Register service.
    const response = await initializeBeforeEach();
    // print({ response });

    //* Set each returned value.
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

  it("Check rent result with normal case.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    //* Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    //* Get rent fee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    // console.log("getRegisterData response: ", response);
    const options = {
      value: response["rentFee"],
    };

    //* Rent NFT.
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        options
      );
    await tx.wait();

    //* Get rentStartTimestamp.
    const rentStartTimestamp = BigNumber.from(
      (await ethers.provider.getBlock("latest")).timestamp
    );
    // console.log("rentStartTimestamp: ", rentStartTimestamp);

    //* Check rent data.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    // struct rentData {
    //     address nftAddress;
    //     uint256 tokenId;
    //     uint256 rentFee;
    //     address feeTokenAddress;
    //     uint256 rentFeeByToken;
    //     bool isRentByToken;
    //     uint256 rentDuration;
    //     address renterAddress;
    //     address renteeAddress;
    //     address serviceAddress;
    //     uint256 rentStartTimestamp;
    // }
    // console.log("getRentData response: ", response);
    expect(response).to.deep.equal([
      testNFTContract.address,
      BigNumber.from(startTokenId),
      defaultRentFee,
      defaultFeeToken,
      defaultRentFeeByToken,
      false,
      defaultRentDuration,
      testNFTContractOwnerSigner.address,
      userSigner.address,
      serviceContractOwnerSigner.address,
      rentStartTimestamp,
    ]);
  });

  it("Check the duplicate rent result.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    //* Register NFT to rent market.
    console.log("call registerNFT()");
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    //* Get rent fee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    console.log("getRegisterData response: ", response);
    const options = {
      value: response["rentFee"],
    };

    //* Rent NFT.
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        options
      );
    await tx.wait();

    //* Get rent duration.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    console.log("getRentData response: ", response);
    let rentDuration = response["rentDuration"];
    console.log("rentDuration: ", rentDuration);

    //* Check the default rent duration.
    expect(rentDuration).to.equal(defaultRentDuration);

    //* Rent the same NFT again.
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        options
      );
    await tx.wait();

    //* Get rent duration.
    const previousRentDuration = rentDuration;
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    console.log("getRentData response: ", response);
    rentDuration = response["rentDuration"];
    console.log("rentDuration: ", rentDuration);

    //* Check the default rent duration.
    expect(rentDuration).to.equal(previousRentDuration.mul(2));
  });

  it("Check event.", async function () {
    //* Define variables.
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    //* Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    //* Get rent fee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const options = {
      value: response["rentFee"],
    };

    //* Get start time stamp.
    const rentStartTimestamp = BigNumber.from(
      (await ethers.provider.getBlock("latest")).timestamp
    );
    // console.log("rentStartTimestamp: ", rentStartTimestamp);

    //* Check event.
    // event RentNFT(
    //     address indexed nftAddress,
    //     uint256 indexed tokenId,
    //     uint256 rentFee,
    //     address feeTokenAddress,
    //     uint256 rentFeeByToken,
    //     bool isRentByToken,
    //     uint256 rentDuration,
    //     address renterAddress,
    //     address indexed renteeAddress,
    //     address serviceAddress,
    //     uint256 rentStartTimestamp
    // );
    // TODO: Handle predicate function later.
    function checkRentStartTimestamp(eventRentStartTimestamp, test) {
      // console.log("eventRentStartTimestamp: ", eventRentStartTimestamp);
      if (
        eventRentStartTimestamp.lt(rentStartTimestamp) === true &&
        eventRentStartTimestamp.gt(rentStartTimestamp.add(10))
      ) {
        return false;
      }

      return false;
    }

    //* Check data.
    await expect(
      rentMarketContract
        .connect(userSigner)
        .rentNFT(
          testNFTContract.address,
          startTokenId,
          serviceContractOwnerSigner.address,
          options
        )
    )
      .to.emit(rentMarketContract, "RentNFT")
      .withArgs(
        testNFTContract.address,
        startTokenId,
        defaultRentFee,
        defaultFeeToken,
        defaultRentFeeByToken,
        false,
        defaultRentDuration,
        testNFTContractOwnerSigner.address,
        userSigner.address,
        serviceContractOwnerSigner.address,
        rentStartTimestamp.add(1)
        // TODO: Handle predicate function later.
        // checkRentStartTimestamp
      );
  });
});
