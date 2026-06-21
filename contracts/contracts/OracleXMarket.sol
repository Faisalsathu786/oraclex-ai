// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./OracleXAccessManager.sol";

contract OracleXMarket is Initializable, UUPSUpgradeable, ReentrancyGuardUpgradeable {
    OracleXAccessManager public accessManager;
    address public factory;
    address public treasury;

    enum MarketState { Pending, Open, Locked, Resolved, Cancelled, Paused }

    struct MarketData {
        uint256 id;
        string title;
        string description;
        string category;
        string resolutionSource;
        address creator;
        MarketState state;
        uint256 endDate;
        uint256 createdAt;
        uint256 yesPool;
        uint256 noPool;
        uint256 totalVolume;
        uint256 participantCount;
        bool outcomeYes;
        bool resolved;
        uint256 protocolFee;
    }

    struct Bet {
        address user;
        bool outcome; // true = YES, false = NO
        uint256 amount;
        uint256 claimedAt;
    }

    MarketData public market;
    uint256 public marketId;
    bool public initialized;

    mapping(address => Bet) public bets;
    mapping(address => bool) public hasBet;
    address[] public participants;

    event MarketCreated(uint256 indexed marketId, address indexed creator, string title);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool outcome, uint256 amount);
    event MarketLocked(uint256 indexed marketId);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event MarketCancelled(uint256 indexed marketId);

    modifier onlyModerator() {
        require(
            accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender),
            "Not authorized"
        );
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == market.creator, "Not market creator");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 _marketId,
        address _accessManager,
        address _treasury,
        address _creator,
        string calldata _title,
        string calldata _description,
        string calldata _category,
        string calldata _resolutionSource,
        uint256 _endDate,
        uint256 _protocolFee
    ) external initializer {
        require(!initialized, "Already initialized");
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        factory = msg.sender;
        accessManager = OracleXAccessManager(_accessManager);
        treasury = _treasury;
        marketId = _marketId;
        initialized = true;

        market = MarketData({
            id: _marketId,
            title: _title,
            description: _description,
            category: _category,
            resolutionSource: _resolutionSource,
            creator: _creator,
            state: MarketState.Pending,
            endDate: _endDate,
            createdAt: block.timestamp,
            yesPool: 0,
            noPool: 0,
            totalVolume: 0,
            participantCount: 0,
            outcomeYes: false,
            resolved: false,
            protocolFee: _protocolFee
        });

        emit MarketCreated(_marketId, _creator, _title);
    }

    function approveMarket() external onlyModerator {
        require(market.state == MarketState.Pending, "Not pending");
        require(!accessManager.paused(), "Protocol paused");
        market.state = MarketState.Open;
    }

    function rejectMarket(string calldata reason) external onlyModerator {
        require(market.state == MarketState.Pending, "Not pending");
        market.state = MarketState.Cancelled;
        emit MarketCancelled(marketId);
    }

    function placeBet(bool _outcome) external payable nonReentrant {
        require(market.state == MarketState.Open, "Market not open");
        require(block.timestamp < market.endDate, "Betting ended");
        require(!accessManager.suspendedUsers(msg.sender), "User suspended");
        require(!hasBet[msg.sender], "Already bet");
        require(msg.value > 0, "Amount must be > 0");

        bets[msg.sender] = Bet({
            user: msg.sender,
            outcome: _outcome,
            amount: msg.value,
            claimedAt: 0
        });

        hasBet[msg.sender] = true;
        participants.push(msg.sender);

        if (_outcome) {
            market.yesPool += msg.value;
        } else {
            market.noPool += msg.value;
        }

        market.totalVolume += msg.value;
        market.participantCount = participants.length;

        emit BetPlaced(marketId, msg.sender, _outcome, msg.value);
    }

    function lockMarket() external {
        require(block.timestamp >= market.endDate, "Market still active");
        require(market.state == MarketState.Open, "Not open");
        market.state = MarketState.Locked;
        emit MarketLocked(marketId);
    }

    function resolveMarket(bool _outcome) external onlyModerator {
        require(market.state == MarketState.Locked || market.state == MarketState.Open, "Invalid state");

        market.state = MarketState.Resolved;
        market.outcomeYes = _outcome;
        market.resolved = true;

        emit MarketResolved(marketId, _outcome);
    }

    function emergencyCancel() external onlyModerator {
        require(market.state != MarketState.Resolved, "Already resolved");
        market.state = MarketState.Cancelled;
        emit MarketCancelled(marketId);
    }

    function claimReward() external nonReentrant {
        require(market.state == MarketState.Resolved, "Not resolved");
        require(hasBet[msg.sender], "No bet placed");
        require(bets[msg.sender].claimedAt == 0, "Already claimed");

        Bet storage userBet = bets[msg.sender];
        userBet.claimedAt = block.timestamp;

        uint256 reward = 0;
        bool userWon = (userBet.outcome == market.outcomeYes);

        if (userWon) {
            uint256 winnerPool = market.outcomeYes ? market.yesPool : market.noPool;
            uint256 loserPool = market.outcomeYes ? market.noPool : market.yesPool;
            uint256 totalPrize = winnerPool + loserPool;
            uint256 fee = (totalPrize * market.protocolFee) / 10000;
            uint256 prizePool = totalPrize - fee;

            reward = (userBet.amount * prizePool) / winnerPool;

            if (fee > 0 && treasury != address(0)) {
                (bool feeSent, ) = payable(treasury).call{value: fee}("");
                require(feeSent, "Fee transfer failed");
            }
        } else {
            // Losers get nothing (their funds go to winners)
            reward = 0;
        }

        if (reward > 0) {
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Reward transfer failed");
        }

        emit RewardClaimed(marketId, msg.sender, reward);
    }

    function refundIfCancelled() external nonReentrant {
        require(market.state == MarketState.Cancelled, "Not cancelled");
        require(hasBet[msg.sender], "No bet");
        require(bets[msg.sender].claimedAt == 0, "Already claimed");

        Bet storage userBet = bets[msg.sender];
        userBet.claimedAt = block.timestamp;
        uint256 refundAmount = userBet.amount;

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund failed");
    }

    function getMarketStats() external view returns (
        uint256 yesPool,
        uint256 noPool,
        uint256 totalLiquidity,
        uint256 currentProbability,
        uint256 volume,
        uint256 participantCount,
        MarketState state,
        uint256 endDate
    ) {
        uint256 total = market.yesPool + market.noPool;
        uint256 prob = total > 0 ? (market.yesPool * 100) / total : 50;

        return (
            market.yesPool,
            market.noPool,
            total,
            prob,
            market.totalVolume,
            market.participantCount,
            market.state,
            market.endDate
        );
    }

    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyModerator {}
}
