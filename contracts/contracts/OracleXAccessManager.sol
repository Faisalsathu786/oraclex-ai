// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract OracleXAccessManager is AccessControl {
    bytes32 public constant SUPER_ADMIN = keccak256("SUPER_ADMIN");
    bytes32 public constant MODERATOR = keccak256("MODERATOR");

    uint256 public protocolFee;
    mapping(address => bool) public suspendedUsers;
    bool public paused;

    event ModeratorAdded(address indexed moderator);
    event UserSuspended(address indexed user, bool suspended);
    event ProtocolPaused(bool paused);

    constructor(uint256 _protocolFee) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN, msg.sender);
        protocolFee = _protocolFee;
    }

    function addModerator(address _moderator) external onlyRole(SUPER_ADMIN) {
        grantRole(MODERATOR, _moderator);
        emit ModeratorAdded(_moderator);
    }

    function removeModerator(address _moderator) external onlyRole(SUPER_ADMIN) {
        revokeRole(MODERATOR, _moderator);
    }

    function suspendUser(address _user, bool _suspended) external onlyRole(MODERATOR) {
        suspendedUsers[_user] = _suspended;
        emit UserSuspended(_user, _suspended);
    }

    function pause(bool _paused) external onlyRole(SUPER_ADMIN) {
        paused = _paused;
        emit ProtocolPaused(_paused);
    }

    function updateFee(uint256 _newFee) external onlyRole(SUPER_ADMIN) {
        require(_newFee <= 1000, "Max 10%");
        protocolFee = _newFee;
    }

    function isModerator(address _account) external view returns (bool) {
        return hasRole(MODERATOR, _account);
    }

    function isSuperAdmin(address _account) external view returns (bool) {
        return hasRole(SUPER_ADMIN, _account);
    }
}
