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
     * - Deploy smart contracts with fixture and mint NFT.
     * - Remove all data and register service and collection.
     * - Register token.
     * - Register collection.
     * - Register service.
     **************************************************************************/
    const response = await initializeBeforeEach();
    // print({ response });

    /***************************************************************************
     * Set each returned value.
     **************************************************************************/
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

  it("test rentNFT with base token and check rent data.", async function () {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    /***************************************************************************
     * Register NFT to rent market.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Get rent fee.
     **************************************************************************/
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const options = {
      value: response["rentFee"],
    };

    /***************************************************************************
     * Rent NFT.
     **************************************************************************/
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        options
      );
    await tx.wait();

    /***************************************************************************
     * Set renStartTimestamp.
     **************************************************************************/
    const rentStartTimestamp = BigNumber.from(
      (await ethers.provider.getBlock("latest")).timestamp
    );

    /***************************************************************************
     * Check rent data.
     **************************************************************************/
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId);
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

  it("rentNFT with base token and check event.", async function () {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    /***************************************************************************
     * Register NFT to rent market.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Get rent fee.
     **************************************************************************/
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const options = {
      value: response["rentFee"],
    };

    // 3. Get block number.
    const rentStartTimestamp = BigNumber.from(
      (await ethers.provider.getBlock("latest")).timestamp
    );
    // console.log("rentStartTimestamp: ", rentStartTimestamp);

    /***************************************************************************
     * Check event.
     **************************************************************************/
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
      console.log("eventRentStartTimestamp: ", eventRentStartTimestamp);
      if (
        eventRentStartTimestamp.lt(rentStartTimestamp) === true &&
        eventRentStartTimestamp.gt(rentStartTimestamp.add(10))
      ) {
        return false;
      }

      return false;
    }

    /***************************************************************************
     * Check data.
     **************************************************************************/
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
