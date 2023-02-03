const {
  decrypt,
  decryptSafely,
  encrypt,
  encryptSafely,
  getEncryptionPublicKey,
} = require("@metamask/eth-sig-util");
const { expect } = require("chai");
const { ethers, config } = require("hardhat");

const {
  initializeBeforeEach,
  promptNFTName,
  promptNFTSymbol,
} = require("./utility-function");

describe("test promptNFT true case.", function () {
  //* -------------------------------------------------------------------------
  //* Define variables.
  //* -------------------------------------------------------------------------
  let // Signer values.
    promptNFTContractOwnerSigner,
    userSigner,
    marketSigner,
    remainSignerArray,
    // Contract values.
    promptNFTContract;

  beforeEach(async function () {
    //* -----------------------------------------------------------------------
    //* Initialize contract and data.
    //* Deploy smart contract with fixture and mint NFT.
    //* -----------------------------------------------------------------------
    const response = await initializeBeforeEach();

    //* -----------------------------------------------------------------------
    //* Set each returned value.
    //* -----------------------------------------------------------------------
    ({
      // Signer values.
      promptNFTContractOwnerSigner,
      userSigner,
      marketSigner,
      remainSignerArray,
      // Contract values.
      promptNFTContract,
    } = response);
  });

  it("test NFT deploy and check name and symbol.", async function () {
    //* -----------------------------------------------------------------------
    //* Define variables.
    //* -----------------------------------------------------------------------
    const name = await promptNFTContract.connect(userSigner).name();
    const symbol = await promptNFTContract.connect(userSigner).symbol();

    expect(name).to.equal(promptNFTName);
    expect(symbol).to.equal(promptNFTSymbol);
  });

  it("test to mint NFT and check an encrypted prompt.", async function () {
    //* -----------------------------------------------------------------------
    //* Define variables.
    //* -----------------------------------------------------------------------
    const startTokenId = 1;
    const endTokenId = 1;
    const version = "x25519-xsalsa20-poly1305";
    const prompt = "baseball player";
    let encryptedPrompt;
    const NFT_URI = "https://js-nft.s3.ap-northeast-2.amazonaws.com/json";

    //* -----------------------------------------------------------------------
    //* Encrypt prompt.
    //* -----------------------------------------------------------------------
    const accounts = config.networks.hardhat.accounts;
    const index = 0;

    // Get wallet.
    const wallet = ethers.Wallet.fromMnemonic(
      accounts.mnemonic,
      accounts.path + `/${index}`
    );
    // console.log("wallet: ", wallet);

    // Remove the front "0x" string.
    const tokenOwnerPrivateKey = wallet.privateKey.slice(2);
    const contractOwnerPrivateKey = process.env.ACCOUNT_PRIVATE_KEY;
    // console.log("tokenOwnerPrivateKey: ", tokenOwnerPrivateKey);
    // console.log("contractOwnerPrivateKey: ", contractOwnerPrivateKey);

    // Get encryption public key.
    const tokenOwnerPublicKey = getEncryptionPublicKey(tokenOwnerPrivateKey);
    const contractOwnerPublicKey = getEncryptionPublicKey(
      contractOwnerPrivateKey
    );
    // console.log("tokenOwnerPublicKey: ", tokenOwnerPublicKey);
    // console.log("contractOwnerPublicKey: ", contractOwnerPublicKey);

    // Get encrypt result.
    const tokenOwnerEncryptedData = encrypt({
      publicKey: tokenOwnerPublicKey,
      data: prompt,
      version,
    });
    const contractOwnerEncryptedData = encrypt({
      publicKey: contractOwnerPublicKey,
      data: prompt,
      version,
    });
    // console.log("tokenOwnerEncryptedData: ", tokenOwnerEncryptedData);
    // console.log("contractOwnerEncryptedData: ", contractOwnerEncryptedData);

    // * -----------------------------------------------------------------------
    // * Mint NFT with encrypted prompt.
    // * -----------------------------------------------------------------------
    const toAddress = promptNFTContractOwnerSigner.address;
    const sampleUri = "http://test.com";
    const tx = await promptNFTContract
      .connect(promptNFTContractOwnerSigner)
      .safeMint(
        toAddress,
        sampleUri,
        tokenOwnerEncryptedData,
        contractOwnerEncryptedData
      );
    await tx.wait();

    // Get decrypt result.
    const tokenOwnerDecryptResult = decrypt({
      encryptedData: tokenOwnerEncryptedData,
      privateKey: tokenOwnerPrivateKey,
    });
    const contractOwnerDecryptResult = decrypt({
      encryptedData: contractOwnerEncryptedData,
      privateKey: contractOwnerPrivateKey,
    });
    // console.log("tokenOwnerDecryptResult: ", tokenOwnerDecryptResult);
    // console.log("contractOwnerDecryptResult: ", contractOwnerDecryptResult);

    expect(tokenOwnerDecryptResult).to.equal(prompt);
    expect(contractOwnerDecryptResult).to.equal(prompt);

    // * -----------------------------------------------------------------------
    // * Get encrypted prompt.
    // * -----------------------------------------------------------------------
    const tokenOwnerPromptData = await promptNFTContract
      .connect(promptNFTContractOwnerSigner)
      .getTokenOwnerPrompt(startTokenId);
    // console.log("tokenOwnerPromptData: ", tokenOwnerPromptData);

    const contractOwnerPromptData = await promptNFTContract
      .connect(promptNFTContractOwnerSigner)
      .getContractOwnerPrompt(startTokenId);
    // console.log("contractOwnerPromptData: ", contractOwnerPromptData);

    // * -----------------------------------------------------------------------
    // * Compare the output data with input data.
    // * -----------------------------------------------------------------------
    expect(tokenOwnerPromptData["version"]).to.equal(
      tokenOwnerEncryptedData.version
    );
    expect(tokenOwnerPromptData["nonce"]).to.equal(
      tokenOwnerEncryptedData.nonce
    );
    expect(tokenOwnerPromptData["ephemPublicKey"]).to.equal(
      tokenOwnerEncryptedData.ephemPublicKey
    );
    expect(tokenOwnerPromptData["ciphertext"]).to.equal(
      tokenOwnerEncryptedData.ciphertext
    );

    expect(contractOwnerPromptData["version"]).to.equal(
      contractOwnerEncryptedData.version
    );
    expect(contractOwnerPromptData["nonce"]).to.equal(
      contractOwnerEncryptedData.nonce
    );
    expect(contractOwnerPromptData["ephemPublicKey"]).to.equal(
      contractOwnerEncryptedData.ephemPublicKey
    );
    expect(contractOwnerPromptData["ciphertext"]).to.equal(
      contractOwnerEncryptedData.ciphertext
    );
  });

  it("test to mint NFT and check token URI.", async function () {
    //* -----------------------------------------------------------------------
    //* Define variables.
    //* -----------------------------------------------------------------------
    const startTokenId = 1;
    const endTokenId = 5;
    const encryptedPromptData = {
      version: "",
      nonce: "",
      ephemPublicKey: "",
      ciphertext: "",
    };
    const NFT_URI = "https://js-nft.s3.ap-northeast-2.amazonaws.com/json";

    //* -----------------------------------------------------------------------
    //* Mint 5 NFTs.
    //* -----------------------------------------------------------------------
    let originalTokenURIArray = [];
    let txArray = [];
    for (let i = startTokenId; i <= endTokenId; i++) {
      const toAddress = promptNFTContractOwnerSigner.address;
      const tokenURI = `${NFT_URI}/${i}.json`;
      const tx = await promptNFTContract
        .connect(promptNFTContractOwnerSigner)
        .safeMint(
          toAddress,
          tokenURI,
          encryptedPromptData,
          encryptedPromptData
        );
      txArray.push(tx.wait());
      originalTokenURIArray.push(tokenURI);
    }
    await Promise.all(txArray);
    // console.log("originalTokenURIArray: ", originalTokenURIArray);

    //* -----------------------------------------------------------------------
    //* Get all minted NFT data.
    //* -----------------------------------------------------------------------
    const totalSupply = await promptNFTContract
      .connect(userSigner)
      .totalSupply();
    // console.log("totalSupply: ", totalSupply);

    let tokenURIArray = [];
    for (let i = 0; i < totalSupply.toNumber(); i++) {
      const tokenId = await promptNFTContract
        .connect(userSigner)
        .tokenByIndex(i);
      const tokenURI = await promptNFTContract
        .connect(userSigner)
        .tokenURI(tokenId);
      tokenURIArray.push(tokenURI);
    }
    // console.log("tokenURIArray: ", tokenURIArray);

    //* -----------------------------------------------------------------------
    //* Compare the output data with input data.
    //* -----------------------------------------------------------------------
    expect(tokenURIArray).to.deep.equal(originalTokenURIArray);
  });
});
