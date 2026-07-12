# Bitrefill Swap

A web application that allows users to swap any cryptocurrency for Bitrefill gift cards on the Base network. Connect your wallet, select a token, choose a gift card amount, and receive your redemption code in seconds.

## Features

- **Multi-token Support**: Swap ETH, USDC, DAI, or any ERC-20 token on Base
- **Direct USDC Payments**: Skip the swap step when paying with USDC
- **Real-time Quotes**: Get live swap quotes from Uniswap Trading API
- **Wallet Integration**: Connect with any wallet via Reown AppKit
- **Progress Tracking**: Visual step-by-step transaction progress
- **Instant Redemption**: Receive gift card codes immediately after payment confirmation

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Web3**: wagmi, viem, Reown AppKit
- **State**: Zustand
- **Data Fetching**: TanStack React Query
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cardlovescode/bitrefill-swap.git
   cd bitrefill-swap
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your API keys to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   BITREFILL_API_KEY=your_bitrefill_api_key
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/bitrefill/     # Bitrefill API proxy routes
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── SwapCard.tsx      # Main swap interface
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configuration
├── services/              # API service layers
├── store/                 # Zustand state stores
└── types/                 # TypeScript type definitions
```

## How It Works

1. **Connect Wallet**: User connects their wallet via Reown AppKit
2. **Select Token**: Choose which token to swap (ETH, USDC, etc.)
3. **Choose Amount**: Pick a gift card denomination
4. **Get Quote**: Real-time quote from Uniswap Trading API
5. **Execute Swap**: Approve token, swap to USDC, send payment
6. **Receive Code**: Gift card redemption code displayed on success

## License

MIT
