// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "hardhat/console.sol";

/// @title A reward token class.
/// @author A realbits dev team.
/// @dev A reward token is used to reward to project contributors.
///
/// The total 1 billion tokens are made when deployer calls constructor.
contract rewardToken is ERC20, Ownable {
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, 1_000_000_000 * (10 ** 18));
    }
}
