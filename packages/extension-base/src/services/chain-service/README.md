# Chain Service

The Chain Service is a core component of the SubWallet Extension that manages blockchain connections, chain configurations, and multi-chain operations. It provides a unified interface to interact with different blockchain networks including Substrate, EVM, Bitcoin, TON, and Cardano chains.

## Overview

The Chain Service centralizes blockchain management by:
- Managing chain information and configurations
- Handling API connections for multiple blockchain types
- Coordinating asset registries and metadata
- Providing subscription mechanisms for real-time updates
- Managing chain states and connection statuses
- Integrating with the Chain Online Service for automatic updates from remote data sources

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

    ChainOnlineService[ChainOnlineService] --> CS
    ChainOnlineService --> PatchAPI[Chain Patch API]
    ChainOnlineService --> SettingService[SettingService]
    PatchAPI --> RemoteChainData[Remote Chain Data]

    classDef service fill:#e1f5fe
    classDef handler fill:#f3e5f5
    classDef api fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef online fill:#e8f9f5
    
    class CS,DBService,EventService,SettingService service
    class SubstrateHandler,EvmHandler,BitcoinHandler,TonHandler,CardanoHandler,MantaHandler handler
    class SubstrateApi,EvmApi,BitcoinApi,TonApi,CardanoApi api
    class DataMap,ChainInfoMap,ChainStateMap,AssetRegistry,AssetRefMap data
    class ChainOnlineService,PatchAPI,RemoteChainData online
```

### Service Components

- **[Chain Service](index.ts)**: Main service orchestrating all chain operations
- **[Chain Online Service](../chain-online-service/index.ts)**: Manages remote chain data updates and patch synchronization
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

## Chain Online Service Integration

The Chain Service integrates with the Chain Online Service to automatically receive updates for chain configurations, asset registries, and provider information from remote data sources.

### Patch Update Architecture

```mermaid
graph LR
    PatchAPI[Chain Patch API] --> ChainOnlineService[ChainOnlineService]
    ChainOnlineService --> ValidationLayer[Patch Validation]
    ValidationLayer --> DataMerge[Data Merging]
    DataMerge --> CS[ChainService]
    CS --> Database[Database Update]
    CS --> Subscriptions[Subject Updates]
    
    ChainOnlineService --> HashValidation[MD5 Hash Validation]
    ChainOnlineService --> VersionControl[Version Management]
    
    classDef online fill:#e8f9f5
    classDef validation fill:#fff3e0
    classDef storage fill:#e1f5fe
    
    class PatchAPI,ChainOnlineService online
    class ValidationLayer,HashValidation,VersionControl,DataMerge validation
    class CS,Database,Subscriptions storage
```

### Online Update Properties

| Name | Type | Purpose |
|------|------|---------|
| `lockChainInfoMap` | `boolean` | Prevents concurrent modifications during patch updates |
| `refreshLatestChainDataTimeOut` | `NodeJS.Timer` | Periodic timer for checking remote data updates |

**Source**: [index.ts:87](index.ts), [../chain-online-service/index.ts:22](../chain-online-service/index.ts)

### Patch Data Types

```typescript
interface PatchInfo {
  patchVersion: string;
  appliedVersion: string;
  fetchedDate: string;
  ChainInfo: Record<string, _ChainInfo>;
  ChainInfoHashMap: Record<string, string>;
  ChainAsset: Record<string, _ChainAsset>;
  ChainAssetHashMap: Record<string, string>;
  MultiChainAsset: Record<string, _MultiChainAsset>;
  MultiChainAssetHashMap: Record<string, string>;
  ChainLogoMap: Record<string, string>;
  AssetLogoMap: Record<string, string>;
}
```

**Source**: [utils/patch.ts:14-25](utils/patch.ts)

### Lock Management Methods

#### `getlockChainInfoMap()`
Retrieves the current lock status of the chain info map.

**Output Response**: `boolean`

**Source**: [index.ts:211-212](index.ts)

#### `setLockChainInfoMap(isLock: boolean)`
Sets the lock status for the chain info map to prevent concurrent modifications.

**Input Parameters**:
- `isLock`: Boolean indicating whether to lock or unlock

**Source**: [index.ts:215-216](index.ts)

### Data Update Methods

#### `checkLatestData()`
Initiates periodic checking for remote chain data updates.

**Flow**:
1. Clears existing timeout intervals
2. Immediately fetches latest data
3. Sets up recurring interval for continuous updates

**Source**: [index.ts:801-804](index.ts)

#### `handleLatestData()`
Processes and applies remote chain data updates.

**Flow**:
1. Locks chain info map for safe updates
2. Fetches latest chain information
3. Validates and merges data
4. Updates database and subscriptions
5. Unlocks chain info map

**Source**: [index.ts:927-958](index.ts)

### State.ts Orchestration Methods

#### `resumeAllNetworks()`
Resumes all network connections and triggers online data updates during network recovery.

**Flow**:
1. Triggers chain online service data check
2. Resumes all chain API connections
3. Updates provider configurations with latest online data

**Source**: [../../koni/background/handlers/State.ts:1046-1049](../../koni/background/handlers/State.ts)

#### `resetWallet(resetAll: boolean)`
Resets wallet state and reinitializes with latest online chain data.

**Flow**:
1. Resets all services and databases
2. Reinitializes chain service
3. Triggers online data updates for fresh configuration
4. Subscribes to chain info updates

**Source**: [../../koni/background/handlers/State.ts:2180-2207](../../koni/background/handlers/State.ts)

#### `init()`
Main application initialization that coordinates online service startup.

**Flow**:
1. Initializes core services
2. Triggers chain online service data check
3. Triggers chain service data updates
4. Sets up chain info subscription monitoring

**Source**: [../../koni/background/handlers/State.ts:302-332](../../koni/background/handlers/State.ts)

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

### Online Patch Update Flow

```mermaid
sequenceDiagram
    participant Timer as Timer
    participant COS as ChainOnlineService
    participant API as Patch API
    participant CS as ChainService
    participant DB as DatabaseService
    participant Subject as Subjects

    Timer->>COS: checkLatestData() (periodic)
    COS->>API: fetchPatchData()
    API-->>COS: PatchInfo with latest data
    
    COS->>COS: validatePatchWithHash()
    alt Valid Patch
        COS->>COS: check patch version
        alt New Version
            COS->>CS: setLockChainInfoMap(true)
            COS->>COS: mergeChainList()
            COS->>COS: validatePatchBeforeStore()
            alt Valid Data
                COS->>CS: setChainInfoMap()
                COS->>CS: setAssetRegistry()
                COS->>CS: setChainStateMap()
                CS->>Subject: notify all subjects
                CS->>DB: bulkUpdateChainStore()
                CS->>DB: bulkUpdateAssetsStore()
                COS->>CS: setLockChainInfoMap(false)
            end
        end
    end
```

### State.ts Orchestrated Online Update Flow

```mermaid
sequenceDiagram
    participant State as KoniState
    participant COS as ChainOnlineService
    participant CS as ChainService
    participant API as Patch API
    participant Providers as Chain Providers

    Note over State: Application Initialization
    State->>CS: init()
    State->>COS: checkLatestData()
    State->>CS: checkLatestData()
    
    Note over State: Network Resumption
    State->>COS: checkLatestData()
    State->>CS: resumeAllChainApis()
    CS->>Providers: reconnect with updated configs
    
    Note over State: Wallet Reset
    State->>CS: resetWallet()
    State->>CS: init()
    State->>COS: checkLatestData()
    State->>CS: checkLatestData()
    
    Note over COS,CS: Online Data Updates
    COS->>API: fetchPatchData()
    API-->>COS: latest provider configs
    COS->>CS: update chain providers
    CS->>Providers: apply new provider endpoints
```

## Notes

### Known Issues

1. **Provider Randomization**: The service uses provider randomization which may cause connection issues with unstable providers.
   - **Location**: [utils.ts](utils/index.ts)

2. **Chain Lock Mechanism**: The `lockChainInfoMap` can prevent legitimate chain updates during critical operations.
   - **Location**: [index.ts:87](index.ts)

3. **API Retry Logic**: Connection retry mechanisms may not handle all edge cases for unstable network conditions.
   - **Location**: Chain handler implementations

4. **Patch Update Failures**: Online patch updates may fail due to network issues or data validation errors, requiring manual intervention.
   - **Location**: [../chain-online-service/index.ts](../chain-online-service/index.ts)

5. **Hash Validation Sensitivity**: MD5 hash validation for patch data is sensitive to minor formatting differences that could cause legitimate updates to be rejected.
   - **Location**: [../chain-online-service/constants.ts](../chain-online-service/constants.ts)

6. **Coordination Timing**: State.ts triggers multiple online update calls during initialization and reset operations, which could lead to redundant network requests.
   - **Location**: [../../koni/background/handlers/State.ts](../../koni/background/handlers/State.ts)

7. **Provider Update Race Conditions**: Simultaneous provider updates from online sources and manual configuration changes may cause inconsistent states.
   - **Location**: Chain service and online service integration points

### Performance Considerations

- **Concurrent API Initialization**: The service initializes multiple chain APIs concurrently, which can cause resource contention on slower devices.
- **Memory Usage**: Each active chain maintains its own API instance and metadata cache.
- **Database Queries**: Frequent chain state updates may create database performance bottlenecks.
- **Online Patch Updates**: Periodic remote data fetching and validation can consume bandwidth and processing resources.
- **Lock Contention**: Chain info map locking during patch updates may temporarily block other chain operations.
- **Multiple Update Triggers**: State.ts triggers online updates during initialization, network resumption, and wallet reset, potentially causing redundant API calls.
- **Provider Reconfiguration Overhead**: Online provider updates may trigger chain API reconnections, causing temporary service interruptions.

### Future Improvements

1. **Connection Pooling**: Implement connection pooling for better resource management
2. **Lazy Loading**: Add lazy loading for chain APIs to reduce initial startup time
3. **Health Monitoring**: Enhanced chain health monitoring and automatic failover and re-enable report API
4. **Lifetime Update**: Update in lifetime without make app stop.
5. **Error Recovery**: More sophisticated error recovery mechanisms for different failure scenarios
6. **Smart Update Coordination**: Implement intelligent update coordination in State.ts to avoid redundant online data requests
7. **Provider Update Debouncing**: Add debouncing mechanism for provider updates to prevent rapid successive reconfigurations
8. **Graceful Provider Switching**: Implement seamless provider transitions without service interruptions during online updates (Update in chain connections)

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
- Integrates with `ChainOnlineService` for automatic remote data updates
- Managed by `SettingService` for patch version tracking and configuration
- Orchestrated by `KoniState` which coordinates online updates during initialization, network resumption, and wallet reset operations