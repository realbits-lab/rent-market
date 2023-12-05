// SPDX-License-Identifier: MIXED

// Sources flattened with hardhat v2.19.1 https://hardhat.org

// License-Identifier: Apache-2.0 AND MIT

// File @openzeppelin/contracts/utils/Context.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/security/Pausable.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (security/Pausable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/extensions/IERC20Permit.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[EIP-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 */
interface IERC20Permit {
    /**
     * @dev Sets `value` as the allowance of `spender` over ``owner``'s tokens,
     * given ``owner``'s signed approval.
     *
     * IMPORTANT: The same issues {IERC20-approve} has related to transaction
     * ordering also apply here.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `deadline` must be a timestamp in the future.
     * - `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
     * over the EIP712-formatted function arguments.
     * - the signature must use ``owner``'s current nonce (see {nonces}).
     *
     * For more information on the signature format, see the
     * https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
     * section].
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @dev Returns the current nonce for `owner`. This value must be
     * included whenever a signature is generated for {permit}.
     *
     * Every successful call to {permit} increases ``owner``'s nonce by one. This
     * prevents a signature from being used multiple times.
     */
    function nonces(address owner) external view returns (uint256);

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}


// File @openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/extensions/draft-IERC20Permit.sol)

pragma solidity ^0.8.0;

// EIP-2612 is Final as of 2022-11-01. This file is deprecated.


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/token/ERC721/IERC721.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


// File @openzeppelin/contracts/utils/introspection/ERC165Checker.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/introspection/ERC165Checker.sol)

pragma solidity ^0.8.0;

/**
 * @dev Library used to query support of an interface declared via {IERC165}.
 *
 * Note that these functions return the actual result of the query: they do not
 * `revert` if an interface is not supported. It is up to the caller to decide
 * what to do in these cases.
 */
library ERC165Checker {
    // As per the EIP-165 spec, no interface should ever match 0xffffffff
    bytes4 private constant _INTERFACE_ID_INVALID = 0xffffffff;

    /**
     * @dev Returns true if `account` supports the {IERC165} interface.
     */
    function supportsERC165(address account) internal view returns (bool) {
        // Any contract that implements ERC165 must explicitly indicate support of
        // InterfaceId_ERC165 and explicitly indicate non-support of InterfaceId_Invalid
        return
            supportsERC165InterfaceUnchecked(account, type(IERC165).interfaceId) &&
            !supportsERC165InterfaceUnchecked(account, _INTERFACE_ID_INVALID);
    }

    /**
     * @dev Returns true if `account` supports the interface defined by
     * `interfaceId`. Support for {IERC165} itself is queried automatically.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsInterface(address account, bytes4 interfaceId) internal view returns (bool) {
        // query support of both ERC165 as per the spec and support of _interfaceId
        return supportsERC165(account) && supportsERC165InterfaceUnchecked(account, interfaceId);
    }

    /**
     * @dev Returns a boolean array where each value corresponds to the
     * interfaces passed in and whether they're supported or not. This allows
     * you to batch check interfaces for a contract where your expectation
     * is that some interfaces may not be supported.
     *
     * See {IERC165-supportsInterface}.
     *
     * _Available since v3.4._
     */
    function getSupportedInterfaces(
        address account,
        bytes4[] memory interfaceIds
    ) internal view returns (bool[] memory) {
        // an array of booleans corresponding to interfaceIds and whether they're supported or not
        bool[] memory interfaceIdsSupported = new bool[](interfaceIds.length);

        // query support of ERC165 itself
        if (supportsERC165(account)) {
            // query support of each interface in interfaceIds
            for (uint256 i = 0; i < interfaceIds.length; i++) {
                interfaceIdsSupported[i] = supportsERC165InterfaceUnchecked(account, interfaceIds[i]);
            }
        }

        return interfaceIdsSupported;
    }

    /**
     * @dev Returns true if `account` supports all the interfaces defined in
     * `interfaceIds`. Support for {IERC165} itself is queried automatically.
     *
     * Batch-querying can lead to gas savings by skipping repeated checks for
     * {IERC165} support.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsAllInterfaces(address account, bytes4[] memory interfaceIds) internal view returns (bool) {
        // query support of ERC165 itself
        if (!supportsERC165(account)) {
            return false;
        }

        // query support of each interface in interfaceIds
        for (uint256 i = 0; i < interfaceIds.length; i++) {
            if (!supportsERC165InterfaceUnchecked(account, interfaceIds[i])) {
                return false;
            }
        }

        // all interfaces supported
        return true;
    }

    /**
     * @notice Query if a contract implements an interface, does not check ERC165 support
     * @param account The address of the contract to query for support of an interface
     * @param interfaceId The interface identifier, as specified in ERC-165
     * @return true if the contract at account indicates support of the interface with
     * identifier interfaceId, false otherwise
     * @dev Assumes that account contains a contract that supports ERC165, otherwise
     * the behavior of this method is undefined. This precondition can be checked
     * with {supportsERC165}.
     *
     * Some precompiled contracts will falsely indicate support for a given interface, so caution
     * should be exercised when using this function.
     *
     * Interface identification is specified in ERC-165.
     */
    function supportsERC165InterfaceUnchecked(address account, bytes4 interfaceId) internal view returns (bool) {
        // prepare call
        bytes memory encodedParams = abi.encodeWithSelector(IERC165.supportsInterface.selector, interfaceId);

        // perform static call
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly {
            success := staticcall(30000, account, add(encodedParams, 0x20), mload(encodedParams), 0x00, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0x00)
        }

        return success && returnSize >= 0x20 && returnValue > 0;
    }
}


// File @openzeppelin/contracts/utils/math/Math.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/Math.sol)

pragma solidity ^0.8.0;

/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    enum Rounding {
        Down, // Toward negative infinity
        Up, // Toward infinity
        Zero // Toward zero
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds up instead
     * of rounding down.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv)
     * with further edits by Uniswap Labs also under MIT license.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod0 := mul(x, y)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            require(denominator > prod1, "Math: mulDiv overflow");

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator. Always >= 1.
            // See https://cs.stackexchange.com/q/138556/92363.

            // Does not overflow because the denominator cannot be zero at this stage in the function.
            uint256 twos = denominator & (~denominator + 1);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also works
            // in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (rounding == Rounding.Up && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded down.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (rounding == Rounding.Up && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (rounding == Rounding.Up && 10 ** result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256, rounded down, of a positive value.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (rounding == Rounding.Up && 1 << (result << 3) < value ? 1 : 0);
        }
    }
}


// File @openzeppelin/contracts/utils/math/SignedMath.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (utils/math/SignedMath.sol)

pragma solidity ^0.8.0;

/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMath {
    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two signed numbers without overflow.
     * The result is rounded towards zero.
     */
    function average(int256 a, int256 b) internal pure returns (int256) {
        // Formula from the book "Hacker's Delight"
        int256 x = (a & b) + ((a ^ b) >> 1);
        return x + (int256(uint256(x) >> 255) & (a ^ b));
    }

    /**
     * @dev Returns the absolute unsigned value of a signed value.
     */
    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            // must be unchecked in order to support `n = type(int256).min`
            return uint256(n >= 0 ? n : -n);
        }
    }
}


// File @openzeppelin/contracts/utils/Strings.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/Strings.sol)

pragma solidity ^0.8.0;


/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    uint8 private constant _ADDRESS_LENGTH = 20;

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `int256` to its ASCII `string` decimal representation.
     */
    function toString(int256 value) internal pure returns (string memory) {
        return string(abi.encodePacked(value < 0 ? "-" : "", toString(SignedMath.abs(value))));
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), _ADDRESS_LENGTH);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}


// File contracts/IRentNFT.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.9;

/**
 * @dev Required interface of an rentNFT compliant contract.
 */
interface IRentNFT is IERC165 {
    /**
     * @dev Returns the register's account address.
     */
    function checkRegisterRole(
        address registerAddress
    ) external view returns (bool result);
}


// File contracts/iterableMapLib.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.9;

library pendingRentFeeIterableMap {
    struct pendingRentFee {
        address renterAddress;
        address serviceAddress;
        address feeTokenAddress;
        uint256 amount;
    }

    struct pendingRentFeeEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        pendingRentFee data;
    }

    struct pendingRentFeeMap {
        mapping(string => pendingRentFeeEntry) data;
        string[] keys;
    }

    function encodeKey(
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress
    ) public pure returns (string memory) {
        string memory keyString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(renterAddress)), 20),
                Strings.toHexString(uint256(uint160(serviceAddress)), 20),
                Strings.toHexString(uint256(uint160(feeTokenAddress)), 20)
            )
        );

        return keyString;
    }

    function decodeKey(
        pendingRentFeeMap storage self,
        string memory key
    )
        public
        view
        returns (
            address renterAddress,
            address serviceAddress,
            address feeTokenAddress
        )
    {
        pendingRentFeeEntry memory e = self.data[key];

        return (
            e.data.renterAddress,
            e.data.serviceAddress,
            e.data.feeTokenAddress
        );
    }

    function insert(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress,
        uint256 amount
    ) public returns (bool success) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        pendingRentFeeEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.renterAddress = renterAddress;
            e.data.serviceAddress = serviceAddress;
            e.data.feeTokenAddress = feeTokenAddress;
            e.data.amount = amount;

            return true;
        }
    }

    function add(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress,
        uint256 amount
    ) public returns (bool success) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        pendingRentFeeEntry storage e = self.data[key];

        if (e.idx > 0) {
            e.data.amount = e.data.amount + amount;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.renterAddress = renterAddress;
            e.data.serviceAddress = serviceAddress;
            e.data.feeTokenAddress = feeTokenAddress;
            e.data.amount = amount;
        }

        return true;
    }

    function sub(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress,
        uint256 amount
    ) public returns (bool success) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        pendingRentFeeEntry storage e = self.data[key];

        if (e.idx > 0 && e.data.amount >= amount) {
            e.data.amount = e.data.amount - amount;

            if (e.data.amount == 0) {
                remove(self, renterAddress, serviceAddress, feeTokenAddress);
            }
            return true;
        } else {
            return false;
        }
    }

    function remove(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress
    ) public returns (bool success) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        pendingRentFeeEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress
    ) public view returns (bool exists) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        return self.data[key].idx > 0;
    }

    function size(
        pendingRentFeeMap storage self
    ) public view returns (uint256) {
        return self.keys.length;
    }

    function getAmount(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress
    ) public view returns (uint256) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        return self.data[key].data.amount;
    }

    function getAll(
        pendingRentFeeMap storage self
    ) public view returns (pendingRentFee[] memory) {
        pendingRentFee[] memory data = new pendingRentFee[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    function getByRenterAddress(
        pendingRentFeeMap storage self,
        address renterAddress
    ) public view returns (pendingRentFee[] memory) {
        uint256 count = 0;

        pendingRentFee[] memory data = new pendingRentFee[](self.keys.length);
        for (uint256 i = 0; i < self.keys.length; i++) {
            if (self.data[self.keys[i]].data.renterAddress == renterAddress) {
                data[i] = self.data[self.keys[i]].data;
                count = count + 1;
            }
        }

        pendingRentFee[] memory returnData = new pendingRentFee[](count);
        for (uint256 i = 0; i < count; i++) {
            returnData[i] = data[i];
        }

        return returnData;
    }

    function getByServiceAddress(
        pendingRentFeeMap storage self,
        address serviceAddress
    ) public view returns (pendingRentFee[] memory) {
        uint256 count = 0;

        pendingRentFee[] memory data = new pendingRentFee[](self.keys.length);
        for (uint256 i = 0; i < self.keys.length; i++) {
            if (self.data[self.keys[i]].data.serviceAddress == serviceAddress) {
                data[i] = self.data[self.keys[i]].data;
                count = count + 1;
            }
        }

        pendingRentFee[] memory returnData = new pendingRentFee[](count);
        for (uint256 i = 0; i < count; i++) {
            returnData[i] = data[i];
        }

        return returnData;
    }

    function getByAddress(
        pendingRentFeeMap storage self,
        address renterAddress,
        address serviceAddress,
        address feeTokenAddress
    ) public view returns (pendingRentFee memory) {
        string memory key = encodeKey(
            renterAddress,
            serviceAddress,
            feeTokenAddress
        );
        return self.data[key].data;
    }

    function getKeyByIndex(
        pendingRentFeeMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        pendingRentFeeMap storage self,
        uint256 idx
    ) public view returns (pendingRentFee memory) {
        return self.data[self.keys[idx]].data;
    }
}

library accountBalanceIterableMap {
    struct accountBalance {
        address accountAddress;
        address tokenAddress;
        uint256 amount;
    }

    struct accountBalanceEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        accountBalance data;
    }

    struct accountBalanceMap {
        mapping(string => accountBalanceEntry) data;
        string[] keys;
    }

    function encodeKey(
        address accountAddress,
        address tokenAddress
    ) public pure returns (string memory) {
        string memory keyString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(accountAddress)), 20),
                Strings.toHexString(uint256(uint160(tokenAddress)), 20)
            )
        );

        return keyString;
    }

    function decodeKey(
        accountBalanceMap storage self,
        string memory key
    ) public view returns (address accountAddress, address tokenAddress) {
        accountBalanceEntry memory e = self.data[key];

        return (e.data.accountAddress, e.data.tokenAddress);
    }

    function add(
        accountBalanceMap storage self,
        address accountAddress,
        address tokenAddress,
        uint256 amount
    ) public returns (bool success) {
        string memory key = encodeKey(accountAddress, tokenAddress);
        accountBalanceEntry storage e = self.data[key];

        if (e.idx > 0) {
            e.data.amount = e.data.amount + amount;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.accountAddress = accountAddress;
            e.data.tokenAddress = tokenAddress;
            e.data.amount = amount;
        }

        return true;
    }

    function insert(
        accountBalanceMap storage self,
        address accountAddress,
        address tokenAddress,
        uint256 amount
    ) public returns (bool success) {
        string memory key = encodeKey(accountAddress, tokenAddress);
        accountBalanceEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.accountAddress = accountAddress;
            e.data.tokenAddress = tokenAddress;
            e.data.amount = amount;

            return true;
        }
    }

    function remove(
        accountBalanceMap storage self,
        address accountAddress,
        address tokenAddress
    ) public returns (bool success) {
        string memory key = encodeKey(accountAddress, tokenAddress);
        accountBalanceEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        accountBalanceMap storage self,
        address accountAddress,
        address tokenAddress
    ) public view returns (bool exists) {
        string memory key = encodeKey(accountAddress, tokenAddress);
        return self.data[key].idx > 0;
    }

    function size(
        accountBalanceMap storage self
    ) public view returns (uint256) {
        return self.keys.length;
    }

    function getAmount(
        accountBalanceMap storage self,
        address accountAddress,
        address tokenAddress
    ) public view returns (uint256) {
        string memory key = encodeKey(accountAddress, tokenAddress);
        return self.data[key].data.amount;
    }

    function getAll(
        accountBalanceMap storage self
    ) public view returns (accountBalance[] memory) {
        accountBalance[] memory data = new accountBalance[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    function getTotalBalance(
        accountBalanceMap storage self,
        address tokenAddress
    ) public view returns (uint256) {
        uint256 totalBalance = 0;
        for (uint256 i = 0; i < self.keys.length; i++) {
            if (self.data[self.keys[i]].data.tokenAddress == tokenAddress) {
                totalBalance =
                    totalBalance +
                    self.data[self.keys[i]].data.amount;
            }
        }

        return totalBalance;
    }

    function getByAddress(
        accountBalanceMap storage self,
        address accountAddress,
        address tokenAddress
    ) public view returns (accountBalance memory) {
        string memory key = encodeKey(accountAddress, tokenAddress);
        return self.data[key].data;
    }

    function getKeyByIndex(
        accountBalanceMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        accountBalanceMap storage self,
        uint256 idx
    ) public view returns (accountBalance memory) {
        return self.data[self.keys[idx]].data;
    }
}

library tokenDataIterableMap {
    struct tokenData {
        address tokenAddress;
        string name;
    }

    struct tokenDataEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        tokenData data;
    }

    struct tokenDataMap {
        mapping(string => tokenDataEntry) data;
        string[] keys;
    }

    function encodeKey(
        address tokenAddress
    ) public pure returns (string memory) {
        string memory keyString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(tokenAddress)), 20)
            )
        );

        return keyString;
    }

    function decodeKey(
        tokenDataMap storage self,
        string memory key
    ) public view returns (address tokenAddress) {
        tokenDataEntry memory e = self.data[key];

        return e.data.tokenAddress;
    }

    function insert(
        tokenDataMap storage self,
        address tokenAddress,
        string memory name
    ) public returns (bool success) {
        string memory key = encodeKey(tokenAddress);
        tokenDataEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.tokenAddress = tokenAddress;
            e.data.name = name;

            return true;
        }
    }

    function remove(
        tokenDataMap storage self,
        address tokenAddress
    ) public returns (bool success) {
        string memory key = encodeKey(tokenAddress);
        tokenDataEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        tokenDataMap storage self,
        address tokenAddress
    ) public view returns (bool exists) {
        string memory key = encodeKey(tokenAddress);
        return self.data[key].idx > 0;
    }

    function size(tokenDataMap storage self) public view returns (uint256) {
        return self.keys.length;
    }

    function getName(
        tokenDataMap storage self,
        address tokenAddress
    ) public view returns (string memory) {
        string memory key = encodeKey(tokenAddress);
        return self.data[key].data.name;
    }

    function getAll(
        tokenDataMap storage self
    ) public view returns (tokenData[] memory) {
        tokenData[] memory data = new tokenData[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    function getByAddress(
        tokenDataMap storage self,
        address tokenAddress
    ) public view returns (tokenData memory) {
        string memory key = encodeKey(tokenAddress);
        return self.data[key].data;
    }

    function getKeyByIndex(
        tokenDataMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        tokenDataMap storage self,
        uint256 idx
    ) public view returns (tokenData memory) {
        return self.data[self.keys[idx]].data;
    }
}

library collectionDataIterableMap {
    struct collectionData {
        address collectionAddress;
        string uri;
    }

    struct collectionDataEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        collectionData data;
    }

    struct collectionDataMap {
        mapping(string => collectionDataEntry) data;
        string[] keys;
    }

    function encodeKey(
        address collectionAddress
    ) public pure returns (string memory) {
        string memory keyString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(collectionAddress)), 20)
            )
        );

        return keyString;
    }

    function decodeKey(
        collectionDataMap storage self,
        string memory key
    ) public view returns (address collectionAddress) {
        collectionDataEntry memory e = self.data[key];

        return e.data.collectionAddress;
    }

    function insert(
        collectionDataMap storage self,
        address collectionAddress,
        string memory uri
    ) public returns (bool success) {
        string memory key = encodeKey(collectionAddress);
        collectionDataEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.collectionAddress = collectionAddress;
            e.data.uri = uri;

            return true;
        }
    }

    function remove(
        collectionDataMap storage self,
        address collectionAddress
    ) public returns (bool success) {
        string memory key = encodeKey(collectionAddress);
        collectionDataEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        collectionDataMap storage self,
        address collectionAddress
    ) public view returns (bool exists) {
        string memory key = encodeKey(collectionAddress);
        return self.data[key].idx > 0;
    }

    function size(
        collectionDataMap storage self
    ) public view returns (uint256) {
        return self.keys.length;
    }

    function getUri(
        collectionDataMap storage self,
        address collectionAddress
    ) public view returns (string memory) {
        string memory key = encodeKey(collectionAddress);
        return self.data[key].data.uri;
    }

    function getAll(
        collectionDataMap storage self
    ) public view returns (collectionData[] memory) {
        collectionData[] memory data = new collectionData[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    function getByAddress(
        collectionDataMap storage self,
        address collectionAddress
    ) public view returns (collectionData memory) {
        string memory key = encodeKey(collectionAddress);
        return self.data[key].data;
    }

    function getKeyByIndex(
        collectionDataMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        collectionDataMap storage self,
        uint256 idx
    ) public view returns (collectionData memory) {
        return self.data[self.keys[idx]].data;
    }
}

library serviceDataIterableMap {
    struct serviceData {
        address serviceAddress;
        string uri;
    }

    struct serviceDataEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        serviceData data;
    }

    struct serviceDataMap {
        mapping(string => serviceDataEntry) data;
        string[] keys;
    }

    function encodeKey(
        address serviceAddress
    ) public pure returns (string memory) {
        string memory keyString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(serviceAddress)), 20)
            )
        );

        return keyString;
    }

    function decodeKey(
        serviceDataMap storage self,
        string memory key
    ) public view returns (address serviceAddress) {
        serviceDataEntry memory e = self.data[key];

        return e.data.serviceAddress;
    }

    function insert(
        serviceDataMap storage self,
        address serviceAddress,
        string memory uri
    ) public returns (bool success) {
        string memory key = encodeKey(serviceAddress);
        serviceDataEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.serviceAddress = serviceAddress;
            e.data.uri = uri;

            return true;
        }
    }

    function remove(
        serviceDataMap storage self,
        address serviceAddress
    ) public returns (bool success) {
        string memory key = encodeKey(serviceAddress);
        serviceDataEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        serviceDataMap storage self,
        address serviceAddress
    ) public view returns (bool exists) {
        string memory key = encodeKey(serviceAddress);
        return self.data[key].idx > 0;
    }

    function size(serviceDataMap storage self) public view returns (uint256) {
        return self.keys.length;
    }

    function getUri(
        serviceDataMap storage self,
        address serviceAddress
    ) public view returns (string memory) {
        string memory key = encodeKey(serviceAddress);
        return self.data[key].data.uri;
    }

    function getAll(
        serviceDataMap storage self
    ) public view returns (serviceData[] memory) {
        serviceData[] memory data = new serviceData[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    function getByAddress(
        serviceDataMap storage self,
        address serviceAddress
    ) public view returns (serviceData memory) {
        string memory key = encodeKey(serviceAddress);
        return self.data[key].data;
    }

    function getKeyByIndex(
        serviceDataMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        serviceDataMap storage self,
        uint256 idx
    ) public view returns (serviceData memory) {
        return self.data[self.keys[idx]].data;
    }
}

library registerDataIterableMap {
    struct registerData {
        address nftAddress;
        uint256 tokenId;
        uint256 rentFee;
        address feeTokenAddress;
        uint256 rentFeeByToken;
        uint256 rentDuration;
    }

    struct registerDataEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        registerData data;
    }

    struct registerDataMap {
        mapping(string => registerDataEntry) data;
        string[] keys;
    }

    function encodeKey(
        address nftAddress,
        uint256 tokenId
    ) public pure returns (string memory) {
        string memory keyString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(nftAddress)), 20),
                Strings.toString(tokenId)
            )
        );

        return keyString;
    }

    function decodeKey(
        registerDataMap storage self,
        string memory key
    ) public view returns (address nftAddress, uint256 tokenId) {
        registerDataEntry memory e = self.data[key];

        return (e.data.nftAddress, e.data.tokenId);
    }

    function insert(
        registerDataMap storage self,
        address nftAddress,
        uint256 tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        uint256 rentDuration
    ) public returns (bool success) {
        string memory key = encodeKey(nftAddress, tokenId);
        registerDataEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.nftAddress = nftAddress;
            e.data.tokenId = tokenId;
            e.data.rentFee = rentFee;
            e.data.feeTokenAddress = feeTokenAddress;
            e.data.rentFeeByToken = rentFeeByToken;
            e.data.rentDuration = rentDuration;

            return true;
        }
    }

    function set(
        registerDataMap storage self,
        address nftAddress,
        uint256 tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        uint256 rentDuration
    ) public returns (bool success) {
        string memory key = encodeKey(nftAddress, tokenId);
        registerDataEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Set data.
        e.data.rentFee = rentFee;
        e.data.feeTokenAddress = feeTokenAddress;
        e.data.rentFeeByToken = rentFeeByToken;
        e.data.rentDuration = rentDuration;

        return true;
    }

    function remove(
        registerDataMap storage self,
        address nftAddress,
        uint256 tokenId
    ) public returns (bool success) {
        string memory key = encodeKey(nftAddress, tokenId);
        registerDataEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        registerDataMap storage self,
        address nftAddress,
        uint256 tokenId
    ) public view returns (bool exists) {
        string memory key = encodeKey(nftAddress, tokenId);
        return self.data[key].idx > 0;
    }

    function size(registerDataMap storage self) public view returns (uint256) {
        return self.keys.length;
    }

    /// @dev Return all registered data as array type
    /// @param self Self class
    /// @return All registered data as array
    function getAll(
        registerDataMap storage self
    ) public view returns (registerData[] memory) {
        registerData[] memory data = new registerData[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    /// @dev Return all registered data which has nft address
    /// @param self Self class
    /// @param nftAddress Self class
    /// @return All registered data which has nft address
    function getByCollection(
        registerDataMap storage self,
        address nftAddress
    ) public view returns (registerData[] memory) {
        uint256 count = 0;

        // Filter with nft address through all register data.
        registerData[] memory data = new registerData[](self.keys.length);
        for (uint256 i = 0; i < self.keys.length; i++) {
            if (self.data[self.keys[i]].data.nftAddress == nftAddress) {
                data[count] = self.data[self.keys[i]].data;
                count = count + 1;
            }
        }

        // Copy only filtered data with collection address.
        registerData[] memory returnData = new registerData[](count);
        for (uint256 i = 0; i < count; i++) {
            returnData[i] = data[i];
        }

        return returnData;
    }

    function getByNFT(
        registerDataMap storage self,
        address nftAddress,
        uint256 tokenId
    ) public view returns (registerData memory) {
        string memory key = encodeKey(nftAddress, tokenId);
        return self.data[key].data;
    }

    function getKeyByIndex(
        registerDataMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        registerDataMap storage self,
        uint256 idx
    ) public view returns (registerData memory) {
        return self.data[self.keys[idx]].data;
    }
}

library rentDataIterableMap {
    struct rentData {
        address nftAddress;
        uint256 tokenId;
        uint256 rentFee;
        address feeTokenAddress;
        uint256 rentFeeByToken;
        bool isRentByToken;
        uint256 rentDuration;
        address renterAddress;
        address renteeAddress;
        address serviceAddress;
        uint256 rentStartTimestamp;
    }

    struct rentDataEntry {
        // idx should be same as the index of the key of this item in keys + 1.
        uint256 idx;
        rentData data;
    }

    struct rentDataMap {
        mapping(string => rentDataEntry) data;
        string[] keys;
    }

    function encodeKey(
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public pure returns (string memory) {
        string memory nftString = string(
            abi.encodePacked(
                Strings.toHexString(uint256(uint160(nftAddress)), 20),
                Strings.toString(tokenId)
            )
        );

        string memory keyString = string(
            abi.encodePacked(
                nftString,
                Strings.toHexString(uint256(uint160(renteeAddress)), 20)
            )
        );

        return keyString;
    }

    function decodeKey(
        rentDataMap storage self,
        string memory key
    ) public view returns (address nftAddress, uint256 tokenId) {
        rentDataEntry memory e = self.data[key];

        return (e.data.nftAddress, e.data.tokenId);
    }

    function insert(
        rentDataMap storage self,
        rentData memory data
    ) public returns (bool success) {
        string memory key = encodeKey(
            data.nftAddress,
            data.tokenId,
            data.renteeAddress
        );
        rentDataEntry storage e = self.data[key];

        if (e.idx > 0) {
            return false;
        } else {
            // Add self.keys.
            self.keys.push(key);

            // Add self.data.
            e.idx = self.keys.length;
            e.data.nftAddress = data.nftAddress;
            e.data.tokenId = data.tokenId;
            e.data.rentFee = data.rentFee;
            e.data.feeTokenAddress = data.feeTokenAddress;
            e.data.rentFeeByToken = data.rentFeeByToken;
            e.data.isRentByToken = data.isRentByToken;
            e.data.rentDuration = data.rentDuration;
            e.data.renterAddress = data.renterAddress;
            e.data.renteeAddress = data.renteeAddress;
            e.data.serviceAddress = data.serviceAddress;
            e.data.rentStartTimestamp = data.rentStartTimestamp;

            return true;
        }
    }

    function remove(
        rentDataMap storage self,
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public returns (bool success) {
        string memory key = encodeKey(nftAddress, tokenId, renteeAddress);
        rentDataEntry storage e = self.data[key];

        // Check if entry not exist or invalid idx value.
        if (e.idx == 0 || e.idx > self.keys.length) {
            return false;
        }

        // Move an existing element into the vacated key slot.
        uint256 mapKeyArrayIndex = e.idx - 1;
        uint256 keyArrayLastIndex = self.keys.length - 1;

        // Move.
        self.data[self.keys[keyArrayLastIndex]].idx = mapKeyArrayIndex + 1;
        self.keys[mapKeyArrayIndex] = self.keys[keyArrayLastIndex];

        // Delete self.keys.
        self.keys.pop();

        // Delete self.data.
        delete self.data[key];

        return true;
    }

    function contains(
        rentDataMap storage self,
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public view returns (bool exists) {
        string memory key = encodeKey(nftAddress, tokenId, renteeAddress);
        return self.data[key].idx > 0;
    }

    function size(rentDataMap storage self) public view returns (uint256) {
        return self.keys.length;
    }

    /// @dev Return all rented data as array type
    /// @param self Self class
    /// @return All rented data as array
    function getAll(
        rentDataMap storage self
    ) public view returns (rentData[] memory) {
        rentData[] memory data = new rentData[](self.keys.length);

        for (uint256 i = 0; i < self.keys.length; i++) {
            data[i] = self.data[self.keys[i]].data;
        }

        return data;
    }

    /// @dev Return all rented data which has nft address
    /// @param self Self class
    /// @param nftAddress Nft address
    /// @return All rented data which has nft address
    function getByNftAddress(
        rentDataMap storage self,
        address nftAddress
    ) public view returns (rentData[] memory) {
        uint256 count = 0;

        rentData[] memory data = new rentData[](self.keys.length);
        for (uint256 i = 0; i < self.keys.length; i++) {
            if (self.data[self.keys[i]].data.nftAddress == nftAddress) {
                data[i] = self.data[self.keys[i]].data;
                count = count + 1;
            }
        }

        rentData[] memory returnData = new rentData[](count);
        for (uint256 i = 0; i < count; i++) {
            returnData[i] = data[i];
        }

        return returnData;
    }

    /// @dev Return all rented data which has rentee address
    /// @param self Self class
    /// @param renteeAddress Rentee address
    /// @return All rented data which has nft address
    function getByRenteeAddress(
        rentDataMap storage self,
        address renteeAddress
    ) public view returns (rentData[] memory) {
        uint256 count = 0;

        rentData[] memory data = new rentData[](self.keys.length);
        for (uint256 i = 0; i < self.keys.length; i++) {
            if (self.data[self.keys[i]].data.renteeAddress == renteeAddress) {
                data[i] = self.data[self.keys[i]].data;
                count = count + 1;
            }
        }

        rentData[] memory returnData = new rentData[](count);
        for (uint256 i = 0; i < count; i++) {
            returnData[i] = data[i];
        }

        return returnData;
    }

    function getByRentData(
        rentDataMap storage self,
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public view returns (rentData memory) {
        string memory key = encodeKey(nftAddress, tokenId, renteeAddress);
        return self.data[key].data;
    }

    function getKeyByIndex(
        rentDataMap storage self,
        uint256 idx
    ) public view returns (string memory) {
        return self.keys[idx];
    }

    function getDataByIndex(
        rentDataMap storage self,
        uint256 idx
    ) public view returns (rentData memory) {
        return self.data[self.keys[idx]].data;
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


// File @openzeppelin/contracts/utils/math/SafeMath.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/SafeMath.sol)

pragma solidity ^0.8.0;

// CAUTION
// This version of SafeMath should only be used with Solidity 0.8 or later,
// because it relies on the compiler's built in overflow checks.

/**
 * @dev Wrappers over Solidity's arithmetic operations.
 *
 * NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
 * now has built in overflow checking.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator.
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}


// File contracts/utilFunctions.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.9;




library utilFunctions {
    using ERC165Checker for address;

    function getNFTOwner(
        address nftAddress,
        uint256 tokenId
    ) public view returns (address) {
        //* Check nftAddress_ has IRentNFT interface.
        bool supportInterfaceResult = nftAddress.supportsInterface(
            type(IERC721).interfaceId
        );

        //* Call checkRegisterRole function and return result.
        if (supportInterfaceResult == true) {
            //* Get the owner address of NFT with token ID.
            address ownerAddress = IERC721(nftAddress).ownerOf(tokenId);
            // console.log("ownerAddress: ", ownerAddress);
            return ownerAddress;
        } else {
            return address(0);
        }
    }

    function checkRegister(
        address nftAddress_,
        address sender_
    ) public view returns (bool result) {
        //* Check nftAddress_ has IRentNFT interface.
        bool supportInterfaceResult = nftAddress_.supportsInterface(
            type(IRentNFT).interfaceId
        );

        //* Call checkRegisterRole function and return result.
        if (supportInterfaceResult == true) {
            //* Get the owner address of NFT with token ID.
            bool response = IRentNFT(nftAddress_).checkRegisterRole(sender_);
            // console.log("response: ", response);
            return response;
        } else {
            return false;
        }
    }
}


// File contracts/rentMarket.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.9;






// import "hardhat/console.sol";



//*
//* Error messages.
//*
//* RM1 : The same element is already request.
//* RM2 : The same element is already register.
//* RM3 : No element in register.
//* RM4 : Sender is not the owner of NFT.
//* RM5 : Sender is not the owner of NFT or the owner of rentMarket.
//* RM6 : No register for this service address.
//* RM7 : No register eata for this NFT.
//* RM8 : Transaction value is not same as the rent fee.
//* RM9 : Already rented.
//* RM10 : No rent data in renteeDataMap for this NFT.
//* RM11 : msg.sender should be same as renteeAddress.
//* RM12 : Sum should be 100.
//* RM13 : msg.sender should be zero, because of erc20 payment.
//* RM14 : Failed to recipient.call.
//* RM15 : msg.sender should be same as renteeAddress or the owner of rentMarket.
//* RM16 : The current block timestamp is under rent start + rent duration timestamp.
//* RM17 : Sender is not the recipient or the owner of rentMarket.
//* RM18 : IERC20 approve function call failed.
//* RM19 : IERC20 transferFrom function call failed.
//* RM20 : Fee token address is not registered.
//* RM21 : NFT token is not existed.
//* RM22 : NFT should be registered to market as collection.
//* RM23 : Balance is under the rent fee by token.

/// @title A rentMarket class.
/// @author A realbits dev team.
/// @dev All function calls are currently being tested.
contract rentMarket is Ownable, Pausable {
    //* Iterable mapping data type with library.
    using pendingRentFeeIterableMap for pendingRentFeeIterableMap.pendingRentFeeMap;
    using accountBalanceIterableMap for accountBalanceIterableMap.accountBalanceMap;
    using tokenDataIterableMap for tokenDataIterableMap.tokenDataMap;
    using collectionDataIterableMap for collectionDataIterableMap.collectionDataMap;
    using serviceDataIterableMap for serviceDataIterableMap.serviceDataMap;
    using registerDataIterableMap for registerDataIterableMap.registerDataMap;
    using rentDataIterableMap for rentDataIterableMap.rentDataMap;
    using ERC165Checker for address;

    /// @dev Version.
    string public VERSION = "0.0.5";

    /// @dev Market fee receiver address.
    address private MARKET_SHARE_ADDRESS;

    /// @dev Default rent fee 1 ether as ether (1e18) unit.
    uint256 private RENT_FEE = 1 ether;

    /// @dev Default value is 1 day which 60 seconds * 60 minutes * 24 hours.
    uint256 private RENT_DURATION = 60 * 60 * 24;

    /// @dev Default renter fee quota.
    uint256 private RENTER_FEE_QUOTA = 80;

    /// @dev Default service fee quota.
    uint256 private SERVICE_FEE_QUOTA = 10;

    /// @dev Default market fee quota.
    uint256 private MARKET_FEE_QUOTA = 10;

    /// @dev Default vesting distribute threshold.
    uint256 private _threshold = 100;

    /// @dev Data for token.
    tokenDataIterableMap.tokenDataMap tokenItMap;

    /// @dev Data for NFT collection.
    collectionDataIterableMap.collectionDataMap collectionItMap;

    /// @dev Data for service.
    serviceDataIterableMap.serviceDataMap serviceItMap;

    /// @dev Data for register and unregister.
    registerDataIterableMap.registerDataMap registerDataItMap;

    /// @dev Data for rent and unrent.
    rentDataIterableMap.rentDataMap rentDataItMap;

    /// @dev Accumulated rent fee record map per renter address.
    pendingRentFeeIterableMap.pendingRentFeeMap pendingRentFeeMap;

    /// @dev Data for account balance data when settleRentData.
    accountBalanceIterableMap.accountBalanceMap accountBalanceItMap;

    /// @dev Use to avoid stack too deep compile error.
    struct Variable {
        uint256 previousRentDuration;
        uint256 balance;
        address serviceAddress;
        address ownerAddress;
        bool response;
    }

    //*-------------------------------------------------------------------------
    //* TOKEN FLOW
    //* COLLECTION FLOW
    //* SERVICE FLOW
    //* NFT FLOW
    //*
    //* MARKET_ADDRESS
    //* BALANCE
    //* QUOTA
    //*
    //* RENT FLOW
    //* SETTLE FLOW
    //* WITHDRAW FLOW
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* CONSTRUCTOR
    //*-------------------------------------------------------------------------

    //* Set market share address to this self contract address.
    constructor() {
        MARKET_SHARE_ADDRESS = msg.sender;
    }

    event Fallback(address indexed sender);

    fallback() external payable {
        emit Fallback(msg.sender);
    }

    event Receive(address indexed sender, uint256 indexed value);

    receive() external payable {
        emit Receive(msg.sender, msg.value);
    }

    /// @dev Call _pause function in Pausible. Only sender who has market contract owner can pause
    /// Pause rentMarket for registerNFT and rentNFT function.
    function pause() public onlyOwner {
        _pause();
    }

    /// @dev Call _unpause function in Pausible. Only sender who has market contract owner can pause
    /// Unpause rentMarket for registerNFT and rentNFT function.
    function unpause() public onlyOwner {
        _unpause();
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- TOKEN FLOW ----------------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* TOKEN EVENT
    //*-------------------------------------------------------------------------

    //* Declare register token.
    event RegisterToken(address indexed tokenAddress, string name);

    //* Declare unregister token.
    event UnregisterToken(address indexed tokenAddress, string name);

    //*-------------------------------------------------------------------------
    //* TOKEN GET/REMOVE FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Return all token data as array type
    /// @return All token data as array
    function getAllToken()
        public
        view
        returns (tokenDataIterableMap.tokenData[] memory)
    {
        return tokenItMap.getAll();
    }

    //*-------------------------------------------------------------------------
    //* TOKEN REGISTER/CHANGE/UNREGISTER FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Register token
    /// @param tokenAddress token address
    function registerToken(
        address tokenAddress,
        string memory name
    ) public onlyOwner whenNotPaused returns (bool success) {
        //* Check the duplicate element in request data.
        require(tokenItMap.contains(tokenAddress) == false, "RM1");

        //* Add request token data.
        bool response = tokenItMap.insert(tokenAddress, name);

        //* Emit RequestRegisterToken event.
        if (response == true) {
            emit RegisterToken(tokenAddress, name);
            return true;
        } else {
            return false;
        }
    }

    /// @dev Unregister token data
    /// @param tokenAddress token address
    function unregisterToken(
        address tokenAddress
    ) public onlyOwner returns (bool success) {
        //* Check the duplicate element.
        require(tokenItMap.contains(tokenAddress) == true, "RM3");

        //* Get data.
        tokenDataIterableMap.tokenData memory data = tokenItMap.getByAddress(
            tokenAddress
        );

        //* Delete tokenItMap.
        bool response = tokenItMap.remove(tokenAddress);

        if (response == true) {
            //* Emit UnregisterToken event.
            emit UnregisterToken(data.tokenAddress, data.name);
            return true;
        } else {
            return false;
        }
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- COLLECTION FLOW -----------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* COLLECTION EVENT
    //*-------------------------------------------------------------------------

    //* Declare register collection.
    event RegisterCollection(address indexed collectionAddress, string uri);

    //* Declare unregister collection.
    event UnregisterCollection(address indexed collectionAddress, string uri);

    //*-------------------------------------------------------------------------
    //* COLLECTION GET/REMOVE FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Return all collection data as array type
    /// @return All collection data as array
    function getAllCollection()
        public
        view
        returns (collectionDataIterableMap.collectionData[] memory)
    {
        return collectionItMap.getAll();
    }

    /// @dev Return matched collection data with collection address.
    /// @param collectionAddress collection address
    /// @return Matched collection data
    function getCollection(
        address collectionAddress
    ) public view returns (collectionDataIterableMap.collectionData memory) {
        return collectionItMap.getByAddress(collectionAddress);
    }

    //*-------------------------------------------------------------------------
    //* COLLECTION REGISTER/UNREGISTER FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Register NFT collection.
    /// @param collectionAddress collection address
    /// @param uri collection metadata uri
    /// @return success or failure of registering NFT collection
    function registerCollection(
        address collectionAddress,
        string memory uri
    ) public onlyOwner whenNotPaused returns (bool success) {
        //* Check the duplicate element in collection data.
        require(collectionItMap.contains(collectionAddress) == false, "RM1");

        //* Add collection data.
        bool response = collectionItMap.insert(collectionAddress, uri);

        //* Emit RegisterCollection event.
        if (response == true) {
            emit RegisterCollection(collectionAddress, uri);
            return true;
        } else {
            return false;
        }
    }

    /// @dev Unregister collection data
    /// @param collectionAddress collection address
    function unregisterCollection(
        address collectionAddress
    ) public onlyOwner returns (bool success) {
        //* Check the duplicate element.
        require(collectionItMap.contains(collectionAddress) == true, "RM3");

        //* Get data.
        collectionDataIterableMap.collectionData memory data = collectionItMap
            .getByAddress(collectionAddress);

        //* Delete registerCollectionItMap.
        bool response = collectionItMap.remove(collectionAddress);

        if (response == true) {
            //* Emit UnregisterCollection event.
            emit UnregisterCollection(data.collectionAddress, data.uri);
            return true;
        } else {
            return false;
        }
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- SERVICE FLOW --------------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* SERVICE EVENT
    //*-------------------------------------------------------------------------

    //* Declare register service.
    event RegisterService(address indexed serviceAddress, string uri);

    //* Declare unregister service.
    event UnregisterService(address indexed serviceAddress, string uri);

    //*-------------------------------------------------------------------------
    //* SERVICE GET/REMOVE FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Return all service data as array type
    /// @return All service data as array
    function getAllService()
        public
        view
        returns (serviceDataIterableMap.serviceData[] memory)
    {
        return serviceItMap.getAll();
    }

    /// @dev Return matched service data with service address.
    /// @param serviceAddress service address
    /// @return Matched service data
    function getService(
        address serviceAddress
    ) public view returns (serviceDataIterableMap.serviceData memory) {
        return serviceItMap.getByAddress(serviceAddress);
    }

    //*-------------------------------------------------------------------------
    //* SERVICE REGISTER/UNREGISTER FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Register service
    /// @param serviceAddress service address
    /// @param uri service metadata uri
    function registerService(
        address serviceAddress,
        string memory uri
    ) public onlyOwner whenNotPaused returns (bool success) {
        //* Check the duplicate element in service data.
        require(serviceItMap.contains(serviceAddress) == false, "RM1");

        //* Add service data.
        bool response = serviceItMap.insert(serviceAddress, uri);

        //* Emit RegisterService event.
        if (response == true) {
            emit RegisterService(serviceAddress, uri);
            return true;
        } else {
            return false;
        }
    }

    /// @dev Unregister service data
    /// @param serviceAddress service address
    function unregisterService(
        address serviceAddress
    ) public onlyOwner returns (bool success) {
        //* Check the duplicate element.
        require(serviceItMap.contains(serviceAddress) == true, "RM3");

        //* Get data.
        serviceDataIterableMap.serviceData memory data = serviceItMap
            .getByAddress(serviceAddress);

        //* Delete registerServiceItMap.
        bool response = serviceItMap.remove(serviceAddress);

        if (response == true) {
            //* Emit UnregisterService event.
            emit UnregisterService(data.serviceAddress, data.uri);
            return true;
        } else {
            return false;
        }
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- NFT FLOW ------------------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* NFT EVENT
    //*-------------------------------------------------------------------------

    //* Declare of register NFT event.
    event RegisterNFT(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 rentFee,
        uint256 rentDuration,
        address indexed NFTOwnerAddress
    );

    //* Declare change NFT event.
    event ChangeNFT(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        uint256 rentDuration,
        address NFTOwnerAddress,
        address indexed changerAddress
    );

    //* Declare unregister NFT event.
    event UnregisterNFT(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        uint256 rentDuration,
        address NFTOwnerAddress,
        address indexed UnregisterAddress
    );

    //*-------------------------------------------------------------------------
    //* NFT GET/REMOVE FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Return all registered data as array type
    /// @return All registered data as array
    function getAllRegisterData()
        public
        view
        returns (registerDataIterableMap.registerData[] memory)
    {
        return registerDataItMap.getAll();
    }

    /// @dev Return matched registered data with NFT address
    /// @param nftAddress NFT address
    /// @return Matched registered data
    function getRegisterDataByCollection(
        address nftAddress
    ) public view returns (registerDataIterableMap.registerData[] memory) {
        return registerDataItMap.getByCollection(nftAddress);
    }

    /// @dev Return matched registered data with NFT address and token ID
    /// @param nftAddress NFT address
    /// @param tokenId token ID
    /// @return Matched registered data
    function getRegisterData(
        address nftAddress,
        uint256 tokenId
    ) public view returns (registerDataIterableMap.registerData memory) {
        return registerDataItMap.getByNFT(nftAddress, tokenId);
    }

    //*-------------------------------------------------------------------------
    //* NFT REQUEST-REGISTER/CHANGE/UNREGISTER FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Register NFT.
    ///     Sender should be an owner of NFT or have register role.
    ///     NFT collection(address) should be already registered.
    /// @param nftAddress NFT address
    /// @param tokenId NFT token ID
    /// @return success or failture (bool).
    function registerNFT(
        address nftAddress,
        uint256 tokenId
    ) public whenNotPaused returns (bool success) {
        //* Check the duplicate element in register data.
        require(
            registerDataItMap.contains(nftAddress, tokenId) == false,
            "RM2"
        );

        //* Check msg.sender requirement.
        //* - Check msg.sender has register role in NFT with IRentNFT.
        //* - Check msg.sender is an owner.
        bool isRegister = checkRegister(nftAddress, msg.sender);
        // console.log("isRegister: ", isRegister);
        address ownerAddress = getNFTOwner(nftAddress, tokenId);
        // console.log("ownerAddress: ", ownerAddress);
        // console.log("msg.sender: ", msg.sender);

        //* Check token is exists.
        require(ownerAddress != address(0), "RM21");

        require(
            isRegister == true ||
                ownerAddress == msg.sender ||
                collectionItMap.contains(msg.sender) == true,
            "RM4"
        );

        //* Check msg.sender is NFT contract (prompt NFT case).
        //* Check msg.sender is one of collection. (call by nft contract.)
        require(collectionItMap.contains(nftAddress) == true, "RM22");

        // struct registerData {
        //     address nftAddress;
        //     uint256 tokenId;
        //     uint256 rentFee;
        //     address feeTokenAddress;
        //     uint256 rentFeeByToken;
        //     uint256 rentDuration;
        // }

        //* Add registerDataItMap with default fee and duration value.
        //* - Default feeTokenAddress and rentFeeByToken to be zero.
        bool response = registerDataItMap.insert(
            nftAddress,
            tokenId,
            RENT_FEE,
            address(0),
            0,
            RENT_DURATION
        );

        if (response == true) {
            // Emit RegisterNFT event.
            emit RegisterNFT(
                nftAddress,
                tokenId,
                RENT_FEE,
                RENT_DURATION,
                ownerAddress
            );
            return true;
        } else {
            return false;
        }
    }

    /// @dev Change NFT data
    /// @param nftAddress NFT address
    /// @param tokenId NFT token ID
    /// @param rentFee rent fee
    /// @param feeTokenAddress fee token address
    /// @param rentFeeByToken rent fee by token
    /// @param rentDuration rent duration
    function changeNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        uint256 rentDuration
    ) public whenNotPaused returns (bool success) {
        //* Check NFT owner or rentMarket owner is same as msg.sender.
        address ownerAddress = getNFTOwner(nftAddress, tokenId);
        require(msg.sender == ownerAddress || msg.sender == owner(), "RM5");

        //* Check the duplicate element.
        require(registerDataItMap.contains(nftAddress, tokenId) == true, "RM3");

        //* Check if feeTokenAddress is registered.
        if (feeTokenAddress != address(0)) {
            require(tokenItMap.contains(feeTokenAddress) == true, "RM20");
        }

        //* Change registerDataItMap.
        bool response = registerDataItMap.set(
            nftAddress,
            tokenId,
            rentFee,
            feeTokenAddress,
            rentFeeByToken,
            rentDuration
        );

        // console.log("response: ", response);

        if (response == true) {
            //* Emit ChangeNFT event.
            emit ChangeNFT(
                nftAddress,
                tokenId,
                rentFee,
                feeTokenAddress,
                rentFeeByToken,
                rentDuration,
                ownerAddress,
                msg.sender
            );
            return true;
        } else {
            return false;
        }
    }

    /// @dev Unregister NFT data
    /// @param nftAddress NFT address
    /// @param tokenId NFT token ID
    function unregisterNFT(
        address nftAddress,
        uint256 tokenId
    ) public returns (bool success) {
        //* Check NFT owner or rentMarket owner is same as msg.sender.
        bool isRegister = checkRegister(nftAddress, msg.sender);
        address ownerAddress = getNFTOwner(nftAddress, tokenId);
        require(
            isRegister == true ||
                msg.sender == ownerAddress ||
                msg.sender == owner(),
            "RM5"
        );

        //* Check the duplicate element.
        require(registerDataItMap.contains(nftAddress, tokenId) == true, "RM3");

        //* Get data.
        registerDataIterableMap.registerData memory data = registerDataItMap
            .getByNFT(nftAddress, tokenId);

        //* Delete registerDataItMap.
        bool response = registerDataItMap.remove(nftAddress, tokenId);

        //* Emit UnregisterNFT event.
        if (response == true) {
            emit UnregisterNFT(
                data.nftAddress,
                data.tokenId,
                data.rentFee,
                data.feeTokenAddress,
                data.rentFeeByToken,
                data.rentDuration,
                ownerAddress,
                msg.sender
            );
            return true;
        } else {
            return false;
        }
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- RENT FLOW -----------------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* RENT EVENT
    //*-------------------------------------------------------------------------

    //* Declare rent NFT event.
    event RentNFT(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        bool isRentByToken,
        uint256 rentDuration,
        address renterAddress,
        address indexed renteeAddress,
        address serviceAddress,
        uint256 rentStartTimestamp
    );

    //* Declare unrent NFT event.
    event UnrentNFT(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        bool isRentByToken,
        uint256 rentDuration,
        address renterAddress,
        address indexed renteeAddress,
        address serviceAddress,
        uint256 rentStartTimestamp
    );

    //*-------------------------------------------------------------------------
    //* RENT GET/REMOVE FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Return the all rented NFT data.
    /// @return All rented NFT data array.
    function getAllRentData()
        public
        view
        returns (rentDataIterableMap.rentData[] memory)
    {
        return rentDataItMap.getAll();
    }

    /// @dev Return matched rented data with NFT address
    /// @param nftAddress NFT address
    /// @return Matched rented data
    function getRentDataByNftAddress(
        address nftAddress
    ) public view returns (rentDataIterableMap.rentData[] memory) {
        return rentDataItMap.getByNftAddress(nftAddress);
    }

    /// @dev Return matched rented data with rentee address
    /// @param renteeAddress Rentee address
    /// @return Matched rented data
    function getRentDataByRenteeAddress(
        address renteeAddress
    ) public view returns (rentDataIterableMap.rentData[] memory) {
        return rentDataItMap.getByRenteeAddress(renteeAddress);
    }

    /// @dev Return matched rented data with NFT address and token ID
    /// @param nftAddress NFT address
    /// @param tokenId token ID
    /// @param renteeAddress Rentee address
    /// @return Matched rented data
    function getRentData(
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public view returns (rentDataIterableMap.rentData memory) {
        return rentDataItMap.getByRentData(nftAddress, tokenId, renteeAddress);
    }

    //*-------------------------------------------------------------------------
    //* RENT RENT/RENTBYTOKEN/UNRENT FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Rent NFT
    /// @param nftAddress NFT address
    /// @param tokenId NFT token ID
    /// @param serviceAddress service address
    function rentNFT(
        address nftAddress,
        uint256 tokenId,
        address serviceAddress
    ) public payable whenNotPaused returns (bool success) {
        Variable memory variable;

        //* Check the nftAddress and tokenId is registered.
        require(registerDataItMap.contains(nftAddress, tokenId) == true, "RM7");

        //* Check the service address is registered.
        require(serviceItMap.contains(serviceAddress) == true, "RM6");

        //* Check rent fee is the same as rentFee.
        //* msg.value is on wei unit.
        require(
            registerDataItMap.getByNFT(nftAddress, tokenId).rentFee ==
                msg.value,
            "RM8"
        );

        //* Get NFT data.
        registerDataIterableMap.registerData memory data = registerDataItMap
            .getByNFT(nftAddress, tokenId);

        variable.previousRentDuration = 0;
        if (rentDataItMap.contains(nftAddress, tokenId, msg.sender) == true) {
            rentDataIterableMap.rentData memory previousRentData = rentDataItMap
                .getByRentData(nftAddress, tokenId, msg.sender);
            variable.previousRentDuration = previousRentData.rentDuration;
            rentDataItMap.remove(nftAddress, tokenId, msg.sender);
        }

        //* Add rentDataItMap.
        //* Set isRentByToken to be false.
        variable.ownerAddress = getNFTOwner(nftAddress, tokenId);
        rentDataIterableMap.rentData memory rentData;
        rentData.nftAddress = nftAddress;
        rentData.tokenId = tokenId;
        rentData.rentFee = data.rentFee;
        rentData.feeTokenAddress = data.feeTokenAddress;
        rentData.rentFeeByToken = data.rentFeeByToken;
        rentData.isRentByToken = false;
        rentData.rentDuration =
            data.rentDuration +
            variable.previousRentDuration;
        rentData.renterAddress = variable.ownerAddress;
        rentData.renteeAddress = msg.sender;
        rentData.serviceAddress = serviceAddress;
        rentData.rentStartTimestamp = block.timestamp;

        variable.response = rentDataItMap.insert(rentData);

        if (variable.response == true) {
            //* Add pendingRentFeeMap.
            pendingRentFeeMap.add(
                variable.ownerAddress,
                serviceAddress,
                address(0),
                msg.value
            );

            //* Emit RentNFT event.
            emit RentNFT(
                nftAddress,
                tokenId,
                data.rentFee,
                data.feeTokenAddress,
                data.rentFeeByToken,
                false,
                data.rentDuration,
                variable.ownerAddress,
                msg.sender,
                serviceAddress,
                rentData.rentStartTimestamp
            );
            return true;
        } else {
            return false;
        }
    }

    /// @dev Rent NFT by token
    /// @param nftAddress NFT address
    /// @param tokenId NFT token ID
    /// @param serviceAddress service address
    function rentNFTByToken(
        address nftAddress,
        uint256 tokenId,
        address serviceAddress,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public payable whenNotPaused {
        //* Check the nftAddress and tokenId containing in register NFT data.
        require(registerDataItMap.contains(nftAddress, tokenId) == true, "RM7");

        //* Check the service address containing in service data.
        require(serviceItMap.contains(serviceAddress) == true, "RM6");

        //* In case of erc20 payment, msg.value should zero.
        require(msg.value == 0, "RM13");

        Variable memory variable;
        variable.serviceAddress = serviceAddress;

        //* Get data.
        variable.ownerAddress = getNFTOwner(nftAddress, tokenId);
        registerDataIterableMap.registerData memory data = registerDataItMap
            .getByNFT(nftAddress, tokenId);
        require(data.feeTokenAddress != address(0), "RM20");

        variable.balance = IERC20(data.feeTokenAddress).balanceOf(msg.sender);
        require(variable.balance >= data.rentFeeByToken, "RM23");

        //* Permit.
        IERC20Permit(data.feeTokenAddress).permit(
            msg.sender,
            address(this),
            data.rentFeeByToken,
            deadline,
            v,
            r,
            s
        );

        //* Send erc20 token to rentMarket contract.
        IERC20(data.feeTokenAddress).transferFrom(
            msg.sender,
            address(this),
            data.rentFeeByToken
        );

        variable.previousRentDuration = 0;
        if (rentDataItMap.contains(nftAddress, tokenId, msg.sender) == true) {
            rentDataIterableMap.rentData memory previousRentData = rentDataItMap
                .getByRentData(nftAddress, tokenId, msg.sender);
            variable.previousRentDuration = previousRentData.rentDuration;
            rentDataItMap.remove(nftAddress, tokenId, msg.sender);
        }

        //* Add rentDataItMap.
        //* Set isRentByToken to be true.
        rentDataIterableMap.rentData memory rentData;
        rentData.nftAddress = nftAddress;
        rentData.tokenId = tokenId;
        rentData.rentFee = data.rentFee;
        rentData.feeTokenAddress = data.feeTokenAddress;
        rentData.rentFeeByToken = data.rentFeeByToken;
        rentData.isRentByToken = true;
        rentData.rentDuration =
            data.rentDuration +
            variable.previousRentDuration;
        rentData.renterAddress = variable.ownerAddress;
        rentData.renteeAddress = msg.sender;
        rentData.serviceAddress = serviceAddress;
        rentData.rentStartTimestamp = block.timestamp;

        rentDataItMap.insert(rentData);

        //* Add pendingRentFeeMap.
        // console.log("data.feeTokenAddress: ", data.feeTokenAddress);
        // console.log("data.rentFeeByToken: ", data.rentFeeByToken);
        pendingRentFeeMap.add(
            variable.ownerAddress,
            serviceAddress,
            data.feeTokenAddress,
            data.rentFeeByToken
        );

        //* Emit RentNFT event.
        emit RentNFT(
            nftAddress,
            tokenId,
            data.rentFee,
            data.feeTokenAddress,
            data.rentFeeByToken,
            true,
            data.rentDuration,
            variable.ownerAddress,
            msg.sender,
            variable.serviceAddress,
            rentData.rentStartTimestamp
        );
    }

    /// @dev Unrent NFT
    /// @param nftAddress NFT address
    /// @param tokenId NFT token ID
    /// @return success or failure as boolean
    function unrentNFT(
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public returns (bool success) {
        uint256 usedAmount = 0;
        uint256 unusedAmount = 0;
        uint256 rentFee = 0;

        //* Check the duplicate element.
        require(
            (renteeAddress == msg.sender &&
                rentDataItMap.contains(nftAddress, tokenId, msg.sender) ==
                true) || owner() == msg.sender,
            "RM15"
        );

        rentDataIterableMap.rentData memory data = rentDataItMap.getByRentData(
            nftAddress,
            tokenId,
            renteeAddress
        );

        if (data.isRentByToken == true) {
            rentFee = data.rentFeeByToken;
        } else {
            rentFee = data.rentFee;
        }

        //* If duration is not finished, refund to rentee.
        uint256 timestamp = block.timestamp;
        if (
            timestamp > data.rentStartTimestamp &&
            timestamp < data.rentStartTimestamp + data.rentDuration
        ) {
            //* Calculate remain block number.
            uint256 usedBlockDiff = timestamp - data.rentStartTimestamp;

            //* Calculate refund amount.
            usedAmount = SafeMath.div(
                rentFee * usedBlockDiff,
                data.rentDuration
            );
            unusedAmount = SafeMath.sub(rentFee, usedAmount);

            //* Transfer refund.
            accountBalanceItMap.add(
                data.renteeAddress,
                data.feeTokenAddress,
                unusedAmount
            );
        }

        if (usedAmount > 0) {
            //* Calculate remain fee amount.
            uint256 renterShare = SafeMath.div(
                usedAmount * RENTER_FEE_QUOTA,
                100
            );
            uint256 serviceShare = SafeMath.div(
                usedAmount * SERVICE_FEE_QUOTA,
                100
            );
            uint256 marketShare = usedAmount - renterShare - serviceShare;

            //* Calculate and save each party amount as each share.
            //* Get renter(NFT owner) share.
            accountBalanceItMap.add(
                data.renterAddress,
                data.feeTokenAddress,
                renterShare
            );

            //* Get service share.
            accountBalanceItMap.add(
                data.serviceAddress,
                data.feeTokenAddress,
                serviceShare
            );

            //* Get market share.
            accountBalanceItMap.add(
                MARKET_SHARE_ADDRESS,
                data.feeTokenAddress,
                marketShare
            );
        }

        //* Remove rentDataItMap.
        //* For avoiding error.
        //* compilerError: Stack too deep, try removing local variables.
        rentDataIterableMap.rentData memory eventData = rentDataItMap
            .getByRentData(nftAddress, tokenId, renteeAddress);

        bool response = rentDataItMap.remove(
            nftAddress,
            tokenId,
            renteeAddress
        );

        if (response == true) {
            //* Emit UnrentNFT event.
            emit UnrentNFT(
                eventData.nftAddress,
                eventData.tokenId,
                eventData.rentFee,
                eventData.feeTokenAddress,
                eventData.rentFeeByToken,
                eventData.isRentByToken,
                eventData.rentDuration,
                eventData.renterAddress,
                eventData.renteeAddress,
                eventData.serviceAddress,
                eventData.rentStartTimestamp
            );
            return true;
        } else {
            return false;
        }
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- SETTLE FLOW ---------------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* SETTLE EVENT
    //*-------------------------------------------------------------------------

    //* Declare settle rent data event.
    event SettleRentData(
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 rentFee,
        address feeTokenAddress,
        uint256 rentFeeByToken,
        bool isRentByToken,
        uint256 rentDuration,
        address renterAddress,
        address indexed renteeAddress,
        address serviceAddress,
        uint256 rentStartTimestamp
    );

    //*-------------------------------------------------------------------------
    //* SETTLE SETTLE FUNCTION
    //*-------------------------------------------------------------------------

    function settleRentData(
        address nftAddress,
        uint256 tokenId,
        address renteeAddress
    ) public returns (bool success) {
        // struct rentData {
        //     address nftAddress;
        //     uint256 tokenId;
        //     uint256 rentFee;
        //     address feeTokenAddress;
        //     uint256 rentFeeByToken;
        //     bool isRentByToken;
        //     uint256 rentDuration;
        //     address renterAddress;
        //     address renteeAddress;
        //     address serviceAddress;
        //     uint256 rentStartTimestamp;
        // }

        //* Check nftAddress and tokenId is in rent data.
        require(
            rentDataItMap.contains(nftAddress, tokenId, renteeAddress) == true,
            "RM10"
        );

        //* Find the element which should be removed from rent data.
        //* - We checked this data (nftAddress, tokenId) is in rent data in the previous process.
        rentDataIterableMap.rentData memory data = rentDataItMap.getByRentData(
            nftAddress,
            tokenId,
            renteeAddress
        );

        //* Check current block number is over rent start block + rent duration block.
        require(
            block.timestamp > data.rentStartTimestamp + data.rentDuration,
            "RM17"
        );

        //* Check payment token and get rent fee.
        uint256 amountRentFee = 0;
        if (data.isRentByToken == true) {
            amountRentFee = data.rentFeeByToken;
        } else {
            amountRentFee = data.rentFee;
        }

        //* Calculate each party share as each quota.
        //* Get renter(NFT owner) share.
        uint256 renterShare = SafeMath.div(
            amountRentFee * RENTER_FEE_QUOTA,
            100
        );

        //* Get service share.
        uint256 serviceShare = SafeMath.div(
            amountRentFee * SERVICE_FEE_QUOTA,
            100
        );

        //* Get market share.
        uint256 marketShare = amountRentFee - renterShare - serviceShare;

        //* Transfer rent fee to the owner of NFT.
        accountBalanceItMap.add(
            data.renterAddress,
            data.feeTokenAddress,
            renterShare
        );

        accountBalanceItMap.add(
            data.serviceAddress,
            data.feeTokenAddress,
            serviceShare
        );

        accountBalanceItMap.add(
            MARKET_SHARE_ADDRESS,
            data.feeTokenAddress,
            marketShare
        );

        //* Reduce pendingRentFeeMap and remove rentDataItMap.
        pendingRentFeeMap.sub(
            data.renterAddress,
            data.serviceAddress,
            data.feeTokenAddress,
            amountRentFee
        );

        rentDataItMap.remove(data.nftAddress, data.tokenId, data.renteeAddress);

        //* Emit SettleRentData event.
        emit SettleRentData(
            data.nftAddress,
            data.tokenId,
            data.rentFee,
            data.feeTokenAddress,
            data.rentFeeByToken,
            data.isRentByToken,
            data.rentDuration,
            data.renterAddress,
            data.renteeAddress,
            data.serviceAddress,
            data.rentStartTimestamp
        );

        return true;
    }

    //*-------------------------------------------------------------------------
    //*--------------------------------- WITHDRAW FLOW -------------------------
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* WITHDRAW EVENT
    //*-------------------------------------------------------------------------

    event WithdrawMyBalance(
        address indexed recipient,
        address indexed tokenAddress,
        uint256 indexed amount
    );

    //*-------------------------------------------------------------------------
    //* WITHDRAW WITHDRAW FUNCTION
    //*-------------------------------------------------------------------------

    /// @dev Return all pending rent fee data as array type
    /// @return All pending rent fee data as array
    function getAllPendingRentFee()
        public
        view
        returns (pendingRentFeeIterableMap.pendingRentFee[] memory)
    {
        return pendingRentFeeMap.getAll();
    }

	//* TODO: Keep size under 24KiB
    /// @dev Return pending rent fee data with renter address
    /// @return Pending rent fee data with renter address
    // function getPendingRentFeeByRenterAddress(
    //     address renterAddress
    // ) public view returns (pendingRentFeeIterableMap.pendingRentFee[] memory) {
    //     return pendingRentFeeMap.getByRenterAddress(renterAddress);
    // }

	//* TODO: Keep size under 24KiB
    /// @dev Return pending rent fee data with service address
    /// @return Pending rent fee data with service address
    // function getPendingRentFeeByServiceAddress(
    //     address serviceAddress
    // ) public view returns (pendingRentFeeIterableMap.pendingRentFee[] memory) {
    //     return pendingRentFeeMap.getByServiceAddress(serviceAddress);
    // }

    /// @dev Return all account balance data as array type
    /// @return All account balance data as array
    function getAllAccountBalance()
        public
        view
        returns (accountBalanceIterableMap.accountBalance[] memory)
    {
        return accountBalanceItMap.getAll();
    }

    /// @dev Return total account accumulated balance value
    /// @return totalAccountBalance_  Total account accumulated balance
    function getTotalAccountBalance(
        address tokenAddress_
    ) public view returns (uint256 totalAccountBalance_) {
        return accountBalanceItMap.getTotalBalance(tokenAddress_);
    }

    function withdrawMyBalance(
        address recipient,
        address tokenAddress
    ) public payable returns (bool success) {
        //* Check that msg.sender should be recipient or rent market owner.
        require(msg.sender == recipient || msg.sender == owner(), "RM18");

        //* Get amount from account balance.
        uint256 amount = accountBalanceItMap.getAmount(recipient, tokenAddress);

        //* Withdraw amount, if any.
        if (amount > 0) {
            if (tokenAddress == address(0)) {
                //* Base coin case.
                // https://ethereum.stackexchange.com/questions/92169/solidity-variable-definition-bool-sent
                (bool sent, ) = recipient.call{value: amount}("");
                require(sent, "RM14");
            } else {
                //* ERC20 token case.
                bool approveResponse = IERC20(tokenAddress).approve(
                    address(this),
                    amount
                );
                require(approveResponse, "RM19");

                bool transferFromResponse = IERC20(tokenAddress).transferFrom(
                    address(this),
                    recipient,
                    amount
                );
                require(transferFromResponse, "RM20");
            }

            //* Reomve balance.
            bool response = accountBalanceItMap.remove(recipient, tokenAddress);

            if (response == true) {
                //* Emit WithdrawMyBalance event.
                emit WithdrawMyBalance(recipient, tokenAddress, amount);
                return true;
            } else {
                return false;
            }
        }
    }

    //*-------------------------------------------------------------------------
    //* UTILITY FUNCTION
    //*-------------------------------------------------------------------------

    //*-------------------------------------------------------------------------
    //* DISTRIBUTE VESTING TOKEN FUNCTION
    //*-------------------------------------------------------------------------
    function getThreshold() public view returns (uint256) {
        return _threshold;
    }

    function setThreshold(uint256 threshold_) public onlyOwner {
        _threshold = threshold_;
    }

    function distributeVestingToken(
        address tokenAddress_,
        address rewardTokenShareContractAddress_
    ) public {
        if (_threshold == 0) {
            return;
        }

        uint256 allowanceAmount = IERC20(tokenAddress_).allowance(
            rewardTokenShareContractAddress_,
            address(this)
        );
        // console.log("allowanceAmount: ", allowanceAmount);
        if (allowanceAmount == 0) {
            return;
        }

        // struct accountBalance {
        //     address accountAddress;
        //     address tokenAddress;
        //     uint256 amount;
        // }
        uint256 totalBalance = getTotalAccountBalance(tokenAddress_);
        uint256 sumVestingBalance = 0;
        accountBalanceIterableMap.accountBalance memory data;
        for (uint256 i = 0; i < accountBalanceItMap.keys.length; i++) {
            if (i >= _threshold) {
                break;
            }

            data = accountBalanceItMap.data[accountBalanceItMap.keys[i]].data;
            // console.log("data.tokenAddress: ", data.tokenAddress);
            // console.log("tokenAddress_: ", tokenAddress_);
            if (data.tokenAddress == tokenAddress_) {
                uint256 vestingShare = SafeMath.div(
                    allowanceAmount * data.amount,
                    totalBalance
                );
                sumVestingBalance += vestingShare;
                // console.log("vestingShare: ", vestingShare);
                accountBalanceItMap.add(
                    data.accountAddress,
                    data.tokenAddress,
                    vestingShare
                );
            }
        }

        // console.log("allowanceAmount: ", allowanceAmount);
        // console.log("sumVestingBalance: ", sumVestingBalance);
        // console.log(
        //     "allowanceAmount - sumVestingBalance: ",
        //     allowanceAmount - sumVestingBalance
        // );
        //* Send the remaing token to market account;
        if (allowanceAmount - sumVestingBalance > 0) {
            accountBalanceItMap.add(
                MARKET_SHARE_ADDRESS,
                tokenAddress_,
                allowanceAmount - sumVestingBalance
            );
        }
    }

    //*-------------------------------------------------------------------------
    //* MARKET_ADDRESS GET/SET FUNCTION
    //*-------------------------------------------------------------------------

    function getMarketShareAddress()
        public
        view
        returns (address shareAddress)
    {
        return MARKET_SHARE_ADDRESS;
    }

    function setMarketShareAddress(address shareAddress) public onlyOwner {
        MARKET_SHARE_ADDRESS = shareAddress;
    }

    //*-------------------------------------------------------------------------
    //* BALANCE GET FUNCTION
    //*-------------------------------------------------------------------------

    function getMyBalance(
        address tokenAddress
    ) public view returns (uint256 balance) {
        return accountBalanceItMap.getAmount(msg.sender, tokenAddress);
    }

    //*-------------------------------------------------------------------------
    //* QUOTA GET/SET FUNCTION
    //*-------------------------------------------------------------------------

    function getFeeQuota()
        public
        view
        returns (
            uint256 renterFeeQuota,
            uint256 serviceFeeQuota,
            uint256 marketFeeQuota
        )
    {
        return (RENTER_FEE_QUOTA, SERVICE_FEE_QUOTA, MARKET_FEE_QUOTA);
    }

    function setFeeQuota(
        uint256 renterFeeQuota,
        uint256 serviceFeeQuota,
        uint256 marketFeeQuota
    ) public onlyOwner {
        //* Sum should be 100.
        require(
            renterFeeQuota + serviceFeeQuota + marketFeeQuota == 100,
            "RM12"
        );

        //* Set each quota.
        RENTER_FEE_QUOTA = renterFeeQuota;
        SERVICE_FEE_QUOTA = serviceFeeQuota;
        MARKET_FEE_QUOTA = marketFeeQuota;
    }

    function checkRegister(
        address nftAddress_,
        address sender_
    ) private view returns (bool result) {
        return utilFunctions.checkRegister(nftAddress_, sender_);
    }

    function getNFTOwner(
        address nftAddress,
        uint256 tokenId
    ) private view returns (address ownerAddress_) {
        return utilFunctions.getNFTOwner(nftAddress, tokenId);
    }
}
