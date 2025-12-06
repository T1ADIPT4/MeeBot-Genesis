
# reCAPTCHA Navigation Flowchart

This document outlines the primary user journeys within the MeeChain application, from initial onboarding to deep ecosystem interaction.

```mermaid
graph TD
    A[Splash Screen] -->|Load Assets| B[Connect Wallet]
    B -->|Success| C[Mining Rig (Home)]
    
    subgraph "Core Loop (Gamification)"
    C -->|Action: Mine| C1[Earn XP & Coins]
    C -->|View| C2[Check Level & Leaderboard]
    C1 -->|Milestone| C3[Unlock Badges]
    end

    subgraph "Creation & Identity"
    C -->|Nav| D[Genesis Ritual]
    D -->|Define| D1[Persona & Style]
    D1 -->|Visualize| D2[AI Generation]
    D2 -->|Action: Mint| D3[MeeBot NFT]
    D3 -->|Storage| E[Hall of Origins]
    end

    subgraph "Ecosystem Interaction"
    C -->|Nav| F[Missions]
    C -->|Nav| G[Governance Hub]
    C -->|Nav| H[DeFi Station]
    
    F -->|Complete Tasks| C1
    G -->|Action: Vote| C1
    H -->|Action: Swap/Bridge| C1
    end

    subgraph "Utility & Rewards"
    C3 -->|Access| I[Rewards Center]
    I -->|Redeem| I1[Perks & Benefits]
    D3 -->|Use| J[Chat with MeeBot]
    D3 -->|Action| K[Gifting / Migration]
    end
```

## 🗺️ Journey Breakdown

### 1. Onboarding
1.  **Splash:** App initializes, loads config.
2.  **Connect:** User connects Web3 Wallet (Metamask).
3.  **Home:** User lands on **Mining Rig**.
    *   *First Time:* "Welcome Explorer" Badge unlocks.

### 2. The Mining Loop
*   **Primary Action:** Click "Start Mining" (4-hour cooldown).
*   **Reward:** Earn Points (XP) + MeeCoins.
*   **Progression:** Level Up -> Evolve Miner Badge (Bronze -> Silver -> Gold).

### 3. Expansion
*   **Genesis:** User spends resources/gas to mint a new MeeBot Companion.
*   **Governance:** User participates in DAO proposals to earn "MeeMover" badges.
*   **DeFi:** User bridges assets or provides liquidity.

### 4. Utility
*   **Chat:** User converses with their specific MeeBot (Persona-aware).
*   **Redemption:** User spends Mining Coins to buy perks.
*   **Migration:** User moves their MeeBot to other chains (Sepolia/Fuse).
