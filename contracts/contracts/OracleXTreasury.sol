// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IAccessManager {
    function isModerator(address) external view returns (bool);
    function isSuperAdmin(address) external view returns (bool);
    function protocolFee() external view returns (uint256);
}

contract OracleXTreasury is AccessControl {
    bytes32 public constant TREASURY_MANAGER = keccak256("TREASURY_MANAGER");
    IAccessManager public accessManager;

    uint256 public totalCollected;
    uint256 public totalDistributed;
    uint256 public lastUpdated;
    mapping(address => uint256) public pendingWithdrawals;

    event FeesCollected(address indexed market, uint256 amount);
    event WithdrawalProcessed(address indexed recipient, uint256 amount);

    constructor(address _accessManager) {
        accessManager = IAccessManager(_accessManager);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_MANAGER, msg.sender);
    }

    function collectFee(address _market, uint256 _amount) external returns (bool) {
        require(accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender), "Unauthorized");
        totalCollected += _amount;
        pendingWithdrawals[_market] += _amount;
        lastUpdated = block.timestamp;
        emit FeesCollected(_market, _amount);
        return true;
    }

    function processWithdrawal(address _recipient, uint256 _amount) external onlyRole(TREASURY_MANAGER) {
        require(_amount > 0 && address(this).balance >= _amount, "Invalid amount");
        pendingWithdrawals[_recipient] -= _amount;
        totalDistributed += _amount;
        (bool success, ) = payable(_recipient).call{value: _amount}("");
        require(success, "Transfer failed");
        emit WithdrawalProcessed(_recipient, _amount);
    }

    function getStats() external view returns (uint256, uint256, uint256) {
        return (totalCollected, totalDistributed, address(this).balance);
    }

    receive() external payable {}
}
