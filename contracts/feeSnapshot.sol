// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

abstract contract feeSnapshot {
    using Arrays for uint256[];
    using Counters for Counters.Counter;

    //* ids: snapshot id which is recorded as block number.
    //* totalFees: accumulated market fee.
    struct Snapshots {
        uint256[] ids;
        uint256[] totalFees;
    }

    //* Account can be one of these.
    //* - rentee: user account address and rent fee
    //* - renter: NFT owner account address and renter share fee.
    //* - service: Service operator account address and service share fee.
    //* - market: Market contract owner account address and market share fee.
    mapping(address => Snapshots) private _accountFeeSnapshots;

    //* Snapshot ids increase monotonically, with the first value being 1.
    //* An id of 0 is invalid.
    Counters.Counter private _currentSnapshotId;

    /// @dev Emitted by _snapshot function when a snapshot identified by `id` is created.
    event Snapshot(uint256 id);

    /// @dev Creates a new snapshot and returns its snapshot id. Emits a Snapshot event that contains the same id.
    function _snapshot() internal virtual returns (uint256) {
        _currentSnapshotId.increment();

        uint256 currentId = _getCurrentSnapshotId();

        emit Snapshot(currentId);

        return currentId;
    }

    /// @dev Get the current snapshotId.
    function _getCurrentSnapshotId() internal view virtual returns (uint256) {
        return _currentSnapshotId.current();
    }

    /// @dev Retrieves the total fee of `account` at the time `snapshotId` was created.
    function feeOfAt(
        address account,
        uint256 snapshotId
    ) public view virtual returns (uint256) {
        return _feeAt(snapshotId, _accountFeeSnapshots[account]);
    }

    function _feeAt(
        uint256 snapshotId,
        Snapshots storage snapshots
    ) private view returns (uint256) {
        require(snapshotId > 0, "feeSnapshot: id is 0");
        require(
            snapshotId <= _getCurrentSnapshotId(),
            "feeSnapshot: nonexistent id"
        );

        // When a valid snapshot is queried, there are three possibilities:
        //  a) The queried value was not modified after the snapshot was taken. Therefore, a snapshot entry was never
        //  created for this id, and all stored snapshot ids are smaller than the requested one. The value that corresponds
        //  to this id is the current one.
        //  b) The queried value was modified after the snapshot was taken. Therefore, there will be an entry with the
        //  requested id, and its value is the one to return.
        //  c) More snapshots were created after the requested one, and the queried value was later modified. There will be
        //  no entry for the requested id: the value that corresponds to it is that of the smallest snapshot id that is
        //  larger than the requested one.
        //
        // In summary, we need to find an element in an array, returning the index of the smallest value that is larger if
        // it is not found, unless said value doesn't exist (e.g. when all values are smaller). Arrays.findUpperBound does
        // exactly this.

        uint256 index = snapshots.ids.findUpperBound(snapshotId);

        if (index == snapshots.ids.length) {
            if (index == 0) {
                return 0;
            } else {
                return snapshots.totalFees[index - 1];
            }
        } else {
            return snapshots.totalFees[index];
        }
    }

    //* Update fee snapshots before the values are modified.
    //* This is called in settleRentData function of rentMarket contract.
    function _updateAccountFee(address account, uint256 fee) internal virtual {
        _updateSnapshot(_accountFeeSnapshots[account], fee);
    }

    function _updateSnapshot(Snapshots storage snapshots, uint256 fee) private {
        uint256 currentId = _getCurrentSnapshotId();
        uint256 totalFee = 0;

        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            totalFee = _lastTotalFee(snapshots.totalFees) + fee;
            snapshots.totalFees.push(totalFee);
        }
    }

    function _lastSnapshotId(
        uint256[] storage ids
    ) private view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    function _lastTotalFee(
        uint256[] storage totalFees
    ) private view returns (uint256) {
        if (totalFees.length == 0) {
            return 0;
        } else {
            return totalFees[totalFees.length - 1];
        }
    }
}
