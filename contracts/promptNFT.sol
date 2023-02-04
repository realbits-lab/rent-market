// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./rentMarket.sol";

/// @title A promptNFT class.
/// @author A realbits dev team.
/// @notice promptNFT can be used for saving prompt with NFT.
contract promptNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    AccessControl,
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

    /// @notice PAUSER_ROLE
    /// @dev PAUSER_ROLE
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice CHANGER_ROLE constant variable
    /// @dev CHANGER_ROLE constant variable
    bytes32 public constant CHANGER_ROLE = keccak256("CHANGER_ROLE");

    /// @notice PROMPTER_ROLE constant variable
    /// @dev PROMPTER_ROLE constant variable
    bytes32 public constant PROMPTER_ROLE = keccak256("PROMPTER_ROLE");

    /// @notice Constructor function
    /// @dev Set each role of DEFAULT_ADMIN_ROLE, PAUSER_ROLE, and PROMPTER_ROLE
    /// @param name_ NFT token name
    /// @param symbol_ NFT token symbol
    constructor(
        string memory name_,
        string memory symbol_,
        address payable rentMarketContractAddress_
    ) ERC721(name_, symbol_) {
        rentMarketContract = rentMarket(rentMarketContractAddress_);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(PROMPTER_ROLE, msg.sender);
    }

    /// @notice Change rent market contract with input address
    /// @dev With input rent market contract address, newly set rent market contract variable.
    /// @param rentMarketContractAddress_ input rent market contract address
    function changeRentMarketContract(
        address payable rentMarketContractAddress_
    ) public onlyRole(CHANGER_ROLE) {
        rentMarketContract = rentMarket(rentMarketContractAddress_);
    }

    /// @notice Pause this NFT
    /// @dev Call _pause function in Pausible. Only sender who has PAUSER_ROLE can pause
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpause this NFT
    /// @dev Call _unpause function in Pausible. Only sender who has PAUSER_ROLE can pause
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Mint NFT with auto incremented token ID
    /// @dev After increasing token ID, call _safeMint function in ERC721.sol
    /// @param to_ Receiver address who will receive minted NFT
    /// @param uri_ Receiver address who will receive minted NFT
    /// @param tokenOwnerEncryptData_ Encrypt data by token owner.
    /// @param contractOwnerEncryptData_ Encrypt data by contract owner.
    function safeMint(
        address to_,
        string memory uri_,
        encryptData memory tokenOwnerEncryptData_,
        encryptData memory contractOwnerEncryptData_
    ) public returns (uint256) {
        //* Make token id start from 1.
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to_, tokenId);
        _setTokenURI(tokenId, uri_);

        //* Map prompt to token owner and contract owner as to tokenId.
        nftTokenOwnerEncryptedPromptMap[tokenId] = tokenOwnerEncryptData_;
        nftContractOwnerEncryptedPromptMap[tokenId] = contractOwnerEncryptData_;

        //* Call registerNFT of rentMarket contract.
        bool response = rentMarketContract.registerNFT(address(this), tokenId);
        if (response == false) {
            require(
                false,
                "Call registerNFT function of rentMarket contract failed."
            );
        }

        return tokenId;
    }

    /// @notice Get encrypted prompt of contract.
    /// @dev Return contract encrypted prompt data.
    /// @param tokenId The token Id of which data is returned.
    /// @return Encrypted data by contract.
    function getContractOwnerPrompt(uint256 tokenId)
        public
        view
        onlyRole(PROMPTER_ROLE)
        returns (encryptData memory)
    {
        return nftContractOwnerEncryptedPromptMap[tokenId];
    }

    /// @notice Set encrypted prompt of prompter.
    /// @dev Set a new encrypted prompt data by prompter.
    /// @param tokenId The token Id of which data is set to encrypted data.
    /// @param contractOwnerEncryptData The new encrypted data.
    function claimContractOwnerPrompt(
        uint256 tokenId,
        encryptData memory contractOwnerEncryptData
    ) public onlyRole(PROMPTER_ROLE) {
        //* Map prompt to token owner as to tokenId.
        nftContractOwnerEncryptedPromptMap[tokenId] = contractOwnerEncryptData;
    }

    /// @notice Get encrypted prompt of token owner.
    /// @dev Return token owner encrypted prompt data.
    /// @param tokenId The token Id of which data is returned.
    /// @return Encrypted data by token owner.
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

    /// @notice Set encrypted prompt of token owner.
    /// @dev Set a new encrypted prompt data by token owner.
    /// @param tokenId The token Id of which data is set to encrypted data.
    /// @param tokenOwnerEncryptData The new encrypted data.
    function claimTokenOwnerPrompt(
        uint256 tokenId,
        encryptData memory tokenOwnerEncryptData
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: claimPrompt caller is not owner nor approved"
        );

        //* Map prompt to token owner as to tokenId.
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
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
