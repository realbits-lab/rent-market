// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "hardhat/console.sol";

/// @title A reward token wallet class.
/// @author A realbits dev team.
/// @dev A reward token wallet is used to send the vesting tokens to project contributors periodically.
///
/// The total 1 billion tokens are made when deployer calls constructor.
contract rewardToken is ERC20 {
    /// @dev Reward token released event.
    event RewardTokenReleased(uint256 amount);

    /// @dev Reward token released amount.
    uint256 private _released;

    /// @dev Share contract to which vesting would be sent.
    address private immutable _rewardTokenShareContractAddress;

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
        address rewardTokenShareContractAddress_,
        address projectTeamAccountAddress_
    ) ERC20(rewardTokenName_, rewardTokenSymbol_) {
        require(
            rewardTokenShareContractAddress_ != address(0),
            "rewardToken: rewardTokenShareContractAddress is zero address"
        );

        _rewardTokenShareContractAddress = rewardTokenShareContractAddress_;
        //* TODO: Set later.
        _start = block.timestamp;
        _duration = 250 weeks;
        _frequency = 50;

        _mint(projectTeamAccountAddress_, 200_000_000 * (10 ** 18));
        _mint(address(this), 800_000_000 * (10 ** 18));
    }

    /// @dev Getter for the share contract address.
    function rewardTokenShareContractAddress() public view returns (address) {
        return _rewardTokenShareContractAddress;
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
        return IERC20(address(this)).balanceOf(address(this)) + released();
    }

    /// @dev Getter for the amount of minimum releasable reward token vesting.
    function minimumReleasable() public view returns (uint256) {
        return totalAllocation() / frequency();
    }

    /// @dev Getter for the remaining time to the next vesting by seconds.
    function remainingTimestampToNextVesting() public view returns (uint256) {
        uint256 currentBlockTimestamp = block.timestamp;
        uint256 vestingUnitTimestamp = duration() / frequency();
        uint256 remainingTimestamp = 0;

        for (uint256 i = 0; i < frequency(); i++) {
            remainingTimestamp =
                currentBlockTimestamp -
                vestingUnitTimestamp *
                i;
            if (remainingTimestamp < vestingUnitTimestamp) {
                return remainingTimestamp;
            }
        }

        return vestingUnitTimestamp;
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
            rewardTokenShareContractAddress(),
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
            uint256 vestingAmount = (totalAllocation_ *
                (timestamp_ - start())) / duration();
            return vestingAmount;
        }
    }
}
