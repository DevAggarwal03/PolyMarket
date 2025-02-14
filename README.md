# PredictX - AI-Powered Crypto Prediction Markets
A crypto-focused prediction market on Sei blockchain. Predict "Yes" or "No" on key questions & access AI-powered forecasts using LSTM on past 60 days' data. Trade smarter with blockchain & AI!

## Overview
PredictX is a cutting-edge prediction market platform focused exclusively on cryptocurrency outcomes. Powered by AI agents, it provides users with sophisticated analysis and probability assessments using LSTM for crypto-related predictions, enabling informed betting decisions in the digital asset space.

## Features
- 🎯 Real-time cryptocurrency prediction markets
- 🤖 AI-powered market analysis and probability calculations
- 📊 Interactive betting dashboard
- 💰 Automated bet settlement system
- 📈 Historical prediction accuracy tracking
- 🔒 Secure wallet integration
- 🧠 Multiple AI agents analyzing market conditions
- ⚡ Real-time crypto price feeds

## Tech Stack
- Frontend: React + TypeScript
- Build Tool: Vite
- Styling: TailwindCSS
- AI Integration: LSTM (Large Short Term Model)
- Crypto Data: CoinGecko API
- Web3: Hardhat

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python or pip
- Ethereum wallet (MetaMask recommended)

### Installation
1. Clone the repository
```bash
git clone https://github.com/DevAggarwal03/predicitonMarket
cd predicitonMarket
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Start the model
```bash
pip install -r requirements.txt
python main.py
```

## Project Structure
```
Backend/
├── main.py         #Python AI file
├── requirements.txt
Blockchain/
├── contracts       #contains Prediction Market Contract
├── ignition        #Deploy Script
├── test            
src/
├── assets/         #Images
├── components/     # Reusable UI components
├── pages/         # Page components
├── utils/         # Helper functions and utilities
    ├── contractDetails.tsx     
    ├── chainConfig.tsx
    ├── walletProvider.tsx
├── mian.ts
├── app.ts
index.html
Readme.md
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Smart Contracts
Our prediction market smart contracts are deployed on:
- Sei Testnet: `0x89ebF2A7546eBD9407fb878821689f56612b4EFd`

## Links
- Project Link: [https://github.com/yourusername/predictx](https://github.com/yourusername/predictx)
- Video Link: [https://youtu.be/37RwFLxlkpM](https://youtu.be/37RwFLxlkpM)
- Github Link: [https://github.com/DevAggarwal03/predicitonMarket](https://github.com/DevAggarwal03/predicitonMarket)

## Resources
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [CoinGecko](https://coingecko.com/)
- [ethers.js](https://docs.ethers.org/)
- [Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started)