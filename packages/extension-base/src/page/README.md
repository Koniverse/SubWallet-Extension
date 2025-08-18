# dApp Providers Documentation

## Overview

The Page Providers system enables web applications (dApps) to interact with the SubWallet extension across multiple blockchain protocols. It provides a standardized interface for dApps to access wallet functionality including account management, transaction signing, and network operations.

**Purpose**: Client-side provider injection for seamless dApp-wallet integration  
**Scope**: Multi-chain provider support, standardized APIs, and secure communication protocols

## Architecture

### High-Level Structure

```mermaid
graph TD
    subgraph "[[Page Provider System]]"
        direction TB
        
        PI[Page Index] --> SM[Send Message]
        PI --> HR[Handle Response]
        
        PI --> SP[Substrate Provider]
        PI --> EP[EVM Provider]
        PI --> CP[Cardano Provider]
        PI --> BP[Bitcoin Provider]
        
        SP --> SA[Substrate APIs]
        EP --> EA[EVM APIs]
        CP --> CA[Cardano APIs]
        BP --> BA[Bitcoin APIs]
        
        SA --> ACC[Accounts]
        SA --> META[Metadata]
        SA --> SIGN[Signer]
        SA --> PROV[PostMessage Provider]
        
        EA --> EVMREQ[EVM Requests]
        EA --> EVMEVT[EVM Events]
        EA --> EVMSIGN[EVM Signing]
        
        CA --> CIP30[CIP30 API]
        CA --> CARDADDR[Address Management]
        CA --> CARDTX[Transaction Handling]
        
        BA --> BTCADDR[Address Management]
        BA --> BTCSIGN[Message Signing]
        BA --> BTCTX[Transaction Handling]
    end
    
    subgraph "Background Extension"
        direction TB
        TABS[KoniTabs Handler]
        STATE[KoniState]
        CHAIN[Chain Services]
    end
    
    subgraph "dApp Interface"
        direction TB
        WEBAPP[Web Application]
        WINDOW[Window.ethereum/cardano/etc]
        INJECT[Injected APIs]
    end
    
    PI -.->|postMessage| TABS
    TABS -.->|response| PI
    
    WEBAPP --> WINDOW
    WINDOW --> INJECT
    INJECT --> PI
    
    TABS --> STATE
    STATE --> CHAIN
    
    classDef provider fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef api fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef background fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dapp fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    
    class PI,SP,EP,CP,BP provider
    class SA,EA,CA,BA,ACC,META,SIGN,PROV,EVMREQ,EVMEVT,EVMSIGN,CIP30,CARDADDR,CARDTX,BTCADDR,BTCSIGN,BTCTX api
    class TABS,STATE,CHAIN background
    class WEBAPP,WINDOW,INJECT dapp
```

### Communication Flow

```mermaid
sequenceDiagram
    participant dApp as Web Application
    participant Provider as Page Provider
    participant Loader as Content Script
    participant Background as Extension Background
    
    dApp->>Provider: Call API Method
    Provider->>Provider: Create Message ID
    Provider->>Loader: postMessage(request)
    Loader->>Background: chrome.runtime.sendMessage
    
    Background->>Background: Process Request
    Background->>Background: User Interaction (if needed)
    Background->>Loader: Response/Event
    
    Loader->>Provider: postMessage(response)
    Provider->>Provider: Match Message ID
    Provider->>dApp: Resolve Promise/Emit Event
    
    Note over dApp,Background: Subscription Handling
    Background->>Loader: Subscription Update
    Loader->>Provider: postMessage(subscription)
    Provider->>dApp: Emit Event/Call Callback
```

### Component Roles

#### Core Infrastructure

- **[Page Index](./index.ts)**: Main entry point and message orchestration
- **[Types](./types.ts)**: TypeScript interfaces for provider communication
- **[KoniTabs Handler](../koni/background/handlers/Tabs.ts)**: Background message processing

#### Protocol-Specific Providers

- **[Substrate Provider](./substrate/index.ts)**: Polkadot ecosystem integration
- **[EVM Provider](./evm/index.ts)**: Ethereum-compatible chain support
- **[Cardano Provider](./cardano/index.ts)**: Cardano blockchain integration
- **[Bitcoin Provider](./bitcoin/index.ts)**: Bitcoin network support

## Props

### Core Provider Properties

| Name | Purpose | Type |
|------|---------|------|
| `handlers` | Message handler registry | `Record<string, Handler>` |
| `sendMessage` | Message communication function | `SendRequest` |
| `version` | Provider version identifier | `string` |
| `isSubWallet` | SubWallet identification flag | `boolean` |

*Reference: [Page index handler registry](./index.ts#L31-L35)*

### SendRequest Interface

| Name | Purpose | Type |
|------|---------|------|
| `message` | Message type identifier | `MessageTypes` |
| `request` | Request payload data | `RequestTypes[TMessageType]` |
| `subscriber` | Subscription callback function | `(data: SubscriptionMessageTypes) => void` |

*Reference: [SendRequest type definition](./types.ts#L5-L9)*

### Provider-Specific Properties

#### Substrate Provider Properties
| Name | Purpose | Type |
|------|---------|------|
| `accounts` | Account management interface | `Accounts` |
| `metadata` | Chain metadata operations | `Metadata` |
| `provider` | RPC provider interface | `PostMessageProvider` |
| `signer` | Transaction signing interface | `Signer` |

*Reference: [Substrate provider implementation](./substrate/index.ts#L12-L19)*

#### EVM Provider Properties
| Name | Purpose | Type |
|------|---------|------|
| `isMetaMask` | MetaMask compatibility flag | `boolean` |
| `version` | Provider version string | `string` |
| `chainId` | Current chain identifier | `string` |
| `connected` | Connection status flag | `boolean` |

*Reference: [EVM provider interface](./evm/index.ts#L15-L25)*

## Methods

### Core Communication Methods

#### `sendMessage<TMessageType>(message, request?, subscriber?)`

**Purpose**: Universal message sending interface for dApp-extension communication  
**Input Parameters**:
- `message` (MessageTypes): Message type identifier
- `request` (RequestTypes, optional): Request payload
- `subscriber` (function, optional): Subscription callback

**Output**: Promise<ResponseTypes[TMessageType]>  
**Error Handling**: Rejects with ProviderError on communication failures

**Implementation Details**:
- Generates unique message ID for request tracking
- Uses postMessage for cross-context communication
- Supports both one-time requests and ongoing subscriptions
- Handles promise resolution/rejection based on response type

*Source: [sendMessage implementation](./index.ts#L37-L50)*

#### `handleResponse<TMessageType>(data)`

**Purpose**: Processes responses from extension background  
**Input**: TransportResponseMessage with response data  
**Output**: None (void)  
**Error Handling**: Routes errors to appropriate promise rejection

**Implementation Details**:
- Matches responses to pending requests using message ID
- Handles subscription data routing to callbacks
- Converts error responses to ProviderError instances
- Manages handler cleanup for completed requests

*Source: [handleResponse implementation](./index.ts#L87-L102)*

### Authentication and Authorization

#### `enable(origin, opt?)`

**Purpose**: Initiates connection between dApp and wallet  
**Input Parameters**:
- `origin` (string): dApp origin URL
- `opt` (AuthRequestOption, optional): Authentication options

**Output**: Promise<Injected> - Substrate provider instance  
**Error Handling**: Rejects if user denies authorization

**Implementation Details**:
- Supports multiple account authentication types
- Handles both substrate and EVM account access
- Triggers user authorization flow in extension
- Returns configured provider instance on success

*Source: [enable function](./index.ts#L54-L61)*

### Methods

#### Substrate Provider Methods

##### `accounts.get(anyType?)`
**Purpose**: Retrieves authorized substrate accounts  
**Input**: anyType (boolean, optional) - Include all account types  
**Output**: Promise<InjectedAccount[]>  
**Error Handling**: Returns empty array if not authorized

*Source: [Substrate accounts implementation](./substrate/Accounts.ts#L13-L15)*

##### `signer.signPayload(payload)`
**Purpose**: Signs substrate extrinsic payloads  
**Input**: SignerPayloadJSON - Transaction payload  
**Output**: Promise<SignerResult> - Signature and metadata  
**Error Handling**: Rejects if user cancels or signing fails

*Source: [Substrate signer implementation](./substrate/Signer.ts#L16-L26)*

#### EVM Provider Methods

##### `request<T>(args)`
**Purpose**: Universal EVM method execution interface  
**Input**: RequestArguments - Method and parameters  
**Output**: Promise<T> - Method-specific response  
**Error Handling**: Throws EvmProviderError for invalid requests

**Implementation Details**:
- Handles eth_requestAccounts with authorization flow
- Routes other methods to background processing
- Supports standard Ethereum JSON-RPC methods
- Manages wallet-specific method implementations

*Source: [EVM request implementation](./evm/index.ts#L65-L75)*

##### `send(methodOrPayload, callbackOrArgs?)`
**Purpose**: Legacy send interface for MetaMask compatibility  
**Input**: Method string or payload object with optional callback  
**Output**: Various - depends on call pattern  
**Error Handling**: Converts errors to callback format when applicable

*Source: [EVM send implementation](./evm/index.ts#L77-L87)*

#### Cardano Provider Methods

##### `enable()`
**Purpose**: Enables Cardano dApp connection  
**Input**: None  
**Output**: Promise<CIP30Api> - Cardano API interface  
**Error Handling**: Throws CardanoProviderError if access denied

*Source: [Cardano enable implementation](./cardano/index.ts#L21-L29)*

##### `isEnable()`
**Purpose**: Checks if Cardano provider is already enabled  
**Input**: None  
**Output**: Promise<boolean> - Enable status  
**Error Handling**: Returns false on any error

*Source: [Cardano isEnable implementation](./cardano/index.ts#L31-L35)*

#### Bitcoin Provider Methods

##### `requestAccounts()`
**Purpose**: Requests Bitcoin account access  
**Input**: None  
**Output**: Promise<BitcoinDAppAddress[]> - Available addresses  
**Error Handling**: Throws BitcoinProviderError on user rejection

*Source: [Bitcoin requestAccounts implementation](./bitcoin/index.ts#L18-L20)*

##### `signMessage(params)`
**Purpose**: Signs Bitcoin messages  
**Input**: BitcoinSignMessageParams - Message and address  
**Output**: Promise<BitcoinSignMessageResult> - Signature data  
**Error Handling**: Rejects with provider error on failure

*Source: [Bitcoin signMessage implementation](./bitcoin/index.ts#L26-L28)*

## Flows

### Provider Initialization Lifecycle

```mermaid
sequenceDiagram
    participant Page as Web Page
    participant Script as Content Script
    participant Provider as Page Provider
    participant Background as Extension Background
    
    Page->>Script: DOM Ready
    Script->>Script: Inject Provider Scripts
    Script->>Provider: Initialize Providers
    
    Provider->>Provider: Setup Message Handlers
    Provider->>Provider: Setup Event Emitters
    
    Page->>Provider: Access window.ethereum/cardano/etc
    Provider->>Page: Return Provider Interface
    
    Note over Page,Background: First API Call
    Page->>Provider: Call Provider Method
    Provider->>Background: Check Authorization
    
    alt Not Authorized
        Background->>Page: Show Authorization Popup
        Page->>Background: User Approves/Denies
        Background->>Provider: Authorization Result
    end
    
    Provider->>Background: Execute Request
    Background->>Provider: Return Response
    Provider->>Page: Return Result
```

### Subscription Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> RequestSubscription : dApp calls subscribe method
    RequestSubscription --> PendingAuth : Check authorization
    
    state PendingAuth {
        [*] --> CheckingAuth
        CheckingAuth --> Authorized : User authorized
        CheckingAuth --> Unauthorized : User not authorized
        Unauthorized --> [*]
    }
    
    Authorized --> ActiveSubscription : Create subscription
    
    state ActiveSubscription {
        [*] --> Listening
        Listening --> EmitEvent : Background sends update
        EmitEvent --> Listening : Continue listening
        Listening --> Cleanup : Unsubscribe requested
        Cleanup --> [*]
    }
    
    ActiveSubscription --> Idle : Subscription ended
    
    note right of ActiveSubscription
        Handles events like:
        - accountsChanged
        - chainChanged
        - connect/disconnect
    end note
```

### Error Handling Flow

```mermaid
flowchart TD
    Start([API Method Called]) --> CheckAuth{Authorized?}
    
    CheckAuth -->|No| AuthError[Throw Authorization Error]
    CheckAuth -->|Yes| ValidateParams{Valid Parameters?}
    
    ValidateParams -->|No| ParamError[Throw Parameter Error]
    ValidateParams -->|Yes| SendRequest[Send to Background]
    
    SendRequest --> ProcessBackground{Background Processing}
    
    ProcessBackground -->|Success| ReturnResult[Return Success Response]
    ProcessBackground -->|User Rejection| UserError[Throw User Rejection Error]
    ProcessBackground -->|Network Error| NetworkError[Throw Network Error]
    ProcessBackground -->|Internal Error| InternalError[Throw Internal Error]
    
    AuthError --> HandleError[Convert to Provider-Specific Error]
    ParamError --> HandleError
    UserError --> HandleError
    NetworkError --> HandleError
    InternalError --> HandleError
    
    HandleError --> RejectPromise[Reject Promise with Error]
    ReturnResult --> ResolvePromise[Resolve Promise with Result]
    
    RejectPromise --> End([dApp Handles Error])
    ResolvePromise --> End
    
    classDef error fill:#ffebee,stroke:#c62828
    classDef success fill:#e8f5e8,stroke:#2e7d32
    classDef process fill:#e3f2fd,stroke:#1565c0
    
    class AuthError,ParamError,UserError,NetworkError,InternalError,HandleError,RejectPromise error
    class ReturnResult,ResolvePromise success
    class CheckAuth,ValidateParams,SendRequest,ProcessBackground process
```

## Notes

### Supported Standards and Protocols

1. **Ethereum Standards**:
   - **EIP-1193**: Provider JavaScript API
   - **EIP-1102**: Provider discovery and authorization
   - **EIP-3085**: Add Ethereum Chain RPC Method
   - **EIP-3326**: Switch Ethereum Chain RPC Method

2. **Cardano Standards**:
   - **CIP-30**: dApp-Wallet Web Bridge

3. **Bitcoin Standards**:
   - **BIP-322**: Generic message signing
   - **PSBT**: Partially Signed Bitcoin Transactions

*Reference: Protocol implementations in respective provider directories*

### Security Considerations

1. **Origin Validation**: All requests validate origin URL against authorized domains
2. **User Authorization**: Critical operations require explicit user approval
3. **Message Validation**: Request/response validation prevents malicious payloads
4. **Context Isolation**: Providers run in isolated contexts to prevent interference

*Reference: [Authorization handling](../koni/background/handlers/Tabs.ts#L420-L450)*

### Future Improvements

1. **Multi-Provider Support**: Enable multiple wallets simultaneously
2. **Enhanced Events**: More granular event types for better dApp integration
3. **Performance Optimization**: Reduce message passing overhead for frequent operations
4. **Standards Compliance**: Enhanced compatibility with emerging web3 standards

### Integration Dependencies

- **[Extension Background](../background)**: Core wallet functionality and state management
- **[Content Scripts](../../content)**: Provider injection and message relay
- **[Chain Services](../services/chain-service)**: Blockchain-specific operations
- **[Keyring Service](../services/keyring-service)**: Account and key management

### Related Documentation

- **[Background Handlers](../background/handlers/README.md)**: Extension background architecture
- **[Request Service](../services/request-service)**: User confirmation flow management
- **[Chain Service](../services/chain-service)**: Multi-chain protocol support

*For detailed implementation specifics, see individual provider directories and their respective documentation*
