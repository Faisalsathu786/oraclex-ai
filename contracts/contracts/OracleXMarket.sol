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

    struct Outcome {
        string name;
        uint256 pool;
    }

    struct MarketData {
        uint256 id;
        string title;
        string description;
        string category;
        string imageUrl;
        string resolutionSource;
        address creator;
        MarketState state;
        uint256 endDate;
        uint256 createdAt;
        uint256 outcomeCount;
        uint256 totalVolume;
        uint256 participantCount;
        uint256 winningOutcome;
        bool resolved;
        uint256 protocolFee;
        uint256 totalPoints;
    }

    struct Bet {
        address user;
        uint256 outcomeIndex;
        uint256 amount;
        uint256 claimedAt;
    }

    MarketData public market;
    uint256 public marketId;
    bool public initialized;

    Outcome[] public outcomes;
    mapping(address => Bet) public bets;
    mapping(address => bool) public hasBet;
    address[] public participants;
    mapping(address => uint256) public userPoints;

    event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 outcomeCount);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 outcomeIndex, uint256 amount);
    event BetSold(uint256 indexed marketId, address indexed user, uint256 amount, uint256 fee);
    event MarketLocked(uint256 indexed marketId);
    event MarketResolved(uint256 indexed marketId, uint256 winningOutcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event MarketCancelled(uint256 indexed marketId);
    event PointsAwarded(address indexed user, uint256 points);

    modifier onlyModerator() {
        require(
            accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender),
            "Not authorized"
        );
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
        string calldata _imageUrl,
        string[] calldata _outcomeNames,
        string calldata _resolutionSource,
        uint256 _endDate,
        uint256 _protocolFee
    ) external initializer {
        require(!initialized, "Already initialized");
        require(_outcomeNames.length >= 2 && _outcomeNames.length <= 15, "2-15 outcomes required");
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
            imageUrl: _imageUrl,
            resolutionSource: _resolutionSource,
            creator: _creator,
            state: MarketState.Pending,
            endDate: _endDate,
            createdAt: block.timestamp,
            outcomeCount: _outcomeNames.length,
            totalVolume: 0,
            participantCount: 0,
            winningOutcome: 999,
            resolved: false,
            protocolFee: _protocolFee,
            totalPoints: 0
        });

        for (uint256 i = 0; i < _outcomeNames.length; i++) {
            outcomes.push(Outcome({ name: _outcomeNames[i], pool: 0 }));
        }

        emit MarketCreated(_marketId, _creator, _title, _outcomeNames.length);
    }

    function approveMarket() external onlyModerator {
        require(market.state == MarketState.Pending, "Not pending");
        require(!accessManager.paused(), "Protocol paused");
        market.state = MarketState.Open;
    }

    function rejectMarket() external onlyModerator {
        require(market.state == MarketState.Pending, "Not pending");
        market.state = MarketState.Cancelled;
        emit MarketCancelled(marketId);
    }

    function placeBet(uint256 _outcomeIndex) external payable nonReentrant {
        require(market.state == MarketState.Open, "Market not open");
        require(_outcomeIndex < market.outcomeCount, "Invalid outcome");
        require(block.timestamp < market.endDate, "Betting ended");
        require(!accessManager.suspendedUsers(msg.sender), "User suspended");
        require(msg.value > 0, "Amount must be > 0");

        if (hasBet[msg.sender]) {
            // Add to existing bet
            Bet storage existing = bets[msg.sender];
            require(existing.outcomeIndex == _outcomeIndex, "Already bet on different outcome");
            existing.amount += msg.value;
        } else {
            bets[msg.sender] = Bet({
                user: msg.sender,
                outcomeIndex: _outcomeIndex,
                amount: msg.value,
                claimedAt: 0
            });
            hasBet[msg.sender] = true;
            participants.push(msg.sender);
            market.participantCount = participants.length;
        }

        outcomes[_outcomeIndex].pool += msg.value;
        market.totalVolume += msg.value;

        // Points: 1 point per $10 volume
        _awardPoints(msg.sender, msg.value);

        emit BetPlaced(marketId, msg.sender, _outcomeIndex, msg.value);
    }

    function sellShares() external nonReentrant {
        require(market.state == MarketState.Open, "Market not open");
        require(hasBet[msg.sender], "No shares to sell");
        require(bets[msg.sender].claimedAt == 0, "Already sold");

        Bet storage userBet = bets[msg.sender];
        uint256 sellPool = outcomes[userBet.outcomeIndex].pool;
        require(sellPool > 0, "Empty pool");
        require(userBet.amount <= sellPool, "Amount exceeds pool");

        // Calculate total pool across all outcomes
        uint256 totalPool = 0;
        for (uint256 i = 0; i < market.outcomeCount; i++) {
            totalPool += outcomes[i].pool;
        }

        // Share value = (bet amount / outcome pool) * total pool
        uint256 shareValue = (userBet.amount * totalPool) / sellPool;
        uint256 sellFee = (shareValue * market.protocolFee) / 10000;
        uint256 payout = shareValue - sellFee;

        userBet.claimedAt = block.timestamp;
        outcomes[userBet.outcomeIndex].pool -= userBet.amount;

        if (sellFee > 0 && treasury != address(0)) {
            (bool feeSent, ) = payable(treasury).call{value: sellFee}("");
            require(feeSent, "Fee transfer failed");
        }

        if (payout > 0) {
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Sell transfer failed");
        }

        emit BetSold(marketId, msg.sender, userBet.amount, sellFee);
    }

    function lockMarket() external {
        require(block.timestamp >= market.endDate, "Market still active");
        require(market.state == MarketState.Open, "Not open");
        market.state = MarketState.Locked;
        emit MarketLocked(marketId);
    }

    function resolveMarket(uint256 _winningOutcome) external onlyModerator {
        require(_winningOutcome < market.outcomeCount, "Invalid outcome");
        require(market.state == MarketState.Locked || market.state == MarketState.Open, "Invalid state");

        market.state = MarketState.Resolved;
        market.winningOutcome = _winningOutcome;
        market.resolved = true;

        // Transfer loser pools to winner pool
        uint256 winnerPool = outcomes[_winningOutcome].pool;
        for (uint256 i = 0; i < market.outcomeCount; i++) {
            if (i != _winningOutcome) {
                winnerPool += outcomes[i].pool;
                outcomes[i].pool = 0;
            }
        }
        outcomes[_winningOutcome].pool = winnerPool;

        emit MarketResolved(marketId, _winningOutcome);
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
        require(userBet.outcomeIndex == market.winningOutcome, "Not a winning bet");
        userBet.claimedAt = block.timestamp;

        uint256 totalPool = outcomes[market.winningOutcome].pool;
        uint256 winnerPoolBefore = totalPool - _getLoserPoolTotal();
        uint256 fee = (totalPool * market.protocolFee) / 10000;
        uint256 prizePool = totalPool - fee;

        uint256 reward = (userBet.amount * prizePool) / winnerPoolBefore;

        if (fee > 0 && treasury != address(0)) {
            (bool feeSent, ) = payable(treasury).call{value: fee}("");
            require(feeSent, "Fee transfer failed");
        }

        if (reward > 0) {
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Reward transfer failed");
        }

        emit RewardClaimed(marketId, msg.sender, reward);
    }

    function _getLoserPoolTotal() internal view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < market.outcomeCount; i++) {
            if (i != market.winningOutcome) {
                total += outcomes[i].pool;
            }
        }
        return total;
    }

    function refundIfCancelled() external nonReentrant {
        require(market.state == MarketState.Cancelled, "Not cancelled");
        require(hasBet[msg.sender], "No bet");
        require(bets[msg.sender].claimedAt == 0, "Already claimed");

        Bet storage userBet = bets[msg.sender];
        userBet.claimedAt = block.timestamp;

        (bool success, ) = payable(msg.sender).call{value: userBet.amount}("");
        require(success, "Refund failed");
    }

    function _awardPoints(address _user, uint256 _volumeWei) internal {
        uint256 volumeUsd = _volumeWei / 1e18; // Assuming 1 token = $1
        uint256 points = volumeUsd / 10; // 1 point per $10 volume
        if (points > 0) {
            userPoints[_user] += points;
            market.totalPoints += points;
            emit PointsAwarded(_user, points);
        }
    }

    function getOutcomes() external view returns (Outcome[] memory) {
        return outcomes;
    }

    function getOutcomeCount() external view returns (uint256) {
        return outcomes.length;
    }

    function getOutcome(uint256 index) external view returns (string memory name, uint256 pool) {
        require(index < outcomes.length, "Invalid index");
        return (outcomes[index].name, outcomes[index].pool);
    }

    function getMarketStats() external view returns (
        uint256[] memory pools,
        uint256 totalVolume,
        uint256 participantCount,
        MarketState state,
        uint256 endDate
    ) {
        pools = new uint256[](outcomes.length);
        for (uint256 i = 0; i < outcomes.length; i++) {
            pools[i] = outcomes[i].pool;
        }
        return (pools, market.totalVolume, market.participantCount, market.state, market.endDate);
    }

    function getUserPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyModerator {}
}
