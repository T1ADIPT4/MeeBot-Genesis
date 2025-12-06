
# 🏅 Badge & XP System Specification

The MeeChain Gamification Layer incentivizes user behavior through Experience Points (XP), Levels, and collectible NFT Badges (ERC-1155).

## 1. XP Sources (Experience Points)

| Action | XP / Points | Frequency | Notes |
| :--- | :---: | :--- | :--- |
| **Mining** | +1 | Every 4 Hours | Base proof-of-contribution. |
| **Streak Bonus** | +5 | Weekly | Mining consistently for 7 days. |
| **Mint MeeBot** | +50 | Per Mint | Major ecosystem contribution. |
| **Analyze Proposal** | +25 | Daily Cap | Using the AI analysis tool. |
| **Create Persona** | +75 | One-time | Creating a custom persona definition. |
| **Vote** | +10 | Per Vote | Participating in governance. |

## 2. Leveling Logic

Levels are calculated derived from total accumulated points.
`CurrentLevel = floor(TotalPoints / 10)`

*   **Level 1:** 10 Points
*   **Level 5:** 50 Points
*   **Level 10:** 100 Points
*   **Level 20:** 200 Points

## 3. Badge Tiers & Triggers

Badges are awarded automatically by the `BadgeService` when criteria are met.

### ⛏️ Mining Badges
*   **Bronze Miner:** Reach Level 1.
*   **Silver Miner:** Reach Level 5.
*   **Gold Miner:** Reach Level 10.
*   **Legend Miner:** Reach Level 20.

### 🎨 Creator Badges
*   **Genesis Creator:** Mint 1 MeeBot.
*   **MeeCrafter:** Mint 5 MeeBots.
*   **Persona Architect:** Create a custom Persona.

### 🗳️ Governance Badges
*   **Proposal Pioneer:** Create a proposal.
*   **MeeMover:** Cast 3 votes.

### 🌍 Onboarding & Chain Badges
*   **Welcome Explorer:** Connect Wallet.
*   **Testnet Explorer:** Interact on Sepolia.
*   **Mainnet Pioneer:** Interact on Fuse.
*   **Cross-chain Voyager:** Interact on BNB.

## 4. Rewards Integration
Badges are not just cosmetic; they unlock perks in the **Rewards Center**:
*   **Discounts:** Merch shop discounts (5-20%).
*   **Access:** VIP Discord roles, Early Access lists.
*   **Boosts:** Passive mining speed or yield boosts (Simulated).
