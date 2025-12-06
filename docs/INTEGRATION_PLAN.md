
# 🎯 Contributor Integration Plan

This document serves as a technical guide for developers integrating new features into MeeChain.

## 1. Web3Context Integration strategy

All blockchain interactions must consume `Web3Context`.

**Do not** use `window.ethereum` directly in components. Use the hook:
```typescript
import { useWeb3 } from '../contexts/Web3Context';

const MyComponent = () => {
  const { provider, signer, account, switchChain } = useWeb3();
  
  const handleAction = async () => {
     if (!account) return;
     // ... logic
  }
}
```

**Scope of Use:**
*   **Mining:** Verifying wallet signature for PoC.
*   **Genesis:** Signing the "Mint" transaction.
*   **Governance:** Signing "Vote" messages.
*   **DeFi:** Executing Swap/Approve transactions.

## 2. Firebase & Backend Architecture

We use a "Dual-State" architecture:
1.  **On-Chain (Source of Truth):** Ownership, Balances, Badge IDs.
2.  **Firebase (Indexing & Speed):** Leaderboards, Activity Feeds, User Metadata.

### Configuration
*   **File:** `services/firebase.ts`
*   **Setup:** Users/Devs must provide keys in the **Settings Page**.
*   **Simulation Mode:** If keys are missing, the app falls back to local mock data automatically.

### Functions (Server-Side)
*   Located in `functions/`.
*   **`mine`**: Cloud Function to validate mining requests securely (prevents client-side cheat).
*   **`generateImage`**: Proxies requests to Gemini/Imagen (protects API Key).

## 3. Component Hierarchy

```text
App.tsx
 ├── Web3Provider (Wallet State)
 ├── LanguageProvider (i18n)
 ├── SettingsProvider (Config)
 ├── PersonaProvider (Persona State)
 └── MeeBotProvider (Game State: Mining, Badges, Inventory)
      ├── SplashScreen
      └── AppLayout
           ├── Sidebar
           ├── Header
           └── PageRouter (Dashboard, Mining, Genesis...)
```

## 4. Adding a New Feature
1.  **Define Types:** Add interfaces to `types.ts`.
2.  **Update Context:** Add state/functions to `MeeBotContext.tsx` if it affects global game state.
3.  **Create Page:** Build `components/pages/NewFeaturePage.tsx`.
4.  **Add Route:** Update `App.tsx` router and `Sidebar.tsx` navigation.
5.  **Add Translation:** Update `LanguageContext.tsx` (En/Th).
