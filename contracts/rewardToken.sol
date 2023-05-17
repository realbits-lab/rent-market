// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "hardhat/console.sol";

/// @title A reward token class.
/// @author A realbits dev team.
/// @notice A reward token is used to reward to project contributors.
/// @dev All function calls are currently being tested.
contract rewardToken is ERC20, ERC20Burnable, Pausable, Ownable {

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        mint(msg.sender, 1_000_000_000 * (10 ** 18));
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
