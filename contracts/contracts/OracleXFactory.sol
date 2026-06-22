// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "./OracleXAccessManager.sol";
import "./OracleXMarket.sol";

contract OracleXFactory is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    using ClonesUpgradeable for address;

    bytes32 public constant FACTORY_ADMIN = keccak256("FACTORY_ADMIN");

    OracleXAccessManager public accessManager;
    address public marketImplementation;
    address public treasury;

    uint256 public marketCount;
    uint256 public totalVolume;

    address[] public allMarkets;
    mapping(uint256 => address) public marketsById;

    event MarketDeployed(uint256 indexed marketId, address indexed marketAddress, address indexed creator, string title);
    event ImplementationUpdated(address oldImpl, address newImpl);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _accessManager,
        address _marketImplementation,
        address _treasury
    ) external initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();

        accessManager = OracleXAccessManager(_accessManager);
        marketImplementation = _marketImplementation;
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FACTORY_ADMIN, msg.sender);
    }

    function createMarket(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        string calldata _imageUrl,
        string[] calldata _outcomeNames,
        string calldata _resolutionSource,
        uint256 _endDate
    ) external returns (address) {
        require(accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender), "Only moderators can create markets");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(_endDate > block.timestamp, "End date must be in future");
        require(!accessManager.suspendedUsers(msg.sender), "User suspended");
        require(_outcomeNames.length >= 2 && _outcomeNames.length <= 15, "2-15 outcomes");

        marketCount++;
        uint256 newMarketId = marketCount;

        bytes32 salt = keccak256(abi.encodePacked(block.timestamp, msg.sender, newMarketId));
        address marketAddress = marketImplementation.cloneDeterministic(salt);

        OracleXMarket market = OracleXMarket(payable(marketAddress));
        market.initialize(
            newMarketId,
            address(accessManager),
            treasury,
            msg.sender,
            _title,
            _description,
            _category,
            _imageUrl,
            _outcomeNames,
            _resolutionSource,
            _endDate,
            accessManager.protocolFee()
        );

        marketsById[newMarketId] = marketAddress;
        allMarkets.push(marketAddress);

        emit MarketDeployed(newMarketId, marketAddress, msg.sender, _title);
        return marketAddress;
    }

    function updateImplementation(address _newImpl) external onlyRole(FACTORY_ADMIN) {
        require(_newImpl != address(0), "Invalid address");
        emit ImplementationUpdated(marketImplementation, _newImpl);
        marketImplementation = _newImpl;
    }

    function updateTreasury(address _newTreasury) external onlyRole(FACTORY_ADMIN) {
        require(_newTreasury != address(0), "Invalid address");
        emit TreasuryUpdated(treasury, _newTreasury);
        treasury = _newTreasury;
    }

    function getMarket(uint256 _id) external view returns (address) {
        return marketsById[_id];
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
