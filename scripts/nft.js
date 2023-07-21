const { task } = require("hardhat/config");
const axios = require("axios");
const {
  decrypt,
  decryptSafely,
  encrypt,
  encryptSafely,
  getEncryptionPublicKey,
} = require("@metamask/eth-sig-util");
const {
  getNFTContract,
  changeIPFSToGateway,
  getEnvVariable,
} = require("./utils");

task("safeMint", "Mints from the NFT contract")
  .addParam("contract", "The NFT contract name.")
  .addParam("to", "The address to receive a token.")
  .addParam("estimate", "The estimate gas fee flag.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    if (taskArguments.estimate === "true") {
      const estimation = await contract.estimateGas.safeMint(taskArguments.to, {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      });
      console.log("estimation: ", estimation.toNumber());
    } else {
      const transactionResponse = await contract.safeMint(taskArguments.to, {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      });
      console.log(`Transaction Hash: ${transactionResponse.hash}`);
    }
  });

task("safeMintForPrompt", "Mint for prompt from the NFT contract")
  .addParam("contract", "The NFT contract name.")
  .addParam("to", "The address to receive a token.")
  .addParam("uri", "The token uri.")
  .addParam(
    "tokenOwnerEncryptData",
    "The token owner encrypted data structure."
  )
  .addParam(
    "contractOwnerEncryptData",
    "The contract owner encrypted data structure."
  )
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const transactionResponse = await contract.safeMint(
      taskArguments.to,
      taskArguments.uri,
      taskArguments.tokenOwnerEncryptData,
      taskArguments.contractOwnerEncryptData,
      {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("safeMintAmount", "Mint as amount with NFT contract")
  .addParam("contract", "The NFT contract name.")
  .addParam("to", "The address to receive a token")
  .addParam("amount", "Amount for minting")
  .addParam("estimate", "The estimate gas fee flag.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);

    if (taskArguments.estimate === "true") {
      const estimation = await contract.estimateGas.safeMintAmount(
        taskArguments.to,
        taskArguments.amount,
        {
          // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        }
      );
      console.log("estimation: ", estimation.toNumber());
    } else {
      const transactionResponse = await contract.safeMintAmount(
        taskArguments.to,
        taskArguments.amount,
        {
          // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        }
      );

      console.log(`Transaction Hash: ${transactionResponse.hash}`);
    }
  });

task("setBaseURI", "Set the base token URI for the deployed smart contract")
  .addParam("contract", "The NFT contract name.")
  .addParam("uri", "The base of the tokenURI endpoint to set")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const transactionResponse = await contract.setBaseURI(taskArguments.uri, {
      // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      // gasLimit: 500_000,
    });
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("getBaseURI", "Get the base token URI for the deployed smart contract")
  .addParam("contract", "The NFT contract name.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.getBaseURI({});
    console.log(`base token URL: ${response}`);
  });

task("tokenURI", "Fetches the token metadata for the given token ID")
  .addParam("contract", "The NFT contract name.")
  .addParam("token", "The tokenID to fetch metadata for")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    let response = await contract.tokenURI(taskArguments.token);
    console.log(`tokenURI: ${response}`);

    const metadata_url = response;
    const gatewayUrl = changeIPFSToGateway(metadata_url);
    response = await axios.get(gatewayUrl);
    const metadata = response.data;
    console.log(
      `Metadata fetch response: ${JSON.stringify(metadata, null, 2)}`
    );
  });

task("safeTransferFrom", "Transfer token safely.")
  .addParam("contract", "The NFT contract name.")
  .addParam("from", "The owner address.")
  .addParam("to", "The recepient address.")
  .addParam("token", "The tokenID for metadata.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const tx = await contract["safeTransferFrom(address,address,uint256)"](
      taskArguments.from,
      taskArguments.to,
      taskArguments.token,
      {
        gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      }
    );

    console.log("tx.hash: ", tx.hash);
  });

task("setApprovalForAll", "Set approval for all with owner argument.")
  .addParam("contract", "The NFT contract name.")
  .addParam("owner", "The owner address.")
  .addParam("operator", "The operator address.")
  .addParam("approved", "The approved boolean.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const tx = await contract["setApprovalForAll(address,address,bool)"](
      taskArguments.owner,
      taskArguments.operator,
      taskArguments.approved,
      {
        gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      }
    );

    console.log("tx: ", tx);
  });

task("isApprovedForAll", "Get approval for all with owner argument.")
  .addParam("contract", "The NFT contract name.")
  .addParam("owner", "The owner address.")
  .addParam("operator", "The operator address.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract["isApprovedForAll(address,address)"](
      taskArguments.owner,
      taskArguments.operator
    );

    console.log("response: ", response);
  });

task("ownerOf", "Get owner of NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("token", "The token ID of NFT.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract["ownerOf(uint256)"](taskArguments.token);

    console.log("response: ", response);
  });

task("name", "Get name of NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.name();

    console.log("response: ", response);
  });

task("symbol", "Get name of NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.symbol();

    console.log("response: ", response);
  });

task("getPrompt", "Get prompt of NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("token", "The token ID of NFT.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.getPrompt(taskArguments.token);

    console.log("response: ", response);
  });

task("balanceOf", "Get balance of NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("address", "The address of balance.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.balanceOf(taskArguments.address);

    console.log("response: ", response.toNumber());
  });

task("totalSupply", "Get all NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.totalSupply();

    // Print result.
    console.log("totalSupply: ", response.toNumber());
    for (let i = 0; i < response; i++) {
      const tokenId = await contract.tokenByIndex(i);
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(
        "--------------------------------------------------------------------------------"
      );
      console.log("id: ", tokenId.toNumber());
      console.log("owner: ", owner);
      console.log("url: ", tokenURI);
    }
  });

task("totalSupplyForPrompt", "Get all NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.totalSupply();

    // Print result.
    console.log("totalSupply: ", response.toNumber());
    for (let i = 0; i < response; i++) {
      const tokenId = await contract.tokenByIndex(i);
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const tokenOwnerPrompt = await contract.getTokenOwnerPrompt(tokenId);
      console.log("-------------------------");
      console.log("id: ", tokenId.toNumber());
      console.log("owner: ", owner);
      console.log("url: ", tokenURI);
      console.log("tokenOwnerPrompt: ", tokenOwnerPrompt);
    }
  });

task("exists", "Get _exists bool of NFT.")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("token", "The token ID of NFT.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.exists(taskArguments.token);

    console.log("response: ", response);
  });

task("decryptByTokenOwner", "Decyrypt prompt by token owner private key.")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("token", "The token ID of NFT.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const tokenOwnerEncryptedData = await contract.getTokenOwnerPrompt(
      taskArguments.token
    );
    console.log("tokenOwnerEncryptedData: ", tokenOwnerEncryptedData);

    const encryptData = {
      version: "x25519-xsalsa20-poly1305",
      ephemPublicKey: "ftB+320OGUDFAOeJ+KX7mSAreCRGtjBSYH12DxFGsjk=",
      nonce: "rOlufjbKI4R87C7uljN6sMH57UgESdJj",
      ciphertext:
        "K2dA2FnotHEZn0B884L3gnLNilo4f2AzInRL9yiUmjBvKxCVZV3KLQjMOBdEMdZu",
    };
    console.log("encryptData: ", encryptData);

    const tokenOwnerPrivateKey = getEnvVariable("ACCOUNT_PRIVATE_KEY");
    console.log("tokenOwnerPrivateKey: ", tokenOwnerPrivateKey);

    const tokenOwnerDecryptResult = decrypt({
      encryptedData: encryptData,
      privateKey: tokenOwnerPrivateKey,
    });
    console.log("tokenOwnerDecryptResult: ", tokenOwnerDecryptResult);
  });

task("decryptByContarctOwner", "Decyrypt prompt by contract owner private key.")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("token", "The token ID of NFT.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const contractOwnerEncryptedData = await contract.getContractOwnerPrompt(
      taskArguments.token
    );
    console.log("contractOwnerEncryptedData: ", contractOwnerEncryptedData);

    const encryptedData = {
      version: "x25519-xsalsa20-poly1305",
      nonce: "tfAlPgEDK2qffbP+te10kyAxmG4iyNYW",
      ephemPublicKey: "43i6pkzfuxxVw730xdp9xhJTEIteXiWAHmSeUNbHkF0=",
      ciphertext:
        "5DxhwxQsG8wb9p/hk7L9hPOpWnRRkvJ45QwkrGWxnbgtmftJS7u4w+1bd7z/4BPO",
    };
    console.log("encryptedData: ", encryptedData);

    const contractOwnerPrivateKey = getEnvVariable("ACCOUNT_PRIVATE_KEY");
    console.log("contractOwnerPrivateKey: ", contractOwnerPrivateKey);

    const encryptionPublicKey = getEncryptionPublicKey(contractOwnerPrivateKey);
    const contractOwnerEncryptData = encrypt({
      publicKey: encryptionPublicKey,
      data: "test",
      version: "x25519-xsalsa20-poly1305",
    });
    console.log("contractOwnerEncryptData: ", contractOwnerEncryptData);

    const contractOwnerDecryptResult = decrypt({
      encryptedData: contractOwnerEncryptData,
      privateKey: contractOwnerPrivateKey,
    });
    console.log("contractOwnerDecryptResult: ", contractOwnerDecryptResult);
  });

task("hasRole", "Check role ownership.")
  .addParam("contract", "The contract name.")
  .addParam("role", "Role hex value.")
  .addParam("account", "Account address.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.hasRole(
      taskArguments.role,
      taskArguments.account
    );

    console.log("response: ", response);
  });

task("grantRole", "Grant role ownership.")
  .addParam("contract", "The contract name.")
  .addParam("role", "Role hex value.")
  .addParam("account", "Account address.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const tx = await contract.grantRole(
      taskArguments.role,
      taskArguments.account
    );
    const receipt = await tx.wait();

    console.log("receipt: ", receipt);
  });

task("PROMPTER_ROLE", "Get prompter role.")
  .addParam("contract", "The contract name.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.PROMPTER_ROLE();

    console.log("response: ", response);
  });

task("REGISTER_ROLE", "Get register role.")
  .addParam("contract", "The contract name.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getNFTContract(taskArguments.contract, hre);
    const response = await contract.REGISTER_ROLE();

    console.log("response: ", response);
  });
