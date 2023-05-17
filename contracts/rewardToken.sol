// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "hardhat/console.sol";

/// @title A reward token class.
/// @author A realbits dev team.
/// @dev A reward token is used to reward to project contributors.
///
/// The total 1 billion tokens are made when deployer calls constructor.
contract rewardToken is ERC20 {
    /// @dev Reward token released event.
    event RewardTokenReleased(uint256 amount);

    /// @dev Reward token released amount.
    uint256 private _released;

    /// @dev Share contract to which vesting would be sent.
    address private immutable _shareContractAddress;

    /// @dev Vesting start timestamp.
    uint256 private immutable _start;

    /// @dev Vesting duration timestamp.
    uint256 private immutable _duration;

    /// @dev Vesting frequency.
    uint256 private immutable _frequency;

    /// @dev Set the vesting start time as now which is a block.timestamp.
    constructor(
        string memory rewardTokenName_,
        string memory rewardTokenSymbol_,
        address shareContractAddress_
    ) ERC20(rewardTokenName_, rewardTokenSymbol_) {
        require(
            shareContractAddress_ != address(0),
            "rewardToken: shareContractAddress is zero address"
        );

        _shareContractAddress = shareContractAddress_;
        _start = block.timestamp;
        _duration = 250 weeks;
        _frequency = 50;

        _mint(msg.sender, 1_000_000_000 * (10 ** 18));
    }

    /// @dev Getter for the share contract address.
    function shareContractAddress() public view returns (address) {
        return _shareContractAddress;
    }

    /// @dev Getter for the vesting start timestamp.
    function start() public view returns (uint256) {
        return _start;
    }

    /// @dev Getter for the vesting duration.
    function duration() public view returns (uint256) {
        return _duration;
    }

    /// @dev Getter for the vesting frequency.
    function frequency() public view returns (uint256) {
        return _frequency;
    }

    /// @dev Amount of already released vesting.
    function released() public view returns (uint256) {
        return _released;
    }

    /// @dev Getter for the amount of releasable reward token vesting.
    function releasable() public view returns (uint256) {
        return vestedAmount(uint256(block.timestamp)) - released();
    }

    /// @dev Getter for the total token allocation.
    function totalAllocation() public view returns (uint256) {
        return address(this).balance + released();
    }

    /// @dev Getter for the amount of minimum releasable reward token vesting.
    function minimumReleasable() public view returns (uint256) {
        return totalAllocation() / frequency();
    }

    /// @dev Release the tokens that have already vested.
    function release() public {
        uint256 amount = releasable();
        require(
            amount > totalAllocation() / frequency(),
            "rewardToken: Releasable amount is smaller than the vesting minimum amount."
        );

        _released += amount;

        emit RewardTokenReleased(amount);

        SafeERC20.safeTransfer(
            IERC20(address(this)),
            shareContractAddress(),
            amount
        );
    }

    /// @dev Calculates the amount of ether that has already vested.
    /// Default implementation is a linear vesting curve.
    function vestedAmount(uint256 timestamp_) public view returns (uint256) {
        return _vestingSchedule(totalAllocation(), timestamp_);
    }

    /// @dev Implementation of the vesting formula.
    /// This returns the amount vested, as a function of time,
    /// for an asset given its total historical allocation.
    function _vestingSchedule(
        uint256 totalAllocation_,
        uint256 timestamp_
    ) internal view returns (uint256) {
        if (timestamp_ < start()) {
            return 0;
        } else if (timestamp_ > start() + duration()) {
            return totalAllocation_;
        } else {
            return (totalAllocation_ * (timestamp_ - start())) / duration();
        }
    }
}
