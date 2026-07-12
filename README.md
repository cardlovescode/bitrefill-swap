# Bitrefill Swap

Swap any token on Base for Bitrefill gift cards.

## Setup

```bash
pnpm install
cp .env.example .env.local
# Add your API keys to .env.local
pnpm dev
```

## Environment Variables

- `NEXT_PUBLIC_REOWN_PROJECT_ID` - Reown AppKit project ID
- `NEXT_PUBLIC_BITREFILL_API_KEY` - Bitrefill API key
- `NEXT_PUBLIC_UNISWAP_API_KEY` - Uniswap Trading API key
