# ShipOrShame 🚀

**Commit. Stake. Ship. Or Lose.**

A high-stakes productivity dApp built for the Monad Testnet.

---

## 🛠 Deployment Instructions

### 1. Smart Contract Deployment
1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a new file named `ShipOrShame.sol` and paste the code from `/contracts/ShipOrShame.sol`.
3. Compile using Solidity compiler version `0.8.20` or higher.
4. In the "Deploy & Run Transactions" tab:
   - Environment: **Injected Provider - MetaMask**.
   - Ensure your MetaMask is connected to **Monad Testnet**.
   - Click **Deploy**.
5. Copy the deployed contract address.

### 2. Frontend Configuration
1. Open `/src/utils/contract.ts`.
2. Replace the `CONTRACT_ADDRESS` placeholder with your actual deployed address:
   ```typescript
   export const CONTRACT_ADDRESS = "0xYourDeployedAddressHere";
   ```
3. The ABI is already provided in `/src/abi.json`. If you modified the contract, update this file with the new ABI from Remix.

### 3. Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and connect your MetaMask wallet.

---

## 🔗 Network Details (Monad Testnet)
- **Network Name:** Monad Testnet
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Chain ID:** `10143` (0x279f)
- **Currency Symbol:** MON
- **Block Explorer:** `https://testnet.monadexplorer.com`

---

## 🧠 Core Features
- **Public Commitments:** Stake MON tokens on your goals.
- **Proof of Shipment:** Creators can mark tasks as shipped before the deadline to reclaim their stake.
- **Permissionless Failure:** If a deadline is missed, anyone can trigger the failure, moving the stake to the global reward pool.
- **Leaderboard:** Track the most consistent shippers on the network.
- **Cyberpunk UI:** Premium dark-mode aesthetic with glassmorphism and neon accents.
