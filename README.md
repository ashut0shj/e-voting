# Blockchain E-Voting System

A decentralized voting platform built using React for the frontend and Solidity smart contracts on the Ethereum blockchain using Hardhat.

## Setup and Installation

### 1. Clone the repository
```bash
git clone https://github.com/ashut0shj/e-voting.git
cd e-voting
```

### 2. Install dependencies
Install both backend and frontend dependencies:
```bash
npm install
cd frontend && npm install && cd ..
```

## Running the Application

You will need three terminals for running the project locally.

### Terminal 1: Start Local Hardhat Blockchain
```bash
cd backend
npx hardhat node
```

This will:
- Start a local Ethereum network on http://127.0.0.1:8545
- Display 20 test accounts with private keys and 10,000 ETH each
- Keep this terminal running.

### Terminal 2: Deploy Smart Contract
```bash
cd backend
npx hardhat run scripts/deploy.js --network localhost
```

This deploys your smart contract to the local blockchain

### Terminal 3: Start React Frontend
```bash
cd frontend
npm start
```

This opens the app in your default browser at:
http://localhost:3000

## MetaMask Configuration

### 1. Install MetaMask (if not already)
Download from: https://metamask.io/

### 2. Add Hardhat Local Network
In MetaMask:
- Click Network dropdown → Add Network
- Fill the following:
```
Network Name: Hardhat
RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
```

### 3. Import a Test Account
- From Terminal 1 (npx hardhat node), copy any one private key.
- In MetaMask:
  - Click Account Icon → Import Account
  - Paste the copied private key

## First-Time Usage

### Connect Wallet
- Go to http://localhost:3000
- Click the "Connect to MetaMask" button
- MetaMask will prompt to approve the connection

### Become a Member
- Click on "Become Member"
- MetaMask will ask to sign a transaction (approve gas fees)
- You are now registered on-chain as a voter.

### Create or Participate in Votes
- To create a vote, go to the "Create Vote" tab and enter vote details
- To vote, select an option and confirm the transaction via MetaMask
- All vote data is stored and verified on the blockchain.

## Summary
- Blockchain: Local Hardhat Node
- Frontend: React (runs on localhost:3000)
- Wallet: MetaMask (connects to localhost:8545)
- Contracts: Written and deployed using Solidity via Hardhat
