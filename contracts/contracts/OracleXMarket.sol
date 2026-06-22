// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./OracleXAccessManager.sol";

interface IAccessManager2 {
    function isModerator(address) external view returns (bool);
    function isSuperAdmin(address) external view returns (bool);
    function suspendedUsers(address) external view returns (bool);
    function paused() external view returns (bool);
    function protocolFee() external view returns (uint256);
}

contract OracleXMarket {
    IAccessManager2 public accessManager;
    address public treasury;


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
        address creator;
        uint256 state;
        uint256 endDate;
        uint256 createdAt;
        uint256 totalVolume;
        uint256 participantCount;
        uint256 winningOutcome;
        bool resolved;
    }

    struct Bet {
        address user;
        uint256 outcomeIndex;
        uint256 amount;
        uint256 claimedAt;
    }

    MarketData public market;
    Outcome[] public outcomes;
    mapping(address => Bet) public bets;
    mapping(address => bool) public hasBet;
    address[] public participants;
    mapping(address => uint256) public userPoints;

    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 outcome, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint256 winningOutcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    modifier onlyModerator() {
        require(accessManager.isModerator(msg.sender) || accessManager.isSuperAdmin(msg.sender), "Not authorized");
        _;
    }

    constructor() {
        // Implementation address, not a real market
    }

    function init(
        uint256 _marketId,
        address _accessManager,
        address _treasury,
        address _creator,
        string calldata _title,
        string calldata _desc,
        string calldata _category,
        string calldata _imageUrl,
        string[] calldata _outcomeNames,
        uint256 _endDate
    ) external {
        require(outcomes.length == 0, "Already initialized");
        require(_outcomeNames.length >= 2 && _outcomeNames.length <= 15, "2-15 outcomes");

        accessManager = IAccessManager2(_accessManager);
        treasury = _treasury;

        market.id = _marketId;
        market.title = _title;
        market.description = _desc;
        market.category = _category;
        market.imageUrl = _imageUrl;
        market.creator = _creator;
        market.state = 0;
        market.endDate = _endDate;
        market.createdAt = block.timestamp;

        for (uint256 i = 0; i < _outcomeNames.length; i++) {
            outcomes.push(Outcome(_outcomeNames[i], 0));
        }
    }

    function approveMarket() external onlyModerator {
        require(market.state == 0, "Not pending");
        market.state = 1;
    }

    function rejectMarket() external onlyModerator {
        require(market.state == 0, "Not pending");
        market.state = 4;
    }

    function placeBet(uint256 _outcomeIndex) external payable {
        require(market.state == 1, "Not open");
        require(_outcomeIndex < outcomes.length, "Invalid outcome");
        require(block.timestamp < market.endDate, "Betting ended");
        require(!accessManager.suspendedUsers(msg.sender), "Suspended");
        require(msg.value > 0, "Amount > 0");

        if (hasBet[msg.sender]) {
            Bet storage existing = bets[msg.sender];
            require(existing.outcomeIndex == _outcomeIndex, "Different outcome");
            existing.amount += msg.value;
        } else {
            bets[msg.sender] = Bet(msg.sender, _outcomeIndex, msg.value, 0);
            hasBet[msg.sender] = true;
            participants.push(msg.sender);
            market.participantCount = participants.length;
        }

        outcomes[_outcomeIndex].pool += msg.value;
        market.totalVolume += msg.value;

        uint256 points = msg.value / 1e18 / 10;
        if (points > 0) userPoints[msg.sender] += points;

        emit BetPlaced(market.id, msg.sender, _outcomeIndex, msg.value);
    }

    function resolveMarket(uint256 _winningOutcome) external onlyModerator {
        require(_winningOutcome < outcomes.length, "Invalid outcome");
        require(market.state == 2 || market.state == 1, "Invalid state");

        market.state = 3;
        market.winningOutcome = _winningOutcome;
        market.resolved = true;

        uint256 winnerPool = outcomes[_winningOutcome].pool;
        for (uint256 i = 0; i < outcomes.length; i++) {
            if (i != _winningOutcome) {
                winnerPool += outcomes[i].pool;
                outcomes[i].pool = 0;
            }
        }
        outcomes[_winningOutcome].pool = winnerPool;

        emit MarketResolved(market.id, _winningOutcome);
    }

    function claimReward() external {
        require(market.state == 3, "Not resolved");
        require(hasBet[msg.sender], "No bet");
        require(bets[msg.sender].claimedAt == 0, "Already claimed");

        Bet storage userBet = bets[msg.sender];
        require(userBet.outcomeIndex == market.winningOutcome, "Not winner");
        userBet.claimedAt = block.timestamp;

        uint256 feePct = accessManager.protocolFee();
        uint256 totalPool = outcomes[market.winningOutcome].pool;
        uint256 fee = (totalPool * feePct) / 10000;
        uint256 prizePool = totalPool - fee;

        uint256 reward = (userBet.amount * prizePool) / (totalPool - fee);

        if (fee > 0 && treasury != address(0)) {
            (bool fs, ) = payable(treasury).call{value: fee}("");
            require(fs, "Fee failed");
        }

        if (reward > 0) {
            (bool s, ) = payable(msg.sender).call{value: reward}("");
            require(s, "Reward failed");
        }

        emit RewardClaimed(market.id, msg.sender, reward);
    }

    function getOutcomes() external view returns (Outcome[] memory) {
        return outcomes;
    }
}
