// Minimal ABIs for read/write operations
// Full ABIs would be imported from compiled artifacts

export const FACTORY_ABI = [
  'function createMarket(string _title, string _desc, string _category, string _imageUrl, string[] _outcomeNames, uint256 _endDate) returns (address)',
  'function getMarket(uint256 _id) view returns (address)',
  'function marketCount() view returns (uint256)',
  'function allMarkets(uint256) view returns (address)',
  'event MarketDeployed(uint256 indexed marketId, address indexed market, address indexed creator, string title)',
]

export const ACCESS_MANAGER_ABI = [
  'function addModerator(address) external',
  'function removeModerator(address) external',
  'function isModerator(address) view returns (bool)',
  'function isSuperAdmin(address) view returns (bool)',
  'function protocolFee() view returns (uint256)',
  'function suspendUser(address, bool) external',
  'function paused() view returns (bool)',
  'function pause(bool) external',
  'function updateFee(uint256) external',
]

export const MARKET_ABI = [
  'function approveMarket() external',
  'function rejectMarket() external',
  'function placeBet(uint256 outcomeIndex) payable',
  'function resolveMarket(uint256 winningOutcome) external',
  'function claimReward() external',
  'function getOutcomes() view returns (tuple(string name, uint256 pool)[])',
  'function market() view returns (uint256 id, string title, string description, string category, string imageUrl, address creator, uint256 state, uint256 endDate, uint256 createdAt, uint256 totalVolume, uint256 participantCount, uint256 winningOutcome, bool resolved)',
  'function hasBet(address) view returns (bool)',
  'function bets(address) view returns (address user, uint256 outcomeIndex, uint256 amount, uint256 claimedAt)',
]

export const TREASURY_ABI = [
  'function collectFee(address market, uint256 amount) returns (bool)',
  'function processWithdrawal(address recipient, uint256 amount) external',
  'function getStats() view returns (uint256, uint256, uint256)',
]
