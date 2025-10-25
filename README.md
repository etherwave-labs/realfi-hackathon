# RealFi - EventChain

**Etherwave Labs's contribution to Funding the Commons's hackathon: RealFi**

A decentralized event management platform that incentivizes attendance through USDC deposits and smart contract-based redistribution.

>[!NOTE]
>This project **won the first place with a $5000 cash prize in the Secure Onboarding to RealFi track** sponsored by [human.tech](https://human.tech)!
> Check the full hackathon results [here](https://discord.com/channels/1255586641536487494/1420809142007758858/1429930886354178079)

## 🎯 Overview

RealFi is a blockchain-powered event platform that solves the no-show problem by:
- Requiring USDC deposits for event registration
- Redistributing absent participants' funds to attendees as rewards
- Ensuring organizers receive guaranteed payments
- Providing transparent, trustless escrow via smart contracts

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- MetaMask or Human Wallet browser extension

### Installation

1. Clone the repository:
```bash
git clone https://github.com/etherwave-labs/realfi-hackathon.git
cd realfi-hackathon
```

2. Navigate to the app directory and install dependencies:
```bash
cd app
yarn install
```

3. Create a `.env.local` file in the `app` directory and put:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Start the development server:
```bash
yarn dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## 🏗️ Project Structure

```
realfi-hackathon/
├── app/                    # Next.js frontend application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions and stores
│   └── hooks/            # Custom React hooks
├── smart-contract/        # Solidity smart contracts
│   └── escrow.sol        # EventEscrow contract
└── README.md
```

## 💰 Smart Contract

The EventEscrow smart contract is deployed on **Ethereum Sepolia Testnet**.

**Contract Address:** `0x286Ff160BB78e7D897eD137D5767FA123cFc7b8b`

**USDC Token (Sepolia):** `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### Get Test USDC
Visit the [Circle USDC Faucet](https://faucet.circle.com/) to get test USDC on Sepolia.

## ✨ Features

- **Event Creation**: Organizers can create paid or free events
- **USDC Payments**: All payments handled in USDC stablecoin
- **Smart Escrow**: Funds locked in smart contract until event ends
- **Attendance Verification**: QR code-based check-in system
- **Automatic Redistribution**: Absent participants' deposits redistributed to attendees
- **Organizer Dashboard**: Comprehensive event management interface
- **Human Wallet Integration**: Seamless wallet experience

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Blockchain**: Ethereum (Sepolia), Solidity ^0.8.30
- **Web3**: ethers.js, Human Wallet SDK
- **State Management**: Zustand
- **Payments**: USDC (ERC-20)

## 📝 How It Works

1. **Organizer Creates Event**
   - Sets ticket price in USDC
   - Defines redistribution percentage (0-100%)
   - Event details stored on-chain

2. **Participants Register**
   - Approve USDC spending
   - Purchase ticket (USDC locked in escrow)
   - Receive QR code for check-in

3. **Event Day**
   - Organizer scans QR codes to mark attendance
   - Attendance recorded on blockchain

4. **After Event**
   - Organizer finalizes event
   - Funds redistributed automatically:
     - Attendees receive their deposit + bonus (from no-shows)
     - Organizer receives remaining funds

## 🔐 Security

- Smart contract uses OpenZeppelin-style security patterns
- All funds held in trustless escrow
- No single point of failure
- MIT Licensed open-source code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Etherwave Labs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues, please file them in the [Issues](https://github.com/yourusername/realfi-hackathon/issues) section.

## 🌟 Acknowledgments

- Built for the Funding the Commons RealFi Hackathon
- Powered by Ethereum and USDC
- Human Wallet integration

---
