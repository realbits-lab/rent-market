// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IRentNFT.sol";

/// @title A rentNFT contract.
/// @author A realbits software development team.
/// @notice You can use this contract for building and deploying NFT.
/// @dev All function calls are currently being tested.
contract rentNFT is
    IRentNFT,
    ERC721,
    ERC721Enumerable,
    Pausable,
    AccessControl,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    /// @dev Version.
    string public VERSION = "0.0.5";

    /// @notice Token ID counter variable
    /// @dev Token ID counter variable
    Counters.Counter private _tokenIdCounter;

    /// @notice Base token URI variable
    /// @dev Base token URI variable
    string private _baseTokenURI;

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
    /// @param baseTokenURI_ base URI of NFT token
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
    function checkRegisterRole(address registerAddress)
        public
        view
        override
        returns (bool result)
    {
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
    function setBaseURI(string memory baseTokenURI_)
        public
        onlyRole(SETTER_ROLE)
    {
        _baseTokenURI = baseTokenURI_;
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

    /// @notice Mint NFT with auto incremented token ID
    /// @dev After increasing token ID, call _safeMint function in ERC721.sol
    /// @param to_ Receiver address who will receive minted NFT
    function safeMint(address to_) public onlyRole(MINTER_ROLE) {
        // Make token id start from 1.
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to_, tokenId);
    }

    /// @notice Mint NFT by amount
    /// @dev Loop calling _safeMint function by amount
    /// @param to_ Receiver address who will receive minted NFT
    /// @param amount_ Amount by which NFT will be minted
    function safeMintAmount(address to_, uint256 amount_)
        public
        onlyRole(MINTER_ROLE)
    {
        for (uint256 i = 0; i < amount_; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(to_, tokenId);
        }
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

    /// @notice Check function where or not supporting a specific interface
    /// @dev Override this function from ERC721 and ERC721Enumerable and AccessControl
    /// @param interfaceId interface ID as bytes4
    /// @return success or failure
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(IERC165, ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IRentNFT).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
