# Balance Service Documentation

## Overview

The BalanceService is a core service responsible for managing cryptocurrency balance subscriptions, detection, and caching across multiple blockchain networks. It provides real-time balance updates, automatic token detection, and optimal transfer process calculations for the SubWallet extension.

## Architecture

### High-Level Architecture

```mermaid
graph LR
    subgraph "[[Balance Service]]"
        BS[BalanceService]
        BMI[BalanceMapImpl]
        DABS[DetectAccountBalanceStore]
        SB[subscribeBalance Helper]
    end
    
    subgraph "Core Services"
        KS[KoniState]
        ES[EventService]
        KRS[KeyringService]
        DBS[DatabaseService]
    end
    
    subgraph "Chain Service Layer"
        CS[ChainService]
        SH[SubstrateChainHandler]
        EH[EvmChainHandler]
        BH[BitcoinChainHandler]
        TH[TonChainHandler]
        CH[CardanoChainHandler]
        MH[MantaPrivateHandler]
    end
    
    subgraph "Blockchain APIs"
        SAPI[SubstrateApi]
        EAPI[EvmApi]
        BAPI[BitcoinApi]
        TAPI[TonApi]
        CAPI[CardanoApi]
        MAPI[MantaPay Api]
    end
    
    subgraph "External Services"
        SSS[SubscanService]
        SDK[SubWallet SDK]
        COS[ChainOnlineService]
    end
    
    BS --> BMI
    BS --> DABS
    BS --> SB
    BS --> KS
    
    KS --> CS
    KS --> ES
    KS --> KRS
    KS --> DBS
    
    CS --> SH
    CS --> EH
    CS --> BH
    CS --> TH
    CS --> CH
    CS --> MH
    
    SH --> SAPI
    EH --> EAPI
    BH --> BAPI
    TH --> TAPI
    CH --> CAPI
    MH --> MAPI
    
    BS --> SSS
    BS --> SDK
    CS --> COS
    
    SB --"Get provider"--> CS
    
    classDef serviceClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef coreClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef chainClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef apiClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef externalClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class BS,BMI,DABS,SB serviceClass
    class KS,ES,KRS,DBS coreClass
    class CS,SH,EH,BH,TH,CH,MH chainClass
    class SAPI,EAPI,BAPI,TAPI,CAPI,MAPI apiClass
    class SSS,SDK,COS externalClass
```

### Service Components Roles

- **BalanceService**: Main orchestrator for balance operations and subscriptions
- **BalanceMapImpl**: Manages balance data storage and updates with reactive subjects
- **DetectAccountBalanceStore**: Handles automatic balance detection caching
- **subscribeBalance**: Helper function for creating blockchain-specific balance subscriptions

### Current Service Components

```mermaid
sequenceDiagram
    participant App as Application
    participant BS as BalanceService
    participant BMI as BalanceMapImpl
    participant API as Blockchain APIs
    participant DB as Database
    
    App->>BS: init()
    BS->>BMI: Initialize balance map
    BS->>DB: Load stored balances
    BMI->>BMI: Update balance items
    
    App->>BS: start()
    BS->>BS: startScanBalance()
    BS->>BS: runSubscribeBalances()
    BS->>API: Subscribe to balance updates
    API-->>BS: Balance updates
    BS->>BMI: setBalanceItem()
    BMI->>DB: Store balance updates
    BMI-->>App: Emit balance changes
```

## Props

### Important Properties

| Name | Purpose | Type |
|------|---------|------|
| `state` | Main application state reference | `KoniState` |
| `balanceMap` | Balance data management implementation | `BalanceMapImpl` |
| `balanceUpdateCache` | Temporary cache for balance updates | `BalanceItem[]` |
| `status` | Current service status | `ServiceStatus` |
| `intervalTime` | Balance detection scan interval (3 minutes) | `number` |
| `cacheTime` | Balance detection cache duration (15 minutes) | `number` |

### Types and Interfaces

Referenced from [`/packages/extension-base/src/services/balance-service/index.ts`](./index.ts):

- `BalanceItem`: Individual balance record structure
- `AmountData`: Standardized amount representation with decimals and symbol
- `DetectBalanceCache`: Cache for automatic balance detection timestamps
- `ServiceStatus`: Enum for service lifecycle states

### Default Values

- `intervalTime`: `3 * 60 * 1000` (3 minutes)
- `cacheTime`: `15 * 60 * 1000` (15 minutes)
- `status`: `ServiceStatus.NOT_INITIALIZED`

## Methods

### Core Balance Operations

#### `subscribeBalance(address, chain, tokenSlug, balanceType, extrinsicType, callback)`

**Purpose**: Subscribe to real-time balance updates for a specific token on a chain.

**Input Parameters**:
- `address: string` - Wallet address to monitor
- `chain: string` - Blockchain network identifier
- `tokenSlug?: string` - Token identifier (optional, defaults to native token)
- `balanceType: 'transferable' | 'total' | 'keepAlive'` - Type of balance to retrieve
- `extrinsicType?: ExtrinsicType` - Context for balance calculation
- `callback?: (rs: AmountData) => void` - Optional callback for balance updates

**Output Response**: `Promise<[() => void, AmountData]>` - Unsubscribe function and initial balance

**Error Handling**: Throws `BalanceError` for network/token issues, rejects on timeout (9999ms)

#### `getTransferableBalance(address, chain, tokenSlug, extrinsicType)`

**Purpose**: Get one-time transferable balance for an address.

**Input Parameters**:
- `address: string` - Wallet address
- `chain: string` - Blockchain network
- `tokenSlug?: string` - Token identifier
- `extrinsicType?: ExtrinsicType` - Transaction context

**Output Response**: `Promise<AmountData>` - Balance information

### Service Lifecycle

#### `init()`

**Purpose**: Initialize the service and load stored data.

**Input Parameters**: None

**Output Response**: `Promise<void>`

**Error Handling**: Waits for chain and account readiness before proceeding

#### `start()`

**Purpose**: Start balance subscriptions and scanning.

**Output Response**: `Promise<void>`

**Error Handling**: Handles concurrent start/stop operations with promise handlers

#### `stop()`

**Purpose**: Stop all balance subscriptions and scanning.

**Output Response**: `Promise<void>`

### Balance Detection

#### `autoEnableChains(addresses)`

**Purpose**: Automatically detect and enable chains with non-zero balances.

**Input Parameters**:
- `addresses: string[]` - Array of addresses to scan

**Output Response**: `Promise<void>`

**Error Handling**: Catches individual API failures and continues processing

### Transfer Process

#### `getOptimalTransferProcess(params)`

**Purpose**: Calculate optimal transfer path for cross-chain transactions.

**Input Parameters**:
- `params: RequestOptimalTransferProcess` - Transfer parameters including origin/destination chains

**Output Response**: `Promise<CommonOptimalTransferPath>` - Optimal transfer configuration

**Error Handling**: Throws errors for unsupported transfer types or missing token info

## Flows

### Service Lifecycle

```mermaid
sequenceDiagram
    participant App as Application
    participant BS as BalanceService
    participant State as KoniState
    participant Events as EventService
    
    Note over App,Events: Initialization Flow
    App->>BS: init()
    BS->>Events: waitChainReady
    BS->>Events: waitAccountReady
    BS->>BS: loadData()
    BS->>State: Load stored balances
    BS->>BS: Set status to INITIALIZED
    
    Note over App,Events: Service Start Flow
    App->>BS: start()
    BS->>BS: startScanBalance()
    BS->>BS: runSubscribeBalances()
    BS->>BS: Set status to STARTED
    
    Note over App,Events: Service Stop Flow
    App->>BS: stop()
    BS->>BS: runUnsubscribeBalances()
    BS->>BS: stopScanBalance()
    BS->>BS: Set status to STOPPED
```

### Balance Subscription Flow

```mermaid
sequenceDiagram
    participant Client as Client
    participant BS as BalanceService
    participant Helper as subscribeBalance
    participant API as Blockchain API
    participant Cache as BalanceMap
    
    Client->>BS: subscribeBalance()
    BS->>BS: Validate chain and token
    BS->>Helper: Call helper function
    Helper->>API: Subscribe to balance updates
    API-->>Helper: Balance data
    Helper->>BS: Return balance item
    BS->>Cache: setBalanceItem()
    Cache->>Cache: Update balance map
    Cache-->>Client: Emit balance changes
    
    Note over Client,Cache: Continuous Updates
    loop Balance Updates
        API-->>Helper: New balance data
        Helper->>BS: Process update
        BS->>Cache: Update cache
        Cache-->>Client: Notify subscribers
    end
```

### Automatic Chain Detection Flow

```mermaid
sequenceDiagram
    participant Scanner as Balance Scanner
    participant BS as BalanceService
    participant Subscan as SubscanService
    participant SDK as SubWallet SDK
    participant CS as ChainService
    
    Note over Scanner,CS: Detection Process
    Scanner->>BS: autoEnableChains()
    BS->>Subscan: getMultiChainBalance()
    BS->>SDK: getEvmTokenBalanceSlug()
    
    par Substrate Chains
        Subscan-->>BS: Balance data
        BS->>BS: Filter non-zero balances
        BS->>CS: enableChains()
    and EVM Chains
        SDK-->>BS: Token slugs
        BS->>BS: Filter existing assets
        BS->>CS: enableChains()
    end
    
    BS->>CS: setAssetSettings()
    Note over BS,CS: Chains and tokens activated
```

## Notes

### Known Issues

- Balance detection timeout set to 30 seconds for EVM chains may be insufficient for slow networks
- Error handling in gear.ts shows TODO comment for createType errors (line 56, 89)
- Cardano balance includes TODO for research on locked balance implementation (line 58 in cardano/index.ts)

### Future Improvements

- **Performance Optimization**: Consider implementing intelligent caching strategies to reduce API calls
- **Error Recovery**: Implement retry mechanisms for failed balance subscriptions
- **Multi-threading**: Explore worker threads for intensive balance calculations
- **Real-time Sync**: Enhance WebSocket connections for instant balance updates

### Code References

- Core service implementation: [`/packages/extension-base/src/services/balance-service/index.ts`](./index.ts)
- Balance subscription helpers: [`/packages/extension-base/src/services/balance-service/helpers/subscribe/`](./helpers/subscribe/)
- State integration: [`/packages/extension-base/src/koni/background/handlers/State.ts`](../../koni/background/handlers/State.ts#L133)
- Gear blockchain support: [`/packages/extension-base/src/services/balance-service/helpers/subscribe/substrate/gear.ts`](./helpers/subscribe/substrate/gear.ts)
- Cardano blockchain support: [`/packages/extension-base/src/services/balance-service/helpers/subscribe/cardano/index.ts`](./helpers/subscribe/cardano/index.ts)
