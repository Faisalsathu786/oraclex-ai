// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./OracleXMarket.sol";

contract OracleXFactory is AccessControl {
    bytes32 public constant FACTORY_ADMIN = keccak256("FACTORY_ADMIN");

    IAccessManager2 public accessManager;
    address public marketImplementation;
    address public treasury;

    uint256 public marketCount;
    address[] public allMarkets;
    mapping(uint256 => address) public marketsById;

    event MarketDeployed(uint256 indexed marketId, address indexed market, address indexed creator, string title);

    constructor(address _accessManager, address _marketImpl, address _treasury) {
        accessManager = IAccessManager2(_accessManager);
        marketImplementation = _marketImpl;
        treasury = _treasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FACTORY_ADMIN, msg.sender);
    }

    function createMarket(
        string calldata _title, string calldata _desc, string calldata _category,
        string calldata _imageUrl, string[] calldata _outcomeNames, uint256 _endDate
    ) external returns (address) {
        require(accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender), "Only admins");
        require(_outcomeNames.length >= 2 && _outcomeNames.length <= 15, "2-15 outcomes");

        marketCount++;
        OracleXMarket market = new OracleXMarket();
        market.init(marketCount, address(accessManager), treasury, msg.sender,
            _title, _desc, _category, _imageUrl, _outcomeNames, _endDate);

        marketsById[marketCount] = address(market);
        allMarkets.push(address(market));

        emit MarketDeployed(marketCount, address(market), msg.sender, _title);
        return address(market);
    }

    function getMarket(uint256 _id) external view returns (address) {
        return marketsById[_id];
    }
}
