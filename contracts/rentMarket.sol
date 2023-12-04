// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
// import "hardhat/console.sol";
import "./iterableMapLib.sol";
import "./utilFunctions.sol";
import "./IRentNFT.sol";

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
