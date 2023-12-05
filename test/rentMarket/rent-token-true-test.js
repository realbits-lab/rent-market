const { expect } = require("chai");
const { BigNumber } = require("ethers");
const {
  initializeBeforeEach,
  registerNFT,
  erc20PermitSignature,
} = require("./utility-function");

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
    //* Initialize contract and data.
    //* - Deploy smart contracts with fixture and mint NFT.
    //* - Remove all data and register service and collection.
    //* - Register token.
    //* - Register collection.
    //* - Register service.
    const response = await initializeBeforeEach();

    //* Set each returned value.
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

  it("rentNFTByToken with erc20 token and check rent data.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;
    const rentFeeByToken = BigNumber.from(100);

    //* Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    //* Get register NFT data.
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

    //* Set rent fee by token with rentFeeByToken.
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
    const rentFee = response["rentFee"];
    const rentDuration = response["rentDuration"];

    // const ownerBalance = await testToken
    //   .connect(owner)
    //   .balanceOf(owner.address);
    // const totalSupply = await testToken.connect(owner).totalSupply();
    // const userBalance = await testToken.connect(owner).balanceOf(user.address);

    //* Send rentFeeByToken amount to userSigner from testTokenContract.
    // console.log("Start to transfer");
    tx = await testTokenContract
      .connect(rentMarketContractOwnerSigner)
      .transfer(userSigner.address, rentFeeByToken);
    await tx.wait();

    //* Make signature.
    // console.log("Start to sign");
    const { r, s, v, deadline } = await erc20PermitSignature({
      owner: userSigner.address,
      spender: rentMarketContract.address,
      amount: rentFeeByToken,
      contract: testTokenContract,
      signer: userSigner,
    });

    //* Rent NFT by token.
    // console.log("Start to rentNFTByToken");
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFTByToken(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        deadline,
        v,
        r,
        s
      );
    await tx.wait();

    //* Check allowance is zero.
    const allowance = await testTokenContract.allowance(
      userSigner.address,
      rentMarketContract.address
    );
    // console.log("allowance: ", allowance);
    expect(allowance).to.be.equal(BigNumber.from(0));

    //* Check balance is zero.
    const balance = await testTokenContract.balanceOf(userSigner.address);
    // console.log("balance: ", balance);
    expect(balance).to.be.equal(BigNumber.from(0));

    //* Set renStartTimestamp.
    const rentStartTimestamp = BigNumber.from(
      (await ethers.provider.getBlock("latest")).timestamp
    );

    //* Check rent data.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    // console.log("response: ", response);

    expect(response).to.deep.equal([
      testNFTContract.address,
      BigNumber.from(startTokenId),
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

  it("Check the duplicate rent by token result.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;
    const rentFeeByToken = BigNumber.from(100);
    const defaultRentDuration = BigNumber.from(60 * 60 * 24);

    //* Register NFT to rent market.
    // console.log("call registerNFT()");
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

    //* Set rent fee by token with rentFeeByToken.
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
    const rentFee = response["rentFee"];
    let rentDuration = response["rentDuration"];

    // const ownerBalance = await testToken
    //   .connect(owner)
    //   .balanceOf(owner.address);
    // const totalSupply = await testToken.connect(owner).totalSupply();
    // const userBalance = await testToken.connect(owner).balanceOf(user.address);

    //* Send rentFeeByToken amount to userSigner from testTokenContract.
    // console.log("Start to transfer");
    tx = await testTokenContract
      .connect(rentMarketContractOwnerSigner)
      .transfer(userSigner.address, rentFeeByToken);
    await tx.wait();

    //* Make signature.
    // console.log("Start to sign");
    let { r, s, v, deadline } = await erc20PermitSignature({
      owner: userSigner.address,
      spender: rentMarketContract.address,
      amount: rentFeeByToken,
      contract: testTokenContract,
      signer: userSigner,
    });

    //* Rent NFT by token.
    // console.log("Start to rentNFTByToken");
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFTByToken(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        deadline,
        v,
        r,
        s
      );
    await tx.wait();

    //* Get rent duration.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    // console.log("getRentData response: ", response);
    rentDuration = response["rentDuration"];
    // console.log("rentDuration: ", rentDuration);

    //* Check the default rent duration.
    expect(rentDuration).to.equal(defaultRentDuration);

    // Send ERC20 token to user.
    tx = await testTokenContract
      .connect(rentMarketContractOwnerSigner)
      .transfer(userSigner.address, rentFeeByToken);
    await tx.wait();

    ({ r, s, v, deadline } = await erc20PermitSignature({
      owner: userSigner.address,
      spender: rentMarketContract.address,
      amount: rentFeeByToken,
      contract: testTokenContract,
      signer: userSigner,
    }));

    //* Rent the same NFT again.
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFTByToken(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        deadline,
        v,
        r,
        s
      );
    await tx.wait();

    //* Get rent duration.
    const previousRentDuration = rentDuration;
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    // console.log("getRentData response: ", response);
    rentDuration = response["rentDuration"];
    // console.log("rentDuration: ", rentDuration);

    //* Check the default rent duration.
    expect(rentDuration).to.equal(previousRentDuration.mul(2));
  });
});
