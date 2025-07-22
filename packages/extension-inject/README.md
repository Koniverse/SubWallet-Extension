# @subwallet/extension-inject

This is a basic extension injector that manages access to the global objects available. As an extension developer, you don't need to manage access to the window object manually, by just calling  enable here, the global object is setup and managed properly. From here any dapp can access it with the `@subwallet/extension-dapp` package;

## Usage

```ts
import { injectExtension } from '@subwallet/extension-inject';

// This a the function that will be exposed to be callable by the dapp. It resolves a promise
// with the injected interface, (see `Injected`) when the dapp at `originName` (url) is allowed
// to access functionality
function enable (originName: string, option?: AuthRequestOption ): Promise<Injected> {
  ...
}

// Additionally, this function provides an options parameter
// that allows DApps to actively request the desired address type of the unified account,
// including substrate format, evm format, or both.
interface AuthRequestOption {
  accountAuthType: 'substrate' | 'both' | 'evm';
}


// injects the extension into the page
injectExtension(enable, { name: 'myExtension', version: '1.0.1' });
```
