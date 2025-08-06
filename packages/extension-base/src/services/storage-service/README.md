# Storage Service Documentation

## Overview

The Storage Service in SubWallet Extension manages multiple storage types to ensure data is stored, accessed, and synchronized efficiently across different environments (browser extension, web app, mobile). This service includes three main layers: **Chrome Storage**, **IndexedDB**, and **LocalStorage** with fallback mechanisms to support cross-platform compatibility.

## Architecture

### High-Level Storage Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        APP[SubWallet Extension]
        WEB[Web App]
        MOB[Mobile App]
    end
    
    subgraph "Storage Abstraction Layer"
        direction TB
        SWS["[SWStorage Service]<br/>Unified Simple Storage<br/>Simple key-value"]
        LGS["[Legacy Storage]<br/>Chrome Storage + Fallback<br/>Simple key-value"]
        DBS["[Database Service]<br/>Structured Data Storage"]
    end
    
    subgraph "Storage Layer"
        direction LR
        CS[Chrome Storage<br/>Extension Only<br/>5MB Limit]
        LS[LocalStorage<br/>Web Only<br/>~5-10MB Limit]
        IDB[IndexedDB<br/>All Platforms<br/>Large Capacity]
    end
    
    %% Direct Application to Storage Services
    APP --> SWS
    APP --> DBS
    APP --> LGS
    WEB --> SWS
    WEB --> DBS
    WEB --> LGS
    MOB --> SWS
    MOB --> DBS
    MOB --> LGS
    
    %% Legacy Stores Platform Adaptation
    LGS -.->|Browser Extension| CS
    LGS -.->|Web & Mobile Apps| SWS

    
    %% SWStorage Platform Adaptation
    SWS -.->|Extension| IDB
    SWS -.->|Mobile/Web| LS
    
    %% Database Service Implementation
    DBS --> IDB

    
    %% Migration and Sync Flows
    LGS -..->|Future Migration| DBS
    
    %% Styling for dark mode
    classDef serviceNode fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#e2e8f0
    classDef storageNode fill:#1a202c,stroke:#2d3748,stroke-width:2px,color:#cbd5e0
    classDef dataNode fill:#2c5282,stroke:#3182ce,stroke-width:2px,color:#e2e8f0
    classDef appNode fill:#553c9a,stroke:#7c3aed,stroke-width:2px,color:#f7fafc
    classDef fallbackNode fill:#d69e2e,stroke:#f6ad55,stroke-width:2px,color:#1a202c
    
    class SWS,DBS serviceNode
    class LGS fallbackNode
    class CS,LS,IDB storageNode
    class KV,TBL,LEG dataNode
    class APP,WEB,MOB appNode
```

SubWallet Extension currently uses 3 types of storage:

#### Storage Types
- **Chrome Storage**: Extension-specific storage that saves key-value pairs. Not available in web environments.
- **Local Storage**: Simple key-value storage. Cannot store information for web-runner and service worker environments.
- **IndexedDB**: Advanced storage available across all environments.

#### Storage Implementation Patterns

##### SWStorage (Unified Simple Storage)
Creates simple key-value storage with automatic platform adaptation:
- Automatically applies localStorage or IndexedDB depending on the specific platform
- Provides consistent API across different environments
- Handles platform detection and fallback mechanisms
- Acts as the underlying storage layer for Legacy Stores in web and mobile environments

##### Legacy Stores
Direct usage of Chrome Storage for value storage with cross-platform fallback support:
- Inherited form from **Polkadot{.js} extension** and related modules
- **Legacy storage** pattern still used by older components
- **Browser Extension**: Uses Chrome Storage API directly with prefix-based organization
- **Web App & Mobile App**: Uses fallback mechanism through SWStorage when Chrome Storage is unavailable
- Fallback implementation creates Chrome Storage API compatibility layer using SWStorage

##### Database Service (Modern Approach)
Registers databases in `IndexedDB` format:
- New storage pattern commonly applied for newly deployed services
- Supports migration and many other advanced methods
- Structured data storage with schema versioning
- Transaction support and complex queries

#### Migration Roadmap

**Current State:**
- **SW Storage**: Continue to be used for simple storage needs
- **Legacy Store → Database Service**: Transition legacy stores to Database Service
- **Database Service Optimization**: Restructure database service and usage patterns for clearer and more transparent architecture

**Future Enhancements:**
- **Messaging-based Storage**: Add storage accessible through messaging to meet injection storage needs via mobile instead of web
- **Unified Storage Interface**: Develop consistent storage interface across all platforms
- **Performance Optimization**: Implement advanced caching and optimization strategies


### Chrome Storage Fallback Mechanism

The fallback mechanism enables Legacy Stores to work seamlessly across all platforms by providing Chrome Storage API compatibility when the native Chrome APIs are not available.


**Cross-Platform Compatibility:**
- **Browser Extension**: Legacy Stores use native `chrome.storage.local` directly
- **Web App**: Fallback creates `global.chrome.storage` using SWStorage → LocalStorage
- **Mobile App**: Fallback creates `global.chrome.storage` using SWStorage → IndexedDB
- **Service Worker**: Fallback creates `global.chrome.storage` using SWStorage → IndexedDB

**Key Benefits:**
- Legacy code requires no modification to work across platforms
- Consistent API interface regardless of underlying storage technology
- Automatic platform detection and appropriate storage selection
- Transparent data serialization/deserialization (JSON handling)
- Error handling and callback compatibility with Chrome Storage API

---

## Legacy Storage - Chrome Storage API

### Overview

Legacy Storage represents the original storage pattern inherited from Polkadot{.js} extension. It provides a simple, prefix-based key-value storage system that maintains compatibility across all SubWallet Extension platforms through fallback mechanisms.

#### Key Characteristics
- **Origin**: Inherited from Polkadot{.js} extension architecture
- **Pattern**: Prefix-based key organization with reactive subjects
- **API Style**: Callback-based Chrome Storage API compatibility
- **Cross-Platform**: Automatic fallback to SWStorage when Chrome Storage unavailable
- **Data Types**: Supports complex objects with automatic JSON serialization

#### Architecture Overview

```mermaid
graph TB
    subgraph "Legacy Store Components"
        BS[BaseStore<T>]
        KS[KeyringStore]
        MS[MetadataStore]
        AS[AccountsStore]
        SS[SettingsStore]
        AUS[AuthorizeStore]
    end
    
    subgraph "Platform Implementation"
        direction LR
        CSA[Chrome Storage API<br/>Browser Extension]
        FB[Fallback Layer<br/>Web & Mobile]
    end
    
    subgraph "Underlying Storage"
        CS[Chrome Storage<br/>Native API]
        SWS[SWStorage<br/>Unified Layer]
    end
    
    %% Store inheritance
    BS --> KS
    BS --> MS
    BS --> AS
    BS --> SS
    BS --> AUS
    
    %% Platform routing
    KS -.->|Extension| CSA
    KS -.->|Web/Mobile| FB
    MS -.->|Extension| CSA
    MS -.->|Web/Mobile| FB
    AS -.->|Extension| CSA
    AS -.->|Web/Mobile| FB
    
    %% Implementation
    CSA --> CS
    FB --> SWS
    
    %% Styling
    classDef storeNode fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#e2e8f0
    classDef platformNode fill:#d69e2e,stroke:#f6ad55,stroke-width:2px,color:#1a202c
    classDef storageNode fill:#1a202c,stroke:#2d3748,stroke-width:2px,color:#cbd5e0
    
    class BS,KS,MS,AS,SS,AUS storeNode
    class CSA,FB platformNode
    class CS,SWS storageNode
```

### Implementation Pattern

#### Core BaseStore Structure
Read more in file [BaseStore](../../stores/Base.ts)

### Common Legacy Store Types

The following are the main legacy stores currently used in SubWallet Extension:

#### Core Account Management
- **[KeyringStore](../../stores/Keyring.ts)** - Manages encrypted keyring data and password storage for account security
- **[AccountsStore](../../stores/Accounts.ts)** - Stores account information, metadata, and testing account filtering
- **[CurrentAccountStore](../../stores/CurrentAccountStore.ts)** - Tracks currently selected account state across the application
- **[AccountProxyStore](../../stores/AccountProxyStore.ts)** - Manages proxy account relationships and delegation settings
- **[AccountRef](../../stores/AccountRef.ts)** - Manages account reference data and relationships for unified account

#### Application Settings & Configuration  
- **[Application](../../stores/Application.ts)** - Stores application-level state and global settings
- **[SettingsStore](../../stores/Settings.ts)** - Stores user preferences, application settings, and configuration options
- **[EnvironmentStore](../../stores/EnvironmentStore.ts)** - Manages environment-specific configurations and feature flags
- **[CurrentCurrencyStore](../../stores/CurrentCurrencyStore.ts)** - Tracks selected currency for price display and calculations

#### Security & Authorization
- **[AuthorizeStore](../../stores/Authorize.ts)** - Manages authorized URLs and dApp connection permissions
- **[PassPhishingStore](../../stores/PassPhishingStore.ts)** - Stores anti-phishing configuration and trusted sites

#### Blockchain Data & Metadata
- **[MetadataStore](../../stores/Metadata.ts)** - Caches blockchain runtime metadata for transaction processing
- **[ChainlistStore](../../stores/ChainlistStore.ts)** - Manages supported blockchain networks and their configurations
- **[AssetSetting](../../stores/AssetSetting.ts)** - Stores token and asset configuration settings
- **[DetectAccountBalance](../../stores/DetectAccountBalance.ts)** - Handles account balance detection and monitoring

#### Transaction Management
- **[TransactionHistory](../../stores/TransactionHistory.ts)** - Legacy transaction history storage (deprecated)
- **[TransactionHistoryV3](../../stores/TransactionHistoryV3.ts)** - Enhanced transaction history with improved structure
- **[ModifyPairStore](../../stores/ModifyPairStore.ts)** - Manages transaction pair modifications and edits

All legacy stores extend from **[BaseStore](../../stores/Base.ts)** which provides the foundational Chrome Storage API integration with automatic fallback support for cross-platform compatibility.

#### Platform-Specific Implementation
Implement fallback in non Service Worker environment
Read more in files:
- [Web Runner Fallback](../../../../web-runner/src/fallback.ts)
- [WebApp Fallback](../../../../webapp/src/fallback.ts)

### Methods

#### Chrome Storage Operations

##### `get(key: string, update: (value: T) => void): void`
**Description**: Retrieves value from Chrome storage with callback
- **Input Parameters**:
  - `key` - Storage key with prefix applied
  - `update` - Callback function receiving the value
- **Implementation**: Uses chrome.storage.local.get() or fallback equivalent
- **Error Handling**: Uses Chrome runtime error handling with console logging

##### `set(key: string, value: T, update?: () => void): void`
**Description**: Sets value in Chrome storage
- **Input Parameters**:
  - `key` - Storage key with prefix applied  
  - `value` - Value to store (automatically JSON serialized)
  - `update` - Optional callback on completion
- **Implementation**: Uses chrome.storage.local.set() or fallback equivalent
- **Error Handling**: Chrome runtime error logging with optional callback

##### `allMap(update: (value: Record<string, T>) => void): void`
**Description**: Retrieves all values with specific prefix
- **Input**: Callback function receiving all values as map
- **Implementation**: 
  - Gets all keys from storage
  - Filters by store prefix
  - Returns organized key-value map
- **Error Handling**: Filters by prefix and handles Chrome storage errors

#### Store Management Methods

##### `subject.subscribe(callback: (value: T) => void): Subscription`
**Description**: Subscribe to reactive data stream
- **Input**: Callback function for data updates
- **Output**: RxJS subscription object
- **Usage**: Real-time updates when storage changes

##### `subject.next(value: T): void`
**Description**: Emit new value to all subscribers
- **Input**: New value to broadcast
- **Usage**: Notify components of data changes

##### `initialize(): Promise<void>`
**Description**: Load initial data and set up reactivity
- **Implementation**: 
  - Load existing data from storage
  - Initialize reactive subject
  - Set up change listeners
- **Error Handling**: Graceful fallback to default values

---

## Storage Service - IndexedDB

### Overview

The Storage Service represents the modern approach to data storage in SubWallet Extension, utilizing IndexedDB through the Dexie wrapper for structured, high-performance data management. This service handles all complex data operations including blockchain transactions, account balances, NFT collections, and metadata storage with full ACID transaction support.

#### Key Characteristics
- **Technology**: IndexedDB with Dexie wrapper for enhanced functionality
- **Scope**: Large-scale structured data storage and complex queries
- **Platform**: Available across all platforms (Browser Extension, Web App, Mobile)
- **Performance**: Optimized for high-volume data operations with indexing strategies
- **Schema Management**: Versioned schema with automatic migration support

#### Architecture Overview

```mermaid
graph TB
    subgraph "Application Layer"
        APP[Application Components]
        SRV[Services Layer]
    end
    
    subgraph "Database Service Layer"
        DS[DatabaseService]
        ST[Store Collections]
    end
    
    subgraph "Store Categories"
        direction TB
        FDS[Financial Data Stores<br/>Price, Balance, Transaction]
        NDS[NFT Data Stores<br/>NFT, NFT Collections]
        SDS[Staking Data Stores<br/>Staking, Yield, Crowdloan]
        MDS[Metadata Stores<br/>Chain, Asset, Runtime Metadata]
        SSS[Specialized Stores<br/>MantaPay, Campaign, Notifications]
    end
    
    subgraph "Storage Implementation"
        DX[Dexie Database<br/>IndexedDB Wrapper]
        IDB[IndexedDB<br/>Browser Native Storage]
    end
    
    %% Application to Service
    APP --> DS
    SRV --> DS
    
    %% Service to Stores
    DS --> ST
    ST --> FDS
    ST --> NDS
    ST --> SDS
    ST --> MDS
    ST --> SSS
    
    %% Implementation
    FDS --> DX
    NDS --> DX
    SDS --> DX
    MDS --> DX
    SSS --> DX
    DX --> IDB

    
    %% Styling
    classDef serviceNode fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#e2e8f0
    classDef storeNode fill:#2c5282,stroke:#3182ce,stroke-width:2px,color:#e2e8f0
    classDef implNode fill:#1a202c,stroke:#2d3748,stroke-width:2px,color:#cbd5e0
    
    class DS,ST serviceNode
    class FDS,NDS,SDS,MDS,SSS storeNode
    class DX,IDB implNode
```

### Implementation Architecture

### Properties

```typescript
interface DatabaseService {
  // Core database connection
  db: Dexie;                           // Main Dexie database instance
  version: number;                     // Current schema version (11)
  isReady: boolean;                   // Service initialization status
  
  // Store collections organized by functional domain
  stores: {
    // Core data stores - Primary user data
    price: PriceStore;                 // Real-time and historical token prices
    balance: BalanceStore;             // Multi-chain account balance tracking
    nft: NftStore;                     // Individual NFT items and metadata
    nftCollection: NftCollectionStore; // NFT collection information
    crowdloan: CrowdloanStore;        // Parachain crowdloan participation
    staking: StakingStore;            // Native staking positions and rewards
    transaction: TransactionStore;     // Complete transaction history
    
    // Metadata stores - Configuration and reference data
    metadata: MetadataStore;          // Chain runtime metadata cache
    metadataV15: MetadataV15Store;    // Latest metadata format support
    chain: ChainStore;                // Blockchain network configurations
    asset: AssetStore;                // Token and asset definitions
    
    // Yield farming stores - DeFi functionality
    yieldPoolInfo: YieldPoolStore;    // Available yield farming pools
    yieldPosition: YieldPositionStore; // User positions in yield pools
    
    // Staking metadata - Enhanced staking functionality
    chainStakingMetadata: ChainStakingMetadataStore; // Per-chain staking parameters
    nominatorMetadata: NominatorMetadataStore;       // Nominator performance data
    
    // Specialized stores - Advanced features
    mantaPay: MantaPayStore;          // Privacy protocol transaction ledger
    campaign: CampaignStore;          // Marketing campaign tracking
    inappNotification: InappNotificationStore; // Application notification system
    processTransactions: ProcessTransactionStore; // Transaction processing queue
  };
  
  // Service configuration
  config: {
    transactionTimeout: number;        // Database transaction timeout (10s)
    bulkOperationSize: number;        // Bulk operation batch size (100)
    backupInterval: number;           // Automatic backup interval (24h)
    maintenanceInterval: number;      // Database maintenance cycle (24h)
  };
}
```

### Database Examples
Check more in [stores](db-stores)

### Advanced Database Features

### Migration
Readmore in [Migration Sevice](../migration-service)

### Indexing Strategy
- **Primary Keys**: Unique identifiers (slug, address combinations)
- **Compound Indexes**: `[tokenSlug+address]`, `[address+chain]`
- **Search Indexes**: name, symbol, chain fields
- **Performance Indexes**: Frequently queried combinations



## SWStorage

### Overview

SWStorage is a unified simple storage layer that provides consistent key-value storage across all SubWallet Extension platforms. It automatically adapts to the available storage technologies on each platform while maintaining a single, promise-based API interface.

#### Key Characteristics
- **Unified API**: Single interface for all platforms with automatic storage selection
- **Cross-Platform**: Works seamlessly on Browser Extension, Web App, and Mobile platforms
- **Async Operations**: Promise-based methods for consistent asynchronous handling
- **In-Memory Cache**: Maintains local cache for performance optimization
- **Automatic Fallback**: Intelligent selection between localStorage and IndexedDB

#### Architecture Overview
```mermaid
graph TB
    subgraph "Application Layer"
        APP[Application Components]
        LS[Legacy Stores]
        SRV[Services Layer]
    end
    
    subgraph "SWStorage Layer"
        direction TB
        SWS["[[SWStorage Service]]<br/>Unified Storage Interface"]
        CACHE[In-Memory Cache<br/>_storage: Record&lt;string, string&gt;]
    end
    
    subgraph "Platform Detection"
        PD[Platform Detector<br/>hasLocalStorage check]
    end
    
    subgraph "Storage Implementation"
        direction LR
        LST[LocalStorage<br/>Web Browsers<br/>Synchronous API]
        KVD[KeyValue Database<br/>IndexedDB Table<br/>Mobile/Fallback]
    end
    
    subgraph "Initialization Flow"
        direction TB
        INIT[Constructor]
        SYNC["sync() Method"]
        READY[isReady = true]
    end
    
    %% Application to SWStorage
    APP --> SWS
    LS --> SWS
    SRV --> SWS
    
    %% SWStorage internal flow
    SWS --> CACHE
    SWS --> PD
    
    %% Platform detection to storage
    PD -.->|hasLocalStorage = true| LST
    PD -.->|hasLocalStorage = false| KVD
    
    %% Data flow
    SWS -.->|Read/Write| LST
    SWS -.->|Read/Write| KVD
    CACHE -.->|Sync Data| LST
    CACHE -.->|Sync Data| KVD
    
    %% Initialization
    INIT --> SYNC
    SYNC --> READY
    SYNC -.->|Load Data| LST
    SYNC -.->|Load Data| KVD
    
    %% Styling
    classDef serviceNode fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#e2e8f0
    classDef cacheNode fill:#2c5282,stroke:#3182ce,stroke-width:2px,color:#e2e8f0
    classDef storageNode fill:#1a202c,stroke:#2d3748,stroke-width:2px,color:#cbd5e0
    classDef initNode fill:#553c9a,stroke:#7c3aed,stroke-width:2px,color:#f7fafc
    classDef appNode fill:#d69e2e,stroke:#f6ad55,stroke-width:2px,color:#1a202c
    
    class SWS serviceNode
    class CACHE cacheNode
    class LST,KVD storageNode
    class INIT,SYNC,READY,PD initNode
    class APP,LS,SRV appNode
```

### Implementation Pattern

#### Cross-Platform Storage Flow
- **Web Browser**: SWStorage → localStorage (synchronous, 5-10MB limit)
- **Mobile/Service Worker**: SWStorage → IndexedDB KeyValue table (asynchronous, large capacity)
- **Extension Context**: Can use either depending on environment availability

#### Key Benefits
- **Consistent API**: Same methods work across all platforms
- **Performance**: In-memory cache reduces storage calls
- **Reliability**: Automatic fallback ensures storage always works
- **Simplicity**: Hides platform complexity from application code

### Properties
```typescript
interface SWStorage {
  _storage: Record<string, string>;        // In-memory cache
  localStorage?: Storage;                  // Browser localStorage reference
  kvDatabase: Table<IKeyValue, object>;   // IndexedDB fallback
  isReady: boolean;                       // Initialization status
  waitReadyHandler: PromiseHandler;       // Async initialization
}
```

### Methods

#### Basic Storage Operations

`setItem(key: string, value: string): Promise<void>`
**Description**: Sets a key-value pair in unified storage
- **Input Parameters**:
  - `key` - Storage key
  - `value` - String value to store
- **Output**: Promise resolving when storage completes
- **Error Handling**: Falls back to IndexedDB if localStorage fails

`getItem(key: string): Promise<string | null>`
**Description**: Retrieves value by key from unified storage
- **Input**: Storage key
- **Output**: Stored value or null if not found
- **Error Handling**: Returns null for missing keys or errors

`removeItem(key: string): Promise<void>`
**Description**: Removes key-value pair from storage
- **Input**: Storage key to remove
- **Output**: Promise resolving when removal completes
- **Error Handling**: Continues silently if key doesn't exist

#### Bulk Operations

`setMap(map: Record<string, string>): Promise<void>`
**Description**: Sets multiple key-value pairs in single operation
- **Input**: Object map of key-value pairs
- **Output**: Promise resolving when bulk operation completes
- **Error Handling**: Partial success handling for individual items

`getMap(keys: string[]): Promise<Record<string, string | null>>`
**Description**: Retrieves multiple values by keys
- **Input**: Array of keys to retrieve
- **Output**: Object map with keys and their values (or null)
- **Error Handling**: Returns null for missing keys

`removeItems(keys: string[]): Promise<void>`
**Description**: Removes multiple keys in bulk operation
- **Input**: Array of keys to remove
- **Output**: Promise resolving when bulk removal completes
- **Error Handling**: Continues with remaining keys on individual failures

#### Administrative Operations

`clear(): Promise<void>`
**Description**: Clears all data from storage
- **Output**: Promise resolving when clear operation completes
- **Error Handling**: Ensures proper cleanup of all storage layers

`keys(): Promise<string[]>`
**Description**: Returns all available keys in storage
- **Output**: Array of all storage keys
- **Error Handling**: Returns empty array on errors

`copy(): Promise<Record<string, string>>`
**Description**: Creates complete copy of storage data
- **Output**: Complete storage data as object
- **Error Handling**: Returns empty object on copy failures

---

## Special Features
### Backup and Restore

The Backup and Restore system addresses iOS browser storage clearing issues starting from version 16.0 when changing Web Runner links. This system provides seamless data recovery through cross-platform communication between Mobile App and Web Runner.

#### Restore Flow on Mobile

The restore process is initiated when Web Runner detects empty storage, typically after iOS clears browser data.

```mermaid
sequenceDiagram
    participant MOB as Mobile App
    participant WR as Web Runner
    participant DB as IndexedDB
    participant SWS as SWStoreage
    
    Note over WR: Restore Process Flow
    
    WR->>WR: Check if storage is empty
    alt Storage is empty
        WR->>MOB: Request restore data
        WR->>WR: Create Wait Backup Promise
        Note over WR,MOB: Cross-platform messaging
        
        MOB->>MOB: Check backup availability
        alt Backup exists
            MOB->>WR: Send backup data
            Note over MOB,WR: JSON serialized backup
            
            WR->>DB: Clear existing data
            WR->>DB: Import backup data
            WR->>SWS: Import backup data
        else No backup available
            MOB->>WR: No backup found
        end
    end
    WR->>WR: Resolve Wait Backup Promise
    WR->>WR: Initialize app with restored data
```

#### Backup Flow

The backup process runs periodically and on demand to ensure data safety across platform transitions.

```mermaid
sequenceDiagram
    participant MOB as Mobile App
    participant WR as Web Runner  
    participant DB as IndexedDB
    participant STORE as SWStorage
    
    Note over MOB,STORE: Backup Process Flow
    
    MOB->>MOB: Listen for backup trigger
    Note over MOB: Periodic or manual trigger
    
    MOB->>WR: Request backup data
    Note over MOB,WR: Cross-platform messaging
    
    WR->>DB: Export backup tables
    DB-->>WR: Return serialized data
    Note over DB,WR: tables in DEXIE_BACKUP_TABLES
    WR->>STORE: Export backup storage
    STORE->>WR: Return serialized data
    WR->>WR: Combine Data
    
    WR->>MOB: Send backup data
    Note over WR,MOB: JSON compressed data
    
    MOB->>MOB: Save backup data
```
