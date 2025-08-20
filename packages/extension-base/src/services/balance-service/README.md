# Balance Service Documentation

## Overview

The BalanceService is a core service responsible for managing cryptocurrency balance subscriptions, detection, and caching across multiple blockchain networks. It provides real-time balance updates, automatic token detection, and optimal transfer process calculations for the SubWallet extension.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "[[Balance Service]]"
        BS[BalanceService]
        BMI[BalanceMapImpl]
        DABS[DetectAccountBalanceStore]
        SH[subscribeBalance Helpers]
    end
    
    subgraph "Chain Handlers"
        SCH[SubstrateChainHandler]
        ECH[EvmChainHandler]
        BCH[BitcoinChainHandler]
        TCH[TonChainHandler]
        CCH[CardanoChainHandler]
    end
    
    subgraph "Blockchain APIs"
        SA[_SubstrateApi]
        EA[_EvmApi]
        BA[_BitcoinApi]
        TA[_TonApi]
        CA[_CardanoApi]
    end
    
    subgraph "External Services"
        SubS[SubscanService]
        SDK[SubWallet API SDK]
    end
    
    subgraph "Balance Subscription Helpers"
        SSB[subscribeSubstrateBalance]
        SEB[subscribeEVMBalance]
        SBB[subscribeBitcoinBalance]
        STB[subscribeTonBalance]
        SCB[subscribeCardanoBalance]
    end
    
    %% Balance Service relationships
    BS --> BMI
    BS --> DABS
    BS --> SH
    
    %% Chain handlers to APIs
    SCH --> SA
    ECH --> EA
    BCH --> BA
    TCH --> TA
    CCH --> CA
    
    %% External service connections
    BS --> SubS
    BS --> SDK
    
    %% Subscription helper routing
    SH --> SSB
    SH --> SEB
    SH --> SBB
    SH --> STB
    SH --> SCB
    
    %% Helper connections to APIs via chain handlers
    SSB --> SCH
    SEB --> ECH
    SBB --> BCH
    STB --> TCH
    SCB --> CCH
    
    classDef serviceClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef chainClass fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef apiClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef externalClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000
    classDef helperClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px,color:#000
    
    class BS,BMI,DABS,SH serviceClass
    class SCH,ECH,BCH,TCH,CCH chainClass
    class SA,EA,BA,TA,CA apiClass
    class SubS,SDK externalClass
    class SSB,SEB,SBB,STB,SCB helperClass
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

## XCM Cross-Chain Transfer Actions

### Overview

The Balance Service includes comprehensive XCM (Cross-Consensus Message Format) support for cross-chain transfers across multiple blockchain ecosystems. XCM enables asset transfers between different blockchains including Polkadot/Kusama parachains, Ethereum bridges, and specialized bridge protocols.

### Supported XCM Bridge Types

#### 1. Legacy Polkadot XCM (Deprecated)

##### 1.1. **Standard Polkadot XCM**
- **Purpose**: Native XCM transfers within Polkadot/Kusama ecosystem
- **Supported Chains**: Statemine, Statemint, Equilibrium, Mythos, AssetHubs
- **Implementation**: Uses `polkadotXcm` pallet with ParaSpell API integration
- **Methods**: `limitedReserveTransferAssets`, `limitedTeleportAssets`, `transferAssets`
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/polkadotXcm.ts`](./transfer/xcm/polkadotXcm.ts)

##### 1.2. **XCM Pallet Transfers**
- **Purpose**: Direct XCM transfers from relay chains
- **Supported Chains**: Polkadot, Kusama, Rococo, Westend
- **Implementation**: Uses `xcmPallet` for relay-to-parachain transfers
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/xcmPallet.ts`](./transfer/xcm/xcmPallet.ts)

##### 1.3. **xTokens Pallet**
- **Purpose**: Default XCM implementation for most parachains
- **Implementation**: Fallback XCM method for chains not using polkadotXcm or xcmPallet
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/xTokens.ts`](./transfer/xcm/xTokens.ts)

#### 2. **Polkadot XCM via ParaSpell (Current Implementation)**
- **Purpose**: Modern XCM implementation using ParaSpell API for enhanced cross-chain transfers
- **Features**:
  - Automatic chain mapping and asset identification
  - Optimized XCM routing across Polkadot/Kusama ecosystem
  - Support for complex multi-hop transfers
  - Enhanced error handling and validation
- **Supported Chains**: All Polkadot/Kusama parachains supported by ParaSpell
- **Implementation Details**:
  - Uses external ParaSpell API service via proxy
  - Requires `paraSpellAssetType` and `paraSpellValue` in token metadata
  - Converts API response hex to `SubmittableExtrinsic`
  - Supports dry-run validation before execution
- **API Endpoints**:
  - Build XCM: `/v1/x-transfer` (POST)
  - Dry Run: `/v1/xcm-fee` (POST)
- **Chain Mapping**: Dynamic chain slug to ParaSpell ID mapping via `fetchParaSpellChainMap()`
- **Currency Formats**: Supports native tokens, foreign assets, and custom asset types
- **Error Handling**: Comprehensive error messages for unsupported tokens/chains
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/utils.ts#L143`](./transfer/xcm/utils.ts#L143)
- **Function**: `createXcmExtrinsicV2()` and `buildXcm()`

#### 3. **Snow Bridge (Ethereum ↔ Polkadot)**
- **Purpose**: Bridge between Ethereum ecosystem and Polkadot Asset Hub
- **Supported Routes**: Ethereum ↔ Polkadot Asset Hub, Mythos integration
- **Features**: 
  - High fees (~$5-70 depending on direction)
  - Long completion time (~1 hour)
  - Beta status with risk warnings
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/snowBridge.ts`](./transfer/xcm/snowBridge.ts)

#### 4. **Avail Bridge**
- **Purpose**: Bridge between Ethereum and Avail blockchain
- **Supported Routes**: Ethereum ↔ Avail
- **Implementation**: 
  - Ethereum side: Smart contract interactions
  - Avail side: Native pallet calls
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/availBridge.ts`](./transfer/xcm/availBridge.ts)

#### 5. **Polygon Bridge**
- **Purpose**: Bridge for Polygon ecosystem transfers
- **Supported Routes**: 
  - Ethereum ↔ Polygon zkEVM
  - Ethereum Sepolia ↔ Polygon zkEVM Cardona (testnet)
- **Supported Tokens**: ETH, WETH, POL
- **Manual Claiming**: Some transfers require manual claiming
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/polygonBridge.ts`](./transfer/xcm/polygonBridge.ts)

#### 6. **PoS Bridge**
- **Purpose**: Polygon Proof-of-Stake bridge for legacy Polygon transfers
- **Supported Routes**:
  - Ethereum ↔ Polygon
  - Ethereum Sepolia ↔ Polygon Amoy (testnet)
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/posBridge.ts`](./transfer/xcm/posBridge.ts)

#### 7. **Across Bridge**
- **Purpose**: Cross-chain transfers using Across Protocol
- **Supported Routes**: Ethereum, Optimism, Base, Arbitrum One
- **Implementation**: Similar to Chainflip, uses vault-based transfers
- **External API**: Integrates with SubWallet API SDK for transfer data
- **Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/acrossBridge/index.ts`](./transfer/xcm/acrossBridge/index.ts)

### XCM Transfer Architecture

```mermaid
graph TB
    subgraph "[[Balance Service XCM]]"
        XCMI[XCM Index]
        XCMU[XCM Utils]
        XP[XCM Parser]
        CMV2[createXcmExtrinsicV2]
    end
    
    subgraph "Modern XCM Implementation"
        PS[ParaSpell API]
        PSProxy[ParaSpell Proxy Service]
        PSChainMap[ParaSpell Chain Mapping]
    end
    
    subgraph "Legacy XCM Methods (Deprecated)"
        PXcm[polkadotXcm Pallet]
        XcmP[xcmPallet]
        XTokens[xTokens Pallet]
    end
    
    subgraph "Bridge Protocols"
        SB[Snow Bridge]
        AB[Avail Bridge]
        PB[Polygon Bridge]
        PoSB[PoS Bridge]
        AcB[Across Bridge]
    end
    
    subgraph "External Services"
        SWAPI[SubWallet API SDK]
        SC[Smart Contracts]
        PSAPI[ParaSpell External API]
    end
    
    subgraph "Blockchain Networks"
        DOT[Polkadot Ecosystem]
        ETH[Ethereum]
        POLY[Polygon]
        OPT[Optimism/Base/Arbitrum]
        AVAIL[Avail]
    end
    
    %% Core XCM Service connections
    XCMI --> XCMU
    XCMI --> XP
    XCMI --> CMV2
    
    %% Modern XCM routing (Primary Path)
    CMV2 --> PS
    PS --> PSProxy
    PS --> PSChainMap
    PSProxy --> PSAPI
    
    %% Legacy XCM routing (Fallback)
    XCMI -.-> PXcm
    XCMI -.-> XcmP
    XCMI -.-> XTokens
    
    %% Bridge routing
    XCMI --> SB
    XCMI --> AB
    XCMI --> PB
    XCMI --> PoSB
    XCMI --> AcB
    
    %% External API connections
    AcB --> SWAPI
    SB --> SC
    AB --> SC
    PB --> SC
    PoSB --> SC
    
    %% Network connections
    PS --> DOT
    PXcm -.-> DOT
    XcmP -.-> DOT
    XTokens -.-> DOT
    SB --> ETH
    SB --> DOT
    AB --> ETH
    AB --> AVAIL
    PB --> ETH
    PB --> POLY
    PoSB --> ETH
    PoSB --> POLY
    AcB --> ETH
    AcB --> OPT
    
    %% ParaSpell API flow
    PSAPI --> DOT
    PSChainMap --> DOT
    
    classDef serviceClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef modernClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:3px,color:#000
    classDef legacyClass fill:#fff3e0,stroke:#e65100,stroke-width:1px,stroke-dasharray: 5 5,color:#666
    classDef bridgeClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef externalClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000
    classDef networkClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px,color:#000
    
    class XCMI,XCMU,XP,CMV2 serviceClass
    class PS,PSProxy,PSChainMap,PSAPI modernClass
    class PXcm,XcmP,XTokens legacyClass
    class SB,AB,PB,PoSB,AcB bridgeClass
    class SWAPI,SC externalClass
    class DOT,ETH,POLY,OPT,AVAIL networkClass
```

### XCM Method Implementations

#### Core XCM Functions

##### `createXcmExtrinsicV2(request)`

**Purpose**: Creates XCM extrinsics using ParaSpell API integration for enhanced compatibility.

**Input Parameters**:
- `request: CreateXcmExtrinsicProps` - Complete XCM transfer configuration

**Output Response**: `Promise<SubmittableExtrinsic<'promise'> | undefined>` - Substrate extrinsic or undefined on error

**Implementation**: Uses ParaSpell API to build optimized XCM transactions with proper asset identification and routing

**Code Reference**: [`/packages/extension-base/src/services/balance-service/transfer/xcm/utils.ts#L143`](./transfer/xcm/utils.ts#L143)

##### `dryRunXcmExtrinsicV2(request)`

**Purpose**: Validates XCM transfers before execution using dry-run simulation.

**Input Parameters**: 
- `request: CreateXcmExtrinsicProps` - XCM transfer parameters

**Output Response**: `Promise<boolean>` - Success/failure validation result

**Error Handling**: Gracefully handles chains that don't support dry-run or Polkadot API

**Implementation Details**:
- Tests origin, asset hub, bridge hub, and destination execution
- Provides fallback for unsupported chains
- Returns detailed failure reasons for debugging

##### Bridge-Specific Methods

##### `createSnowBridgeExtrinsic(props)`

**Purpose**: Creates Snow Bridge transfers between Ethereum and Polkadot Asset Hub.

**Features**:
- EVM transaction configuration
- High fee estimation ($5-70)
- Beta status warnings
- Long completion times (~1 hour)

##### `createAvailBridgeExtrinsicFromAvail(props)` / `createAvailBridgeTxFromEth(props)`

**Purpose**: Bidirectional Avail bridge transfers.

**Implementation**:
- Avail → Ethereum: Uses Avail pallet calls
- Ethereum → Avail: Uses Ethereum smart contract interactions

##### `createPolygonBridgeExtrinsic(props)`

**Purpose**: Polygon zkEVM bridge transfers with automatic L1/L2 direction detection.

**Smart Routing**:
- Auto-detects L1 to L2 vs L2 to L1 transfers
- Supports both Polygon Bridge and PoS Bridge protocols
- Handles mainnet and testnet configurations

##### `createAcrossBridgeExtrinsic(props)`

**Purpose**: Across Protocol transfers for Ethereum L2 ecosystem.

**Features**:
- Dynamic fee estimation
- Vault-based transfer mechanism
- Integration with SubWallet API SDK for transfer data
- Support for Ethereum, Optimism, Base, Arbitrum One

### XCM Transfer Flow

```mermaid
sequenceDiagram
    participant User as User Interface
    participant Ext as KoniExtension
    participant XCM as XCM Service
    participant Parser as XCM Parser
    participant Bridge as Bridge Handler
    participant API as Blockchain API
    
    User->>Ext: makeCrossChainTransfer()
    Ext->>Parser: Detect transfer type
    Parser->>Parser: Check bridge compatibility
    Parser-->>Ext: Transfer type identified
    
    alt Standard XCM
        Ext->>XCM: createXcmExtrinsicV2()
        XCM->>API: ParaSpell API call
        API-->>XCM: Extrinsic hex
        XCM->>XCM: Convert to SubmittableExtrinsic
    else Bridge Transfer
        Ext->>Bridge: createBridgeExtrinsic()
        Bridge->>API: Smart contract interaction
        API-->>Bridge: Transaction config
    end
    
    XCM-->>Ext: Transfer ready
    Ext->>Ext: Fee calculation
    Ext->>API: Execute transaction
    API-->>User: Transaction result
```

### XCM Chain Groups

The service categorizes chains into specific XCM groups for proper routing:

**Code Reference**: [`/packages/extension-base/src/services/chain-service/constants.ts#L261`](../../chain-service/constants.ts#L261)

- **polkadotXcm**: `['statemine', 'statemint', 'equilibrium_parachain', 'rococo_assethub', 'mythos', 'westend_assethub']`
- **polkadotXcmSpecialCases**: `['astar', 'shiden']` - Special routing for native tokens
- **xcmPallet**: `['polkadot', 'kusama', 'rococo', 'westend']` - Relay chain routing

### XCM Validation and Error Handling

#### Transfer Validation

- **Bridge Compatibility**: Automatic detection of supported bridge types
- **Chain Support**: Validates origin and destination chain compatibility  
- **Asset Support**: Checks token availability on target chains
- **Fee Estimation**: Pre-calculates transfer fees including bridge costs

#### Error Recovery

- **Dry-Run Fallback**: Graceful handling of chains without dry-run support
- **API Timeouts**: Robust timeout handling for external API calls
- **Bridge Failures**: Specific error messages for bridge-related issues
- **Manual Claiming**: Clear notifications for transfers requiring manual claim

#### Risk Warnings

The service provides automatic risk warnings for:
- **Beta Bridges**: High-fee, experimental bridge protocols
- **High Fees**: Transfers with significant cost implications  
- **Long Delays**: Bridges with extended completion times
- **Manual Claims**: Transfers requiring additional user action

**Implementation**: [`/packages/extension-base/src/core/substrate/xcm-parser.ts#L71-116`](../../core/substrate/xcm-parser.ts#L71-116)

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
