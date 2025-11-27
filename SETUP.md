# Quick Setup Guide

## Prerequisites
- Node.js 20+ installed
- pnpm package manager
- Kite Connect API account

## Setup Steps

### 1. Clone and Install
```bash
cd kite-connect-trader
pnpm install
```

### 2. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
# Get credentials from: https://developers.kite.trade/
KITE_API_KEY=your_actual_api_key
KITE_ACCESS_TOKEN=your_actual_access_token
```

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Getting Kite Connect Credentials

1. Sign up at [Kite Connect](https://developers.kite.trade/)
2. Create a new app in the developer console
3. Get your API Key
4. Complete the login flow to get Access Token
5. Add credentials to `.env` file

## Features

### Backtest Tab
- Test SMA Crossover strategy on historical data
- Configure instrument, date range, and SMA windows
- View detailed trade log and performance metrics

### Trade Tab
- Place buy/sell orders
- Support for multiple exchanges (NSE, BSE)
- Market and limit order types

### Profile Tab
- View your Kite Connect profile
- Check account details

## Monitoring Logs

### Browser Console (Client Logs):
```
Open DevTools (F12) → Console tab
Look for logs prefixed with:
- [HOME]
- [BACKTEST_FORM]
- [ORDER_FORM]
- [USER_PROFILE]
```

### Terminal (Server Logs):
```
Server logs appear in terminal where you ran 'pnpm dev'
Look for logs prefixed with:
- [KITE]
- [BACKTEST]
- [SMA_STRATEGY]
- [API/BACKTEST]
- [API/QUOTE]
- [API/ORDER]
- [API/USER]
```

## Common Issues

### "KITE_API_KEY is missing"
- Make sure `.env` file exists
- Check that environment variables are set correctly
- Restart the dev server after adding .env

### "No data found for the given range"
- Check if the date range is valid
- Ensure instrument token is correct
- Verify your Kite API access

### API Errors
- Check browser console for detailed error logs
- Check terminal for server-side error details
- Verify Kite Connect API status

## Project Structure
```
kite-connect-trader/
├── app/
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/        # React components
├── lib/              # Core logic
│   ├── kite.ts       # Kite API wrapper
│   ├── backtest.ts   # Backtest engine
│   └── strategy/     # Trading strategies
├── .env              # Your credentials (create this)
├── .env.example      # Template
└── package.json      # Dependencies
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run the application
3. 📖 Read `PROJECT_ANALYSIS.md` for detailed issues
4. 📖 Read `LOGGING_IMPLEMENTATION.md` for logging details
5. 🧪 Test backtesting functionality
6. 📈 Experiment with different strategies

## Need Help?

- Check `PROJECT_ANALYSIS.md` for known issues
- Review logs in console and terminal
- Consult [Kite Connect Documentation](https://kite.trade/docs/connect/v3/)

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```
