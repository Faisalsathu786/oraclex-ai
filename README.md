# OracleX AI

Decentralized AI-powered prediction market platform on the 0G ecosystem.

## Overview

OracleX AI is a production-grade prediction market platform where users can create markets, place predictions, analyze AI insights, compete on leaderboards, and earn rewards. The entire platform is powered by 0G's decentralized AI infrastructure.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    OracleX AI Platform                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐     ┌───────────────────────────┐  │
│  │     Frontend        │     │       Smart Contracts      │  │
│  │  (Next.js 15)       │     │   (Solidity + Hardhat)     │  │
│  │                     │     │                            │  │
│  │  · Home             │     │  · OracleXFactory.sol      │  │
│  │  · Explore Markets  │────▶│  · OracleXMarket.sol       │  │
│  │  · Market Detail    │     │  · OracleXTreasury.sol     │  │
│  │  · AI Analysis      │     │  · OracleXAccessManager    │  │
│  │  · Leaderboard      │     │  · UUPS Upgradeable        │  │
│  └─────────────────────┘     └───────────┬───────────────┘  │
│                                          │                  │
│  ┌─────────────────────┐     ┌───────────▼───────────────┐  │
│  │     Backend         │     │       0G Ecosystem        │  │
│  │  (Next.js API)      │     │                            │  │
│  │                     │     │  · 0G Chain (L1)           │  │
│  │  · Prisma ORM       │────▶│  · 0G Storage (SDK)        │  │
│  │  · PostgreSQL       │     │  · 0G Compute Router       │  │
│  │  · AI Routes        │     │                            │  │
│  └─────────────────────┘     └────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Smart Contracts | Solidity 0.8.24, Hardhat, OpenZeppelin Upgradeable |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL |
| AI | OpenAI / Claude API via 0G Compute Router |
| Infrastructure | 0G Chain, 0G Storage, 0G Compute |

## Smart Contract Architecture

### OracleXAccessManager
Role-based access control with SUPER_ADMIN, MODERATOR, and USER roles. Manages protocol pause, user suspension, and fee updates.

### OracleXTreasury
Fee collection and distribution. Tracks total fees collected, distributed, and manages withdrawals.

### OracleXMarket
The core market contract. Handles market lifecycle (Pending -> Open -> Locked -> Resolved), YES/NO betting pools, dynamic odds, reward claims, and refunds.

### OracleXFactory
Factory contract using minimal proxy (EIP-1167) clone pattern to deploy new market contracts. Tracks all deployed markets.

## Market Lifecycle

```
Pending ──(approve)──> Open ──(endDate)──> Locked ──(resolve)──> Resolved
   │                       │                    │                     │
   └──(reject)──> Cancelled                    └──(cancel)──> Cancelled
```

- **Pending**: Awaiting moderator approval
- **Open**: Accepting bets from users
- **Locked**: Betting closed, awaiting resolution
- **Resolved**: Outcome determined, rewards claimable
- **Cancelled**: Market cancelled, refunds issued

## AI Features

### AI Analysis Panel
Every market includes AI-generated analysis with:
- Probability estimate
- Confidence score
- Bull case analysis
- Bear case analysis
- Risk factor assessment
- Market summary

### AI Debate Mode
Two AI agents debate each prediction:
- **Bull Agent**: Argues why the event will happen
- **Bear Agent**: Argues why the event will fail
- Users can use both perspectives before placing bets

## 0G Integration

### 0G Chain
- Smart contracts deployed on 0G Mainnet (Aristotle)
- Market creation, settlement, reward distribution
- EVM-compatible, 11k TPS, sub-second finality

### 0G Storage
- AI analysis reports stored permanently
- Market metadata and images
- Historical prediction data
- Verifiable audit trail via Merkle root hashes

### 0G Compute Router
- Decentralized AI inference for predictions
- OpenAI-compatible API endpoint
- TEE-verified execution
- Models: GLM-5, DeepSeek, 0gm

## Smart Contract Addresses

| Contract | Address | Network |
|----------|---------|---------|
| OracleXAccessManager | `0xFd3F03b75C16BD7fb97C89d634AA26C484d2A7A0` | 0G Mainnet |
| OracleXTreasury | `0xe83F0A373EadE57899f07A457211dedeE85b3F4D` | 0G Mainnet |
| OracleXMarket | `0x2BFF6E6f3EC4A8E82b5a14db37A21bf176C9cbed` | 0G Mainnet |
| OracleXFactory | `0xb948466cf5c6da634C9D5ad85f6a133267aD7030` | 0G Mainnet |

## Getting Started

### Prerequisites
- Node.js >= 18
- 0G Mainnet wallet with 0G tokens
- 0G Router API key (from pc.0g.ai)

### Deploy Smart Contracts
```bash
cd contracts
npm install
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network 0g-mainnet
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_WALLET_CONNECT_ID=your_wallet_connect_id
NEXT_PUBLIC_FACTORY_ADDRESS=deployed_factory_address

# Backend
DATABASE_URL=postgresql://...
OG_ROUTER_API_KEY=sk-your-key
OG_ROUTER_BASE_URL=https://router-api.0g.ai/v1
```

## Social Features

- User profiles with reputation scores
- Follow/unfollow system
- Activity feeds
- Market comments and discussions
- Social sharing of predictions
- Achievement badges

## Reward System

| Action | XP | Reputation |
|--------|----|------------|
| Create Market | 50 | +5 |
| Place Bet | 10 | +1 |
| Win Bet | 25 | +3 |
| Correct Prediction | 100 | +10 |
| Refer User | 200 | +20 |

## Ranks

- Bronze (0 XP)
- Silver (1,000 XP)
- Gold (5,000 XP)
- Platinum (20,000 XP)
- Diamond (50,000 XP)
- Master (100,000 XP)

## Badges

- Early Predictor
- Top Analyst
- Whale Trader
- Market Creator
- AI Expert
- Streak Master
- Community Champion

## License

MIT

## Links

- Website: TBD
- GitHub: https://github.com/Faisalsathu786/oraclex-ai
- 0G Website: https://0g.ai
- 0G Builder Hub: https://build.0g.ai
