# Chain Service

The Chain Service is a core component of the SubWallet Extension that manages blockchain connections, chain configurations, and multi-chain operations. It provides a unified interface to interact with different blockchain networks including Substrate, EVM, Bitcoin, TON, and Cardano chains.

## Overview

The Chain Service centralizes blockchain management by:
- Managing chain information and configurations
- Handling API connections for multiple blockchain types
- Coordinating asset registries and metadata
- Providing subscription mechanisms for real-time updates
- Managing chain states and connection statuses

## Architecture

```mermaid
graph LR
    CS[ChainService] --> DBService[DatabaseService]
    CS --> EventService[EventService]
    CS --> SubstrateHandler[SubstrateChainHandler]
    CS --> EvmHandler[EvmChainHandler]
    CS --> BitcoinHandler[BitcoinChainHandler]
    CS --> TonHandler[TonChainHandler]
    CS --> CardanoHandler[CardanoChainHandler]
    CS --> MantaHandler[MantaPrivateHandler]
    
    SubstrateHandler --> SubstrateApi[SubstrateApi]
    EvmHandler --> EvmApi[EvmApi]
    BitcoinHandler --> BitcoinApi[BitcoinApi]
    TonHandler --> TonApi[TonApi]
    CardanoHandler --> CardanoApi[CardanoApi]
    
    CS --> DataMap{Data Management}
    DataMap --> ChainInfoMap[chainInfoMap]
    DataMap --> ChainStateMap[chainStateMap]
    DataMap --> AssetRegistry[assetRegistry]
    DataMap --> AssetRefMap[assetRefMap]

    classDef service fill:#e1f5fe
    classDef handler fill:#f3e5f5
    classDef api fill:#e8f5e8
    classDef data fill:#fff3e0
    
    class CS,DBService,EventService service
    class SubstrateHandler,EvmHandler,BitcoinHandler,TonHandler,CardanoHandler,MantaHandler handler
    class SubstrateApi,EvmApi,BitcoinApi,TonApi,CardanoApi api
    class DataMap,ChainInfoMap,ChainStateMap,AssetRegistry,AssetRefMap data
```

### Service Components

- **[Chain Service](index.ts)**: Main service orchestrating all chain operations
- **Chain Handlers**: Type-specific handlers for different blockchain architectures
- **API Adapters**: Low-level blockchain API interfaces
- **Data Management**: Centralized state and configuration management

### Chain Handler Architecture

Each blockchain type has a dedicated handler that extends `AbstractChainHandler`:

```mermaid
graph LR
    AbstractHandler[AbstractChainHandler] --> SubstrateHandler[SubstrateChainHandler]
    AbstractHandler --> EvmHandler[EvmChainHandler]
    AbstractHandler --> BitcoinHandler[BitcoinChainHandler]
    AbstractHandler --> TonHandler[TonChainHandler]
    AbstractHandler --> CardanoHandler[CardanoChainHandler]
    
    classDef abstract fill:#ffecb3
    classDef concrete fill:#e8f5e8
    
    class AbstractHandler abstract
    class SubstrateHandler,EvmHandler,BitcoinHandler,TonHandler,CardanoHandler concrete
```

## Props

### Core Properties

| Name | Type | Purpose |
|------|------|---------|
| `dataMap` | `_DataMap` | Central data store containing chain info, states, and asset registries |
| `dbService` | `DatabaseService` | Database service for persistent storage |
| `eventService` | `EventService` | Event system for inter-service communication |
| `lockChainInfoMap` | `boolean` | Prevents unwanted changes to chain info during operations |

**Source**: [index.ts:77-91](index.ts)

### Handler Properties

| Name | Type | Purpose |
|------|------|---------|
| `substrateChainHandler` | `SubstrateChainHandler` | Manages Substrate-based blockchain connections |
| `evmChainHandler` | `EvmChainHandler` | Manages EVM-compatible blockchain connections |
| `bitcoinChainHandler` | `BitcoinChainHandler` | Manages Bitcoin and Bitcoin-compatible networks |
| `tonChainHandler` | `TonChainHandler` | Manages TON blockchain connections |
| `cardanoChainHandler` | `CardanoChainHandler` | Manages Cardano blockchain connections |
| `mantaChainHandler` | `MantaPrivateHandler` | Optional handler for Manta Pay zero-knowledge features |

**Source**: [index.ts:92-97](index.ts)

### Subject Properties

| Name | Type | Purpose |
|------|------|---------|
| `chainInfoMapSubject` | `Subject<Record<string, _ChainInfo>>` | Emits chain information updates |
| `chainStateMapSubject` | `Subject<Record<string, _ChainState>>` | Emits chain state changes |
| `assetRegistrySubject` | `Subject<Record<string, _ChainAsset>>` | Emits asset registry updates |
| `multiChainAssetMapSubject` | `Subject<Record<string, _MultiChainAsset>>` | Emits multi-chain asset updates |

**Source**: [index.ts:101-114](index.ts)

### Data Types

```typescript
interface _DataMap {
  chainInfoMap: Record<string, _ChainInfo>;
  assetRegistry: Record<string, _ChainAsset>;
  chainStateMap: Record<string, _ChainState>;
  assetRefMap: Record<string, _AssetRef>;
}
```

**Source**: [types.ts:26-31](types.ts)

```typescript
interface _ChainState {
  slug: string;
  active: boolean;
  currentProvider: string;
  manualTurnOff: boolean;
}
```

**Source**: [types.ts:42-47](types.ts)

## Methods

### Initialization Methods

#### `init()`
Main initialization method that orchestrates the entire service setup.

**Input Parameters**: None

**Output Response**: `Promise<void>`

**Flow**:
1. Waits for database readiness
2. Initializes chain configurations
3. Sets up asset registries
4. Initializes API connections
5. Enables asset settings

**Source**: [index.ts:778-793](index.ts)

#### `initChains()`
Private method that initializes chain configurations from stored settings and default chain list.

**Input Parameters**: None

**Output Response**: `Promise<void>`

**Error Handling**: Database operations are wrapped in try-catch blocks

**Source**: [index.ts:1295-1508](index.ts)

#### `initApiForChain(chainInfo: _ChainInfo)`
Initializes API connections for a specific blockchain based on its type.

**Input Parameters**:
- `chainInfo`: Chain configuration object containing connection details

**Output Response**: `Promise<void>`

**Error Handling**: Disables chain if provider endpoint is not found

**Source**: [index.ts:990-1079](index.ts)

### API Access Methods

#### `getSubstrateApi(slug: string)`
Retrieves Substrate API instance for a specific chain.

**Input Parameters**:
- `slug`: Chain identifier string

**Output Response**: `_SubstrateApi | undefined`

**Source**: [index.ts:227-229](index.ts)

#### `getEvmApi(slug: string)`
Retrieves EVM API instance for a specific chain.

**Input Parameters**:
- `slug`: Chain identifier string

**Output Response**: `_EvmApi | undefined`

**Source**: [index.ts:219-221](index.ts)

### Chain Management Methods

#### `enableChain(chainSlug: string, enableTokens: boolean = true)`
Enables a blockchain and optionally its associated tokens.

**Input Parameters**:
- `chainSlug`: Chain identifier string
- `enableTokens`: Whether to enable associated tokens (default: true)

**Output Response**: `Promise<boolean>`

**Error Handling**: Returns false if operation fails

**Source**: Referenced in semantic search results

#### `disableChain(chainSlug: string)`
Disables a blockchain and its API connections.

**Input Parameters**:
- `chainSlug`: Chain identifier string

**Output Response**: `Promise<boolean>`

**Error Handling**: Gracefully handles API disconnection failures

**Source**: Referenced in semantic search results

### Subscription Methods

#### `subscribeChainInfoMap()`
Provides reactive updates for chain information changes.

**Output Response**: `Subject<Record<string, _ChainInfo>>`

**Source**: [index.ts:309-311](index.ts)

#### `subscribeAssetRegistry()`
Provides reactive updates for asset registry changes.

**Output Response**: `Subject<Record<string, _ChainAsset>>`

**Source**: [index.ts:313-315](index.ts)

### Asset Management Methods

#### `upsertCustomToken(data: _ChainAsset)`
Adds or updates a custom token in the asset registry.

**Input Parameters**:
- `data`: Chain asset configuration object

**Output Response**: `string` (token slug)

**Error Handling**: Validates asset data before insertion

**Source**: Referenced in semantic search results

#### `deleteCustomAssets(targetTokens: string[])`
Removes custom assets from the registry.

**Input Parameters**:
- `targetTokens`: Array of token slugs to remove

**Output Response**: `void`

**Source**: Referenced in semantic search results

## Flows

### Service Initialization Flow

```mermaid
sequenceDiagram
    participant State as KoniState
    participant CS as ChainService
    participant DB as DatabaseService
    participant Handlers as Chain Handlers
    participant APIs as Blockchain APIs

    State->>CS: init()
    CS->>DB: waitDatabaseReady
    DB-->>CS: ready
    CS->>CS: initChains()
    CS->>DB: getAllChainStore()
    DB-->>CS: stored chains
    CS->>CS: merge with default chains
    CS->>CS: initAssetRegistry()
    CS->>CS: initApis()
    CS->>Handlers: initApi() for each active chain
    Handlers->>APIs: create API instances
    APIs-->>Handlers: connected APIs
    Handlers-->>CS: initialization complete
    CS->>CS: initAssetSettings()
    CS-->>State: service ready
```

### Chain Connection Lifecycle

```mermaid
sequenceDiagram
    participant CS as ChainService
    participant Handler as ChainHandler
    participant API as BlockchainApi
    participant DB as DatabaseService

    CS->>Handler: initApiForChain(chainInfo)
    Handler->>API: new API(endpoint, options)
    API->>API: connect()
    API->>Handler: connectionStatus updates
    Handler->>CS: status notifications
    
    alt Connection Success
        API-->>Handler: CONNECTED
        Handler->>DB: update connection status
    else Connection Failure
        API-->>Handler: DISCONNECTED
        Handler->>Handler: schedule retry
        Handler->>API: recoverConnect()
    end
```

### Asset Registry Management

```mermaid
sequenceDiagram
    participant CS as ChainService
    participant DB as DatabaseService
    participant Subject as AssetRegistrySubject
    participant UI as User Interface

    CS->>DB: getAllAssetStore()
    DB-->>CS: stored assets
    CS->>CS: merge with default assets
    CS->>CS: validate and clean deprecated assets
    CS->>DB: bulkUpdateAssetsStore(finalAssets)
    CS->>Subject: next(assetRegistry)
    Subject-->>UI: asset registry updated
```

## Notes

### Known Issues

1. **Provider Randomization**: The service uses provider randomization which may cause connection issues with unstable providers.
   - **Location**: [utils.ts](utils/index.ts)

2. **Chain Lock Mechanism**: The `lockChainInfoMap` can prevent legitimate chain updates during critical operations.
   - **Location**: [index.ts:87](index.ts)

3. **API Retry Logic**: Connection retry mechanisms may not handle all edge cases for unstable network conditions.
   - **Location**: Chain handler implementations

### Performance Considerations

- **Concurrent API Initialization**: The service initializes multiple chain APIs concurrently, which can cause resource contention on slower devices.
- **Memory Usage**: Each active chain maintains its own API instance and metadata cache.
- **Database Queries**: Frequent chain state updates may create database performance bottlenecks.

### Future Improvements

1. **Connection Pooling**: Implement connection pooling for better resource management
2. **Lazy Loading**: Add lazy loading for chain APIs to reduce initial startup time
3. **Health Monitoring**: Enhanced chain health monitoring and automatic failover
4. **Metadata Caching**: Improved metadata caching strategies to reduce network requests
5. **Error Recovery**: More sophisticated error recovery mechanisms for different failure scenarios

### Dependencies

- **@polkadot/api**: Substrate blockchain interactions
- **web3**: EVM blockchain interactions  
- **@ton/core**: TON blockchain interactions
- **@emurgo/cardano-serialization-lib-nodejs**: Cardano blockchain interactions
- **rxjs**: Reactive programming for subscriptions

**Integration Points**:
- Used by `KoniState` as the main chain management service
- Provides data to `BalanceService`, `EarningService`, and `SwapService`
- Coordinates with `DatabaseService` for persistent storage
- Communicates through `EventService` for cross-service notifications