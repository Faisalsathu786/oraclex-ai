// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract OracleXAccessManager is Initializable, UUPSUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant SUPER_ADMIN = keccak256("SUPER_ADMIN");
    bytes32 public constant MODERATOR = keccak256("MODERATOR");
    bytes32 public constant USER = keccak256("USER");

    event ModeratorAdded(address indexed moderator);
    event ModeratorRemoved(address indexed moderator);
    event UserSuspended(address indexed user, bool suspended);
    event ProtocolPaused(bool paused);

    mapping(address => bool) public suspendedUsers;
    uint256 public protocolFee; // basis points (e.g., 250 = 2.5%)

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _superAdmin, uint256 _protocolFee) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __Pausable_init();

        _grantRole(SUPER_ADMIN, _superAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        protocolFee = _protocolFee;
    }

    function addModerator(address _moderator) external onlyRole(SUPER_ADMIN) {
        grantRole(MODERATOR, _moderator);
        emit ModeratorAdded(_moderator);
    }

    function removeModerator(address _moderator) external onlyRole(SUPER_ADMIN) {
        revokeRole(MODERATOR, _moderator);
        emit ModeratorRemoved(_moderator);
    }

    function suspendUser(address _user, bool _suspended) external onlyRole(MODERATOR) {
        suspendedUsers[_user] = _suspended;
        emit UserSuspended(_user, _suspended);
    }

    function pause() external onlyRole(SUPER_ADMIN) {
        _pause();
        emit ProtocolPaused(true);
    }

    function unpause() external onlyRole(SUPER_ADMIN) {
        _unpause();
        emit ProtocolPaused(false);
    }

    function updateFee(uint256 _newFee) external onlyRole(SUPER_ADMIN) {
        require(_newFee <= 1000, "Fee too high"); // max 10%
        protocolFee = _newFee;
    }

    function isModerator(address _account) external view returns (bool) {
        return hasRole(MODERATOR, _account);
    }

    function isSuperAdmin(address _account) external view returns (bool) {
        return hasRole(SUPER_ADMIN, _account);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(SUPER_ADMIN) {}
}
