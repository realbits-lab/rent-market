// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IRentNFT.sol";

/// @title A publicNFT contract.
/// @author A realbits software development team.
/// @notice You can use this contract for building and deploying NFT.
/// @dev All function calls are currently being tested.
contract publicNFT is
    IRentNFT,
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    AccessControl,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    /// @dev Version.
    string public VERSION = "0.0.1";

    /// @notice Token ID counter variable
    /// @dev Token ID counter variable
    Counters.Counter private _tokenIdCounter;

    /// @notice Base token URI variable
    /// @dev Base token URI variable
    string private _baseTokenURI;

    /// @notice Flag for a public minting.
    bool private _publicMint = false;

    /// @notice PAUSER_ROLE
    /// @dev PAUSER_ROLE
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice MINTER_ROLE constant variable
    /// @dev MINTER_ROLE
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice SETTER_ROLE constant variable
    /// @dev SETTER_ROLE constant variable
    bytes32 public constant SETTER_ROLE = keccak256("SETTER_ROLE");

    /// @notice REGISTER_ROLE constant variable
    /// @dev REGISTER_ROLE constant variable
    bytes32 public constant REGISTER_ROLE = keccak256("REGISTER_ROLE");

    /// @notice Constructor function
    /// @dev Set base token URI and set each role of DEFAULT_ADMIN_ROLE, PAUSER_ROLE, MINTER_ROLE, and SETTER_ROLE
    /// @param name_ NFT token name
    /// @param symbol_ NFT token symbol
    /// @param baseTokenURI_ base URI of NFT token. Set "" if you want to use ERC721URIStorage.
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(SETTER_ROLE, msg.sender);
        _grantRole(REGISTER_ROLE, msg.sender);
    }

    /// @notice Register can register NFT even though register is not the owner of the NFT.
    function checkRegisterRole(
        address registerAddress
    ) public view override returns (bool result) {
        return hasRole(REGISTER_ROLE, registerAddress);
    }

    /// @notice Return base URI of token
    /// @dev Override _baseURI function from ERC721.sol
    /// @return Base URI of token as string
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Set base URI of token
    /// @dev Only sender who has SETTER_ROLE can set base URI
    /// @param baseTokenURI_ URI of token as string
    function setBaseURI(
        string memory baseTokenURI_
    ) public onlyRole(SETTER_ROLE) {
        _baseTokenURI = baseTokenURI_;
    }

    /// @notice Get URI of token
    /// @dev Call the super function for getting token uri.
    /// @param tokenId Token ID
    /// @return Token URI
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @notice Get base URI of token
    /// @dev Return _baseTokenURI variable
    /// @return base URI of token as string
    function getBaseURI() public view returns (string memory) {
        return _baseTokenURI;
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

    function setPublicMint(bool publicMint_) public onlyRole(MINTER_ROLE) {
        _publicMint = publicMint_;
    }

    /// @notice Mint NFT with auto incremented token ID
    /// @dev After increasing token ID, call _safeMint function in ERC721.sol
    /// @param to_ Receiver address who will receive minted NFT
    // function safeMint(address to_) public {
    //     require(
    //         _publicMint == true || hasRole(MINTER_ROLE, msg.sender) == true,
    //         "Not public mint or sender is not owner."
    //     );

    //     // Make token id start from 1.
    //     _tokenIdCounter.increment();
    //     uint256 tokenId = _tokenIdCounter.current();
    //     _safeMint(to_, tokenId);
    // }

    /// @notice Mint NFT with token ID and URI
    /// @dev Call _safeMint function in ERC721.sol with token ID and URI. Set token URI map to token ID.
    /// @param to_ Receiver address who will receive minted NFT
    /// @param uri_ Token URI
    function safeMint(address to_, string memory uri_) public {
        // Check the right for minting.
        require(
            _publicMint == true || hasRole(MINTER_ROLE, msg.sender) == true,
            "Not public mint or sender is not owner."
        );

        // Make token id start from 1.
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to_, tokenId);
        _setTokenURI(tokenId, uri_);
    }

    /// @notice Hook function which is called before token will be transfered
    /// @dev Override this function from ERC721 and ERC721Enumerable. Only can be called when not paused
    /// @param from from address which will send token
    /// @param to to address which will receive token
    /// @param tokenId token ID which will be transfered
    /// @param batchSize batch size
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @notice Check function where or not supporting a specific interface
    /// @dev Override this function from ERC721 and ERC721Enumerable and AccessControl
    /// @param interfaceId interface ID as bytes4
    /// @return success or failure
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            IERC165,
            ERC721,
            ERC721Enumerable,
            ERC721URIStorage,
            AccessControl
        )
        returns (bool)
    {
        return
            interfaceId == type(IRentNFT).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
