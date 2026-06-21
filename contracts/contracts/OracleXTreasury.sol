// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./OracleXAccessManager.sol";

contract OracleXTreasury is Initializable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
    bytes32 public constant TREASURY_MANAGER = keccak256("TREASURY_MANAGER");

    OracleXAccessManager public accessManager;

    struct FeeRecord {
        uint256 totalFeesCollected;
        uint256 totalFeesDistributed;
        uint256 lastUpdated;
    }

    FeeRecord public feeRecord;
    mapping(address => uint256) public pendingWithdrawals;

    event FeesCollected(address indexed market, uint256 amount);
    event FeesDistributed(uint256 amount);
    event WithdrawalProcessed(address indexed recipient, uint256 amount);
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _accessManager) external initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();

        accessManager = OracleXAccessManager(_accessManager);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_MANAGER, msg.sender);
    }

    function collectFee(address _market, uint256 _amount) external returns (bool) {
        require(
            accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender),
            "Unauthorized"
        );

        feeRecord.totalFeesCollected += _amount;
        pendingWithdrawals[_market] += _amount;
        feeRecord.lastUpdated = block.timestamp;

        emit FeesCollected(_market, _amount);
        return true;
    }

    function processWithdrawal(address _recipient, uint256 _amount) external nonReentrant onlyRole(TREASURY_MANAGER) {
        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Insufficient balance");

        pendingWithdrawals[_recipient] -= _amount;
        feeRecord.totalFeesDistributed += _amount;

        (bool success, ) = payable(_recipient).call{value: _amount}("");
        require(success, "Transfer failed");

        emit WithdrawalProcessed(_recipient, _amount);
    }

    function getTreasuryStats() external view returns (
        uint256 totalCollected,
        uint256 totalDistributed,
        uint256 currentBalance,
        uint256 lastUpdated
    ) {
        return (
            feeRecord.totalFeesCollected,
            feeRecord.totalFeesDistributed,
            address(this).balance,
            feeRecord.lastUpdated
        );
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    receive() external payable {}
}
