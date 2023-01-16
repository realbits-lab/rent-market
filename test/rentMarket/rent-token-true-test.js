const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test rentNFTByToken true case.", function () {
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

  it("rentNFTByToken with erc20 token and check rent data.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;
    const rentFeeByToken = BigNumber.from(100);

    // 1. Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // Get register NFT data.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    // struct registerData {
    //     address nftAddress;
    //     uint256 tokenId;
    //     uint256 rentFee;
    //     address feeTokenAddress;
    //     uint256 rentFeeByToken;
    //     uint256 rentDuration;
    // }

    // Change NFT.
    await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .changeNFT(
        testNFTContract.address,
        startTokenId,
        response["rentFee"],
        testTokenContract.address,
        rentFeeByToken,
        response["rentDuration"]
      );

    // const ownerBalance = await testToken
    //   .connect(owner)
    //   .balanceOf(owner.address);
    // const totalSupply = await testToken.connect(owner).totalSupply();
    // const userBalance = await testToken.connect(owner).balanceOf(user.address);

    // Rent NFT.
    // test token owner is equal to market owner.
    tx = await testTokenContract
      .connect(rentMarketContractOwnerSigner)
      .transfer(userSigner.address, rentFeeByToken);
    await tx.wait();

    tx = await testTokenContract
      .connect(rentMarketContractOwnerSigner)
      .approve(rentMarketContract.address, rentFeeByToken);
    await tx.wait();

    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFTByToken(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address
      );
    await tx.wait();

    // user spend all token.
    // erc20 approve should be zero.
    expect(
      await testTokenContract.allowance(
        userSigner.address,
        rentMarketContract.address
      )
    ).to.be.equal(BigNumber.from(0));

    // Set renStartTimestamp.
    const rentStartTimestamp = BigNumber.from(
      (await ethers.provider.getBlock("latest")).timestamp
    );

    // Check rent data.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId);
    // console.log("response: ", response);
    expect(response).to.deep.equal([
      testNFTContract.address,
      startTokenId,
      rentFee,
      testTokenContract.address,
      rentFeeByToken,
      true,
      rentDuration,
      testNFTContractOwnerSigner.address,
      userSigner.address,
      serviceContractOwnerSigner.address,
      rentStartTimestamp,
    ]);
  });
});
