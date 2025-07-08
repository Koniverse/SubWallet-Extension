# @TODO: Review content
# SubWallet API SDK

This package provides a TypeScript SDK for interacting with SubWallet's backend APIs.

## Features

- **Swap API**: Fetch token swap quotes and find multi-steps swap path.
- **XCM API**: Cross-chain message handling for EVM
- **Balance Detection API**: Real-time balance monitoring
- **Price History API**: Historical price data retrieval

## Basic Usage

```typescript
import { subwalletApiSdk } from '@subwallet/subwallet-api-sdk';

// Initialize the SDK
subwalletApiSdk.init({
  url: 'https://api.subwallet.app'
});

// Use the APIs
const swapApi = subwalletApiSdk.swapApi;
const xcmApi = subwalletApiSdk.xcmApi;
```

### Environment Headers

The following headers are automatically included in `findAvailablePath` requests:

- `sw-app-version`: Application version
- `sw-chain-list-version`: Chain list version
- `sw-platform`: Platform (extension, webapp, mobile)
- `sw-timestamp`: ISO timestamp


### Using with SettingService

When used within the SubWallet extension, the SDK automatically syncs with `SettingService`:

```typescript
// The SDK automatically detects and uses environment config from SettingService
// No additional configuration needed when used within the extension
```

## API Reference

### SwapApi

The SwapApi provides methods for token swapping operations.

```typescript
// Get swap quotes
const quotes = await swapApi.fetchSwapQuoteData({
  address: '5F...',
  pair: { slug: 'polkadot-DOT', from: 'DOT', to: 'USDC' },
  fromAmount: '1000000000',
  slippage: 0.01
});

// Find available swap paths (automatically includes environment headers)
const paths = await swapApi.findAvailablePath({
  address: '5F...',
  pair: { slug: 'polkadot-DOT', from: 'DOT', to: 'USDC' },
  fromAmount: '1000000000',
  slippage: 0.01,
  isCrossChain: true
});

// Get hydration rate
const rate = await swapApi.getHydrationRate({
  address: '5F...',
  pair: { slug: 'polkadot-DOT', from: 'DOT', to: 'USDC' }
});
```

### XcmApi

The XcmApi handles cross-chain message operations.

```typescript
// Fetch XCM data
const xcmData = await xcmApi.fetchXcmData(
  '5F...',
  'polkadot',
  'kusama',
  '5F...',
  '1000000000'
);
```

### BalanceDetectionApi

The BalanceDetectionApi provides real-time balance monitoring.

```typescript
// Implementation details depend on the specific API endpoints
```

### PriceHistoryApi

The PriceHistoryApi provides historical price data.

```typescript
// Implementation details depend on the specific API endpoints
```
