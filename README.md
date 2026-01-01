# Morning Stock Market Report

A desktop application built with Electron and React that provides a comprehensive morning stock market report.

## Features

- **Economic Events Calendar**: View upcoming economic events, Fed meetings, and government data releases for the current week
- **Sector Performance**: Track performance of major market sectors (S&P 500, NASDAQ, Dow Jones, and sector ETFs) over 1, 5, 10, and 30-day periods
- **Top Stock News**: Stay updated with the latest market news from reliable sources
- **Customizable Watchlist**: Add and remove stocks to monitor their prices and trading volumes

## Technology Stack

- **Electron**: Desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Finnhub API**: Real-time stock market data provider
- **Webpack**: Module bundler

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Finnhub API key (free tier available at [finnhub.io](https://finnhub.io))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/cpv0310/morningreport.git
cd morningreport
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Finnhub API key:
```
FINNHUB_API_KEY=your_api_key_here
```

## Development

Run the application in development mode:

```bash
npm run dev
```

This will start:
- Webpack dev server for the renderer process on port 3000
- Electron main process

## Building

Build the application for production:

```bash
npm run build
```

This creates optimized bundles in the `dist` folder.

## Packaging

Package the application for distribution:

```bash
npm run package
```

This uses electron-builder to create platform-specific installers in the `out` folder.

## Project Structure

```
morningreport/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts            # App lifecycle
│   │   ├── ipc-handlers.ts     # IPC communication
│   │   └── preload.ts          # Secure bridge
│   ├── services/                # Data services
│   │   ├── finnhub.ts          # Finnhub API client
│   │   └── cache.ts            # Caching layer
│   └── renderer/                # React application
│       ├── components/          # UI components
│       ├── hooks/              # Custom hooks
│       ├── types/              # TypeScript types
│       └── styles/             # CSS files
├── package.json
├── tsconfig.json
└── webpack.*.config.js
```

## Data Sources

All market data is provided by [Finnhub](https://finnhub.io), including:
- Real-time stock quotes
- Historical price data for sector ETFs
- Economic calendar events
- Market news articles

## Features in Detail

### Sector Performance
Tracks the following sectors and indices:
- SPY (S&P 500)
- QQQ (NASDAQ 100)
- DIA (Dow Jones)
- IWM (Russell 2000)
- XLF (Financials)
- XLE (Energy)
- XLV (Healthcare)
- XLK (Technology)
- XLY (Consumer Discretionary)
- XLP (Consumer Staples)
- XLI (Industrials)

### Watchlist
- Add stocks by ticker symbol
- View current price and volume
- See daily price changes
- Remove stocks with one click
- Data persists locally in localStorage

## License

MIT

## Author

cpv0310

## Acknowledgments

- Data provided by Finnhub API
- Built with Electron and React
