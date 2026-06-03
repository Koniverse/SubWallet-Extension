# SETUP — SubWallet-Extension local dev environment

> Local development setup: clone → install → build → run. Production
> runbook lives in `DEPLOY.md` (repo root, pending). Env var template is
> `.env.example` (repo root). New env vars land in SETUP + DEPLOY +
> `.env.example` in the same commit (koni-docs RULE-11).

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | **12** for the production build target (`.nvmrc`); **18+** (20 LTS recommended) for day-to-day dev | The Webpack build pins Node 12 for output compatibility; modern Node runs the dev tooling fine. Use `nvm` to switch. |
| Yarn | **3.x (berry)** — pinned via `packageManager` in `package.json` (`yarn@3.x`) and `.yarn/releases/` | **Never run `npm install`** — it corrupts the Yarn-managed workspace. |
| Git | any recent | Branch convention: `koni/dev/issue-<number>` (see `AGENTS.md` §6). |
| Browser | Chrome / Chromium or Firefox | For loading the unpacked extension build. |

Confirm your toolchain:

```bash
node -v        # 18.x / 20.x for dev (build target is 12 per .nvmrc)
yarn -v        # 3.x
```

---

## 2. Clone & install

```bash
git clone https://github.com/Koniverse/SubWallet-Extension.git
cd SubWallet-Extension
yarn install   # Yarn 3 workspaces — installs all packages/*
```

`yarn install` resolves the full monorepo (12 workspace packages under
`packages/*`). The first install runs `postinstall` automatically.

---

## 3. Environment variables

Copy the template and fill values (obtain real values from the SubWallet
team — the committed `.env.example` ships working defaults for some
public services):

```bash
cp .env.example .env
```

Variables consumed at build time, by category:

```bash
# Fiat on-ramp providers
TRANSAK_API_KEY=<transak-api-key>          # Transak buy-crypto widget
COINBASE_PAY_ID=<coinbase-pay-app-id>      # Coinbase Pay on-ramp
MELD_WIZARD_KEY=<meld-wizard-key>          # Meld fiat on-ramp

# SubWallet backend services
SUBWALLET_API=http://localhost:3000/api    # core SubWallet API base URL
SW_EXTERNAL_SERVICES_API=http://localhost:8787  # external services API base URL

# Feature endpoints
NFT_MINTING_HOST=<nft-minting-host-url>    # NFT minting service host
PATCH_CHAIN_LIST_URL=<chain-list-patch-url># runtime chain-list override URL
BTC_SERVICE_TOKEN=<bitcoin-service-token>  # Bitcoin service auth token

# Build metadata
BRANCH_NAME=master                          # branch tag baked into the build
```

> `.env.example` is the single source of truth for which env vars exist.
> Do not commit a populated `.env`.

---

## 4. Build

| Goal | Command |
|---|---|
| Build all packages | `yarn build` |
| Build extension UI bundle | `yarn build:ui` |
| Build the browser extension (dev) | `yarn build:koni-dev` |
| Build the web app | `yarn webapp:build` |
| Build the web-runner | `yarn web-runner:build` |
| Produce distributable zips | `yarn build:zip` |

The browser extension is compiled from `packages/extension-koni`
(background + popup + injected scripts). The web app and web-runner are
separate build outputs of the same `extension-base` core.

---

## 5. Run / develop

| Goal | Command |
|---|---|
| Watch + rebuild the extension during dev | `yarn watch-dev` |
| Start the web app dev server | `yarn webapp:dev` |
| Start the web-runner dev server | `yarn web-runner:dev` |
| Generic dev entry | `yarn dev` |

### Load the unpacked extension (Chrome)

1. `yarn build:koni-dev` (or `yarn watch-dev` for live rebuilds).
2. Open `chrome://extensions`, enable **Developer mode**.
3. **Load unpacked** → select the build output directory produced by the
   extension build (under `packages/extension-koni/build`).
4. Reload the extension after each rebuild (or use `watch-dev`).

---

## 6. Lint & test

```bash
yarn lint        # ESLint (.eslintrc.js) + Prettier (.prettierrc.cjs)
yarn lint:changes # lint only changed files
yarn test        # test suite
yarn test:one    # run a single test
```

Run `yarn lint` and `yarn test` before opening a PR. See `CONTRIBUTING.md`
for the full contributor workflow (no `--force` pushes; non-master
branches; all changes via PR; CI must pass before merge).

---

## 7. Reference

- `AGENTS.md` — canonical project guide (monorepo layout, tech stack, conventions).
- `CONTRIBUTING.md` — contributor rules and PR/review process.
- `README.md` — architecture concept (background / popup / injected scripts).
- `package.json` (root) `scripts` — the complete command list.
