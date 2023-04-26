// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

abstract contract feeSnapshot {
    using Arrays for uint256[];
    using Counters for Counters.Counter;

    //* ids: snapshot id which is recorded as block number.
    //* fees: accumulated market fees.
    struct Snapshots {
        uint256[] ids;
        uint256[] fees;
    }

    mapping(address => Snapshots) private _accountBalanceSnapshots;
    Snapshots private _totalSupplySnapshots;

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

    /// @dev Retrieves the balance of `account` at the time `snapshotId` was created.
    // function balanceOfAt(
    //     address account,
    //     uint256 snapshotId
    // ) public view virtual returns (uint256) {
    //     (bool snapshotted, uint256 value) = _valueAt(
    //         snapshotId,
    //         _accountBalanceSnapshots[account]
    //     );

    //     //* TODO: Return the snapshoted fees or the current fees.
    //     return snapshotted ? value : balanceOf(account);
    // }

    /// @dev Retrieves the total supply at the time `snapshotId` was created.
    // function totalSupplyAt(
    //     uint256 snapshotId
    // ) public view virtual returns (uint256) {
    //     (bool snapshotted, uint256 value) = _valueAt(
    //         snapshotId,
    //         _totalSupplySnapshots
    //     );

    //     //* TODO: Return the snapshoted total value or the current total value.
    //     return snapshotted ? value : totalSupply();
    // }

    //* TODO: Change this.
    //* Update balance and/or total supply snapshots before the values are modified.
    //* This is implemented in the _beforeTokenTransfer hook,
    //* which is executed for _mint, _burn, and _transfer operations.
    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) internal virtual override {
    //     super._beforeTokenTransfer(from, to, amount);

    //     if (from == address(0)) {
    //         //* Mint case.
    //         _updateAccountSnapshot(to);
    //         _updateTotalSupplySnapshot();
    //     } else if (to == address(0)) {
    //         //* Burn case.
    //         _updateAccountSnapshot(from);
    //         _updateTotalSupplySnapshot();
    //     } else {
    //         //* Transfer case.
    //         _updateAccountSnapshot(from);
    //         _updateAccountSnapshot(to);
    //     }
    // }

    // function _valueAt(
    //     uint256 snapshotId,
    //     Snapshots storage snapshots
    // ) private view returns (bool, uint256) {
    //     require(snapshotId > 0, "feeSnapshot: id is 0");
    //     require(
    //         snapshotId <= _getCurrentSnapshotId(),
    //         "feeSnapshot: nonexistent id"
    //     );

    //     // When a valid snapshot is queried, there are three possibilities:
    //     //  a) The queried value was not modified after the snapshot was taken. Therefore, a snapshot entry was never
    //     //  created for this id, and all stored snapshot ids are smaller than the requested one. The value that corresponds
    //     //  to this id is the current one.
    //     //  b) The queried value was modified after the snapshot was taken. Therefore, there will be an entry with the
    //     //  requested id, and its value is the one to return.
    //     //  c) More snapshots were created after the requested one, and the queried value was later modified. There will be
    //     //  no entry for the requested id: the value that corresponds to it is that of the smallest snapshot id that is
    //     //  larger than the requested one.
    //     //
    //     // In summary, we need to find an element in an array, returning the index of the smallest value that is larger if
    //     // it is not found, unless said value doesn't exist (e.g. when all values are smaller). Arrays.findUpperBound does
    //     // exactly this.

    //     uint256 index = snapshots.ids.findUpperBound(snapshotId);

    //     if (index == snapshots.ids.length) {
    //         return (false, 0);
    //     } else {
    //         return (true, snapshots.values[index]);
    //     }
    // }

    //* TODO: Change this.
    // function _updateAccountSnapshot(address account) private {
    //     _updateSnapshot(_accountBalanceSnapshots[account], balanceOf(account));
    // }

    //* TODO: Change this.
    // function _updateTotalSupplySnapshot() private {
    //     _updateSnapshot(_totalSupplySnapshots, totalSupply());
    // }

    // function _updateSnapshot(
    //     Snapshots storage snapshots,
    //     uint256 currentValue
    // ) private {
    //     uint256 currentId = _getCurrentSnapshotId();
    //     if (_lastSnapshotId(snapshots.ids) < currentId) {
    //         snapshots.ids.push(currentId);
    //         snapshots.values.push(currentValue);
    //     }
    // }

    function _lastSnapshotId(
        uint256[] storage ids
    ) private view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }
}
