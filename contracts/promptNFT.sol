// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./rentMarket.sol";

/// @title A promptNFT class.
/// @author A realbits dev team.
/// @notice promptNFT can be used for saving prompt with NFT.
/// @dev All functions are currently being tested.
contract promptNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    rentMarket private rentMarketContract;

    struct encryptData {
        string version;
        string ephemPublicKey;
        string nonce;
        string ciphertext;
    }

    mapping(uint256 => encryptData) nftTokenOwnerEncryptedPromptMap;

    mapping(uint256 => encryptData) nftContractOwnerEncryptedPromptMap;

    constructor(
        string memory name_,
        string memory symbol_,
        address payable rentMarketContractAddress_
    ) ERC721(name_, symbol_) {
        rentMarketContract = rentMarket(rentMarketContractAddress_);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(
        address to_,
        string memory uri_,
        encryptData memory tokenOwnerEncryptData_,
        encryptData memory contractOwnerEncryptData_
    ) public returns (uint256) {
        // Make token id start from 1.
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to_, tokenId);
        _setTokenURI(tokenId, uri_);

        // Map prompt to token owner and contract owner as to tokenId.
        nftTokenOwnerEncryptedPromptMap[tokenId] = tokenOwnerEncryptData_;
        nftContractOwnerEncryptedPromptMap[tokenId] = contractOwnerEncryptData_;

        // Call registerNFT of rentMarket contract.
        bool response = rentMarketContract.registerNFT(address(this), tokenId);
        if (response == false) {
            require(
                false,
                "Call registerNFT function of rentMarket contract failed."
            );
        }

        return tokenId;
    }

    function getContractOwnerPrompt(uint256 tokenId)
        public
        view
        returns (encryptData memory)
    {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");

        return nftContractOwnerEncryptedPromptMap[tokenId];
    }

    function getTokenOwnerPrompt(uint256 tokenId)
        public
        view
        returns (encryptData memory)
    {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: getTokenOwnerPrompt caller is not owner nor approved"
        );

        return nftTokenOwnerEncryptedPromptMap[tokenId];
    }

    function claimContractOwnerPrompt(
        uint256 tokenId,
        encryptData memory contractOwnerEncryptData
    ) public {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");

        // Map prompt to token owner as to tokenId.
        nftContractOwnerEncryptedPromptMap[tokenId] = contractOwnerEncryptData;
    }

    function claimTokenOwnerPrompt(
        uint256 tokenId,
        encryptData memory tokenOwnerEncryptData
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: claimPrompt caller is not owner nor approved"
        );

        // Map prompt to token owner as to tokenId.
        nftTokenOwnerEncryptedPromptMap[tokenId] = tokenOwnerEncryptData;
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721) whenNotPaused {
        super._afterTokenTransfer(from, to, tokenId, batchSize);

        // Remove encrypted prompt map from token owner.
        // Keep encrypted prompt map for contract owner.
        delete nftTokenOwnerEncryptedPromptMap[tokenId];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);

        // Remove encrypted prompt map from token owner.
        delete nftTokenOwnerEncryptedPromptMap[tokenId];

        // Remove encrypted prompt map for contract owner.
        delete nftContractOwnerEncryptedPromptMap[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
