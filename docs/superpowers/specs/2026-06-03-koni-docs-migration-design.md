# Koni-docs migration — Design spec (sub-tasks 2 + 3)

| Field | Value |
| --- | --- |
| Date | 2026-06-03 |
| Type | design-spec |
| Status | draft (awaiting human review) |
| Covers | sub-task 2 (`docs/*` foundation) + sub-task 3 (issue → story/epic migration) |
| Predecessor | `docs/superpowers/specs/2026-06-02-koni-docs-integration-design.md` (sub-task 1) |
| Branch | `ai-development` (continuation of sub-task 1, single open PR) |
| Next artifact | `docs/superpowers/plans/2026-06-03-koni-docs-migration.md` (writing-plans output) |
| Handoff mode | B — AI-driven, human review per commit |

---

## 1. Context

Sub-task 1 shipped the koni-docs skeleton on this same branch:

- `AGENTS.md` (213 lines, canonical AI-agent guide)
- `CLAUDE.md` (thin pointer + Koni-docs Integration block)
- `.active-context.example.md` (Pattern B template)
- `VERSION` (1.3.79)
- `skills-lock.json` (koni-docs skill installed from Koniverse/Koni-Skills)
- `.gitignore` updated for `.active-context.md`

This spec covers everything between that skeleton and a fully populated koni-docs canon: `docs/BRIEF.md` through `docs/sprints/STATUS.md`, plus the operational scaffolding (sprint files) that needs human input to bootstrap.

---

## 2. Goal

Convert raw inputs (Notion exports, public website, codebase, full GitHub history, full git log) into the canonical `docs/` artifacts required by koni-docs, executing **as much as possible via AI agents** with **per-commit human review** on the existing PR. Items that AI cannot reasonably autonomously decide (sprint allocation, version reconciliation strategy, past-sprint mapping) are NOT skipped — they become **explicit input gates** in the Plan where the agent stops, prompts the user, and resumes with structured input.

---

## 3. High-level pipeline (single overview)

```mermaid
flowchart TB
    subgraph SOURCES["📥 SOURCES"]
        direction LR
        EXT["🔒 External — private<br/>Notion export<br/>Website scrape<br/>Internal decks"]
        REPO["📂 Repo files<br/>packages/, README<br/>CONTRIBUTING<br/>package.json"]
        GH["🐙 GitHub — ALL issues<br/>open + closed + comments<br/>+ linked PRs"]
        GIT["📜 Git log — full history<br/>commits + merges + tags"]
    end

    subgraph STAGING["🗂 tmp/  (gitignored, never public)"]
        direction TB
        RAW["tmp/raw/<br/>{notion, github, git}"]
        INTAKES["⚙️ Intake-A (vision)<br/>⚙️ Intake-B (operational, chunked)"]
        CAN1(["tmp/canonical/vision-and-strategy.md"])
        CAN2(["tmp/canonical/product-history.md"])
        RECON["⚙️ Reconciliation"]
        TAX(["tmp/canonical/taxonomy-v1.md<br/>+ taxonomy-reconciliation-report.md"])
        RAW --> INTAKES
        INTAKES --> CAN1
        INTAKES --> CAN2
        CAN1 --> RECON
        CAN2 --> RECON
        RECON --> TAX
    end

    G1{"⚠ G1 — taxonomy review"}

    subgraph SA["🟦 Stream A — Foundation docs (Waves 1-3)"]
        direction LR
        A1["BRIEF"]
        A2["PRD"]
        A3["ARCH"]
        A4["CONTEXT"]
        A5["LESSONS"]
        A6["SETUP"]
        A7["CHANGELOG"]
    end

    G2{"⚠ G2 — PRD review"}

    subgraph SB["🟩 Stream B — Issue → backlog (Waves 3-5)"]
        direction LR
        B1["B1 Triage"]
        B2["B2 Epic"]
        B3["B3 Story"]
    end

    subgraph W6["🟪 Wave 6 — Sprint system bootstrap (interactive)"]
        direction LR
        I1["I1 + S6a:<br/>packages/* version"]
        I2["I2 + S6b + I2b + S6c:<br/>past sprints"]
        I3["I3 + S6d:<br/>first active sprint"]
    end

    G3{"⚠ G3 — final integration"}

    subgraph TGT["✅ TARGETS — committed to repo"]
        direction LR
        TDOCS["docs/{BRIEF,PRD,ARCH,<br/>CONTEXT,LESSONS,SETUP}.md<br/>CHANGELOG.md (root)"]
        TSPR["docs/sprints/<br/>{epics, stories, STATUS}<br/>+ sprint-YYYY-WNN.md"]
    end

    EXT --> RAW
    GH --> RAW
    GIT --> RAW
    REPO --> SA

    TAX --> G1
    G1 --> SA
    TAX --> SB
    CAN1 --> SA
    CAN2 --> SA
    CAN2 --> SB

    A2 --> G2
    G2 --> B3

    SA --> TDOCS
    B3 --> W6
    W6 --> G3
    G3 --> TSPR

    classDef private fill:#ffe4e1,stroke:#d33,color:#000
    classDef public fill:#e0f2e0,stroke:#070,color:#000
    classDef pipeline fill:#fff3bf,stroke:#a80,color:#000
    classDef gate fill:#cfe2ff,stroke:#06c,color:#000
    classDef inputgate fill:#e9d5ff,stroke:#7c3aed,color:#000
    class EXT,RAW,CAN1,CAN2,TAX private
    class REPO,TDOCS,TSPR public
    class INTAKES,RECON,A1,A2,A3,A4,A5,A6,A7,B1,B2,B3 pipeline
    class G1,G2,G3 gate
    class I1,I2,I3,W6 inputgate
```

---

## 4. Source data

Every downstream artifact must trace back to one of these five sources. No artifact may be invented without citation.

```mermaid
flowchart LR
    subgraph PRIV["🔒 Private sources"]
        S1["Notion export"]
        S2["Website scrape<br/>(subwallet.app, koni.studio)"]
        S3["Internal decks (optional)"]
    end

    subgraph PUB["🟢 Public sources (repo + GH)"]
        S4["Codebase<br/>packages/*, configs"]
        S5["Repo metadata<br/>README, CONTRIBUTING<br/>package.json, VERSION"]
        S6["GitHub issues<br/>open + closed + comments"]
        S7["GitHub PRs linked<br/>to issues"]
        S8["Git log full history<br/>commits + tags"]
    end

    S1 --> N1["vision-and-strategy.md"]
    S2 --> N1
    S3 --> N1

    S6 --> N2["product-history.md"]
    S7 --> N2
    S8 --> N2

    S4 --> D1["ARCHITECTURE.md, SETUP.md"]
    S5 --> D1
    S5 --> D2["CHANGELOG.md, PRD §FR"]
    S8 --> D2

    classDef priv fill:#ffe4e1,stroke:#d33
    classDef pub fill:#e0f2e0,stroke:#070
    class S1,S2,S3 priv
    class S4,S5,S6,S7,S8 pub
```

Source authority ranking when conflicts arise (e.g., Notion says "we support Solana", codebase does not):

```mermaid
flowchart LR
    A["Codebase / git tag"] -->|"is reality"| B["product-history.md"]
    C["Notion / website"] -->|"is intent"| D["vision-and-strategy.md"]
    B -->|"feeds 'shipped' status"| E["PRD Functional Requirements"]
    D -->|"feeds 'planned' status"| E
    E -->|"if mismatch:<br/>codebase wins for 'shipped',<br/>vision wins for 'planned'"| F["Resolution rule"]
```

---

## 5. Storage convention — `tmp/` discipline

All sensitive raw + intermediate artifacts stay in `tmp/`, which is **gitignored**. Public repo only ever sees `docs/*` and `CHANGELOG.md`.

```mermaid
flowchart TB
    subgraph TMP["tmp/  — gitignored"]
        direction TB
        subgraph RAW["raw/"]
            R1["notion/<br/>(exports, HTML/MD)"]
            R2["github/<br/>(issues.json, comments/, prs/)"]
            R3["git/<br/>(log.json, tags.json)"]
            R4["website/<br/>(scraped HTML/MD)"]
        end
        subgraph CAN["canonical/"]
            C1["vision-and-strategy.md"]
            C2["product-history.md"]
            C3["taxonomy-v1.md"]
            C4["taxonomy-reconciliation-report.md"]
        end
        subgraph LOG["agent-logs/  optional"]
            L1["intake-b-chunk-NN.log"]
            L2["recon-decisions.log"]
        end
    end
```

Rule: **no agent writes outside `tmp/` until its inputs are validated against the canonical set.** Any agent that needs to consume Notion content reads from `tmp/canonical/vision-and-strategy.md`, never from `tmp/raw/notion/*`.

---

## 6. Intake Phase 0 — two parallel agents

```mermaid
flowchart TB
    subgraph IA["Intake-A — Strategic vision"]
        direction LR
        IA_in["tmp/raw/notion/<br/>tmp/raw/website/<br/>tmp/raw/decks/"]
        IA_op["Operations:<br/>1. dedupe across sources<br/>2. classify (vision, persona,<br/>   metric, competitive, roadmap)<br/>3. grade source authority<br/>4. cite original location"]
        IA_out["tmp/canonical/<br/>vision-and-strategy.md"]
        IA_in --> IA_op --> IA_out
    end

    subgraph IB["Intake-B — Operational history (chunked)"]
        direction TB
        IB_pre["Pre-fetch:<br/>gh issue list --state all --json …<br/>gh pr list --state all --json …<br/>git log --pretty=format:… > log.json"]
        IB_chunk{"Chunk by area cluster<br/>OR time bucket<br/>~300-500 issues/chunk"}
        IB_r1["Chunk 1 agent"]
        IB_r2["Chunk 2 agent"]
        IB_rN["Chunk N agent"]
        IB_merge["Merge agent:<br/>concat + dedupe<br/>+ cross-link issue↔PR↔commit"]
        IB_out["tmp/canonical/<br/>product-history.md"]
        IB_pre --> IB_chunk
        IB_chunk --> IB_r1
        IB_chunk --> IB_r2
        IB_chunk --> IB_rN
        IB_r1 --> IB_merge
        IB_r2 --> IB_merge
        IB_rN --> IB_merge
        IB_merge --> IB_out
    end

    classDef agent fill:#fff3bf,stroke:#a80
    class IA_op,IB_r1,IB_r2,IB_rN,IB_merge agent
```

Intake-A and Intake-B run **fully in parallel** (no dependency). Intake-B's chunks can run in parallel across multiple agent sessions if available.

### 6.1 Schema fragment — `product-history.md`

```yaml
# Each entry produced by Intake-B is one of:
- type: feature          # shipped or proposed feature cluster
  area: <provisional>    # finalized after Reconciliation
  status: shipped | open | abandoned
  related_issues: [#1234, #5678]
  related_prs: [#999]
  related_commits: [abc123]
  shipped_in: v1.3.40    # if shipped
  summary: "..."
  
- type: decision         # captured from issue comments or commit messages
  area: <provisional>
  decided_at: 2024-08-15
  context: "Why this decision was made"
  alternatives_considered: [...]
  
- type: incident         # bug + resolution
  area: <provisional>
  severity: critical | high | medium | low
  root_cause: "..."
  lesson: "..."
```

---

## 7. Reconciliation Phase 0.5

```mermaid
flowchart LR
    CAN_VIS[(vision-and-strategy.md)]
    CAN_HIST[(product-history.md)]

    EX1["Extract strategic areas<br/>top-down from vision"]
    EX2["Cluster issues + commits<br/>bottom-up"]

    PROP_A(["taxonomy-v0-strategic<br/>top-down list"])
    PROP_B(["taxonomy-v0-empirical<br/>bottom-up clusters"])

    REC["🔀 Reconciliation agent<br/>4 operations:<br/>union • conflict • gap • granularity"]
    DIFF["taxonomy-reconciliation-report.md"]
    TAX(["taxonomy-v1.md"])

    G1{"⚠ G1 Human review<br/>approve taxonomy-v1"}

    CAN_VIS --> EX1 --> PROP_A --> REC
    CAN_HIST --> EX2 --> PROP_B --> REC
    REC --> DIFF
    REC --> TAX
    DIFF -.->|context for review| G1
    TAX --> G1
    G1 -->|approved| DOWN["Wave 3+: PRD, B1, B2"]
    G1 -->|revise| REC

    classDef gate fill:#cfe2ff,stroke:#06c
    class G1 gate
```

### 7.1 The 4 reconciliation operations

```mermaid
flowchart TB
    subgraph OPS["Reconciliation operations"]
        O1["Union — items in A ∪ B"]
        O2["Conflict resolution<br/>same concept, different name<br/>→ canonical name + aliases[]"]
        O3["Gap surfacing<br/>only in A → source: vision_primary<br/>only in B → source: history_primary"]
        O4["Granularity reconciliation<br/>A coarse, B fine → pick level<br/>+ sub_areas[]"]
    end

    O1 --> R1["Each item: name, description"]
    O2 --> R2["Each item: aliases list"]
    O3 --> R3["Each item: source field"]
    O4 --> R4["Each item: sub_areas list"]

    R1 --> TAX["taxonomy-v1.md schema"]
    R2 --> TAX
    R3 --> TAX
    R4 --> TAX
```

### 7.2 `taxonomy-v1.md` schema (verbatim what reconciler outputs)

```yaml
---
version: 1
generated_at: 2026-06-03
source_strategic: tmp/canonical/vision-and-strategy.md
source_empirical: tmp/canonical/product-history.md
human_reviewed_by: <github-handle>
reconciliation_report: tmp/canonical/taxonomy-reconciliation-report.md
---

## Areas (product axis — reconciled)

### swap
description: Cross-chain & same-chain token swap (routing, providers, slippage)
aliases: [Swap features, swapping, dex, exchange, cross-chain swap]
sub_areas: [xcm, hydration, optimex]
source: both
empirical_issue_count: 47
example_issues: [#4936, #4567, #4209]

### multisig
description: Multi-signature account creation, transfer, approval flows
aliases: [Multi-sig, multi sig, multisig wallet]
sub_areas: [creation, transfer, notification, detection]
source: vision_primary
empirical_issue_count: 9
example_issues: [#4869, #4872, #4875]

# … ~10-15 areas total

## Types (work axis — fixed enum, NOT reconciled)
- bug
- feature
- integration
- refactor
- research
- chore
- ux
```

---

## 8. Stream A — Foundation docs dependency graph

```mermaid
flowchart TB
    CAN_VIS[(vision-and-strategy.md)]
    CAN_HIST[(product-history.md)]
    REPO[(Repo files + git log)]
    TAX[(taxonomy-v1.md)]

    A1["A1 BRIEF"]
    A2["A2 PRD"]
    A3["A3 ARCHITECTURE"]
    A4["A4 CONTEXT"]
    A5["A5 LESSONS"]
    A6["A6 SETUP"]
    A7["A7 CHANGELOG"]

    CAN_VIS --> A1
    CAN_HIST --> A1

    CAN_VIS --> A2
    CAN_HIST --> A2
    REPO --> A2
    TAX --> A2

    REPO --> A3
    CAN_HIST --> A3

    CAN_HIST --> A4
    REPO --> A4

    CAN_HIST --> A5
    REPO --> A5

    REPO --> A6

    REPO --> A7

    A1 --> T1["docs/BRIEF.md"]
    A2 --> T2["docs/PRD.md"]
    A3 --> T3["docs/ARCHITECTURE.md"]
    A4 --> T4["docs/CONTEXT.md"]
    A5 --> T5["docs/LESSONS.md"]
    A6 --> T6["docs/SETUP.md"]
    A7 --> T7["CHANGELOG.md root"]
```

### 8.1 Stream A agent contracts (one-line each)

| Agent | Inputs | Output | Can parallelize with |
| --- | --- | --- | --- |
| A1 BRIEF | canonical-vis, canonical-hist | `docs/BRIEF.md` | A3, A4, A5, A6, A7 |
| A2 PRD | canonical-vis, canonical-hist, repo, **taxonomy-v1** | `docs/PRD.md` | B1 (both use taxonomy) |
| A3 ARCHITECTURE | repo, canonical-hist | `docs/ARCHITECTURE.md` | A1, A4, A5, A6, A7 |
| A4 CONTEXT | canonical-hist, repo | `docs/CONTEXT.md` | A1, A3, A5, A6, A7 |
| A5 LESSONS | canonical-hist, repo | `docs/LESSONS.md` | A1, A3, A4, A6, A7 |
| A6 SETUP | repo only | `docs/SETUP.md` | everything (no canonical dep) |
| A7 CHANGELOG | git log, existing `CHANGELOG.md` | `CHANGELOG.md` reformatted | everything (no canonical dep) |

A6 and A7 are **early-runnable**: they start in Wave 1 alongside the intakes since they need only repo files.

---

## 9. Stream B — Issue → backlog (no sprint allocation)

```mermaid
flowchart LR
    CAN_HIST[(product-history.md)]
    TAX[(taxonomy-v1.md)]
    PRD_FR[("PRD §Functional Requirements<br/>area map")]
    ARCH[("ARCHITECTURE<br/>package map")]

    B1["B1 Triage<br/>each open issue:<br/>{area, type}"]
    B2["B2 Epic synthesizer<br/>group by area<br/>→ EPIC-N"]
    B3["B3 Story conversion<br/>1 issue → 1 US-X.Y file<br/>status: backlog"]

    CAN_HIST -->|filter status=open| B1
    TAX --> B1
    PRD_FR -.->|cross-check| B1
    TAX --> B2
    ARCH -.->|tech grouping| B2

    B1 --> B2 --> B3

    B2 --> T8["docs/sprints/epics/EPIC-N.md"]
    B3 --> T9["docs/sprints/stories/US-X.Y-*.md<br/>(all status: backlog)"]
    B3 -.->|trigger| T11["docs/sprints/STATUS.md<br/>auto via npx koni-docs status"]
```

Stream B produces a **classified backlog** only. No sprint allocation logic — that lives in Wave 6 (interactive, human-driven).

---

## 10. Wave structure + critical path

```mermaid
flowchart TB
    subgraph W1["WAVE 1 — parallel, no deps"]
        direction LR
        W1A["Intake-A"]
        W1B["Intake-B chunked"]
        W1C["A6 SETUP"]
        W1D["A7 CHANGELOG"]
    end

    subgraph W2["WAVE 2 — after canonicals ready"]
        direction LR
        W2R["Reconciliation"]
        W2A["A1 BRIEF"]
        W2B["A3 ARCH"]
        W2C["A4 CONTEXT"]
        W2D["A5 LESSONS"]
    end

    G1{"⚠ G1 taxonomy-v1"}

    subgraph W3["WAVE 3 — after G1"]
        direction LR
        W3A["A2 PRD"]
        W3B["B1 Triage"]
    end

    G2{"⚠ G2 PRD"}

    subgraph W4["WAVE 4 — after B1+ARCH"]
        W4["B2 Epic synth"]
    end

    subgraph W5["WAVE 5 — after B2"]
        W5["B3 Story conversion"]
    end

    subgraph W6["WAVE 6 — interactive bootstrap"]
        direction TB
        W6S["I1+S6a → I2+S6b+I2b+S6c → I3+S6d"]
    end

    G3{"⚠ G3 final integration"}
    DONE["PR ready for merge → master"]

    W1 --> W2
    W2R --> G1 --> W3
    W3A --> G2
    W3B --> W4
    G2 -.->|consumes| W5
    W4 --> W5 --> W6 --> G3 --> DONE

    classDef wave fill:#fff3bf,stroke:#a80
    classDef gate fill:#cfe2ff,stroke:#06c
    classDef input fill:#e9d5ff,stroke:#7c3aed
    class W1,W2,W3,W4,W5,W1A,W1B,W1C,W1D,W2R,W2A,W2B,W2C,W2D,W3A,W3B wave
    class G1,G2,G3 gate
    class W6,W6S input
```

### 10.1 Critical path

```mermaid
flowchart LR
    A["Intake-B<br/>chunked (longest)"] --> B["Recon"]
    B --> G1{"G1"}
    G1 --> C["A2 PRD"]
    C --> G2{"G2"}
    G2 --> D["B2 Epic"]
    D --> E["B3 Story"]
    E --> F["Wave 6 bootstrap"]
    F --> G3{"G3"}
    G3 --> H["merge → master"]

    classDef gate fill:#cfe2ff,stroke:#06c
    class G1,G2,G3 gate
```

Anything not on this path can run in parallel slots if compute / reviewer bandwidth allows.

---

## 11. Gate taxonomy: review vs input

```mermaid
flowchart LR
    subgraph REV["🔵 Review gates (3)"]
        direction TB
        RA["AI produces artifact"]
        RB["Human says yes/no/revise"]
        RC["If no → AI revises<br/>If yes → unblock downstream"]
        RA --> RB --> RC
    end

    subgraph INP["🟣 Input gates (4)"]
        direction TB
        IA["AI pauses, prompts user<br/>(structured schema)"]
        IB["Human provides info<br/>(YAML / answers / files)"]
        IC["AI parses input,<br/>runs deterministic step,<br/>resumes"]
        IA --> IB --> IC
    end

    classDef rev fill:#cfe2ff,stroke:#06c
    classDef inp fill:#e9d5ff,stroke:#7c3aed
    class RA,RB,RC rev
    class IA,IB,IC inp
```

### 11.1 Review gates

| ID | After | Reviews | Blocks if rejected |
| --- | --- | --- | --- |
| G1 | Reconciliation | `taxonomy-v1.md` + reconciliation report | Wave 3 (PRD + Triage) |
| G2 | A2 PRD | `docs/PRD.md` | Wave 5 (B3 final story output uses PRD §FR) |
| G3 | Wave 6 | Whole repo state — 5-layer consistency, no "TBD", STATUS.md correct | PR merge to master |

### 11.2 Input gates

| ID | Before | User provides | Agent then does |
| --- | --- | --- | --- |
| I1 | S6a | strategy to unify `packages/* -N` suffix with root VERSION | apply chosen rule across all `packages/*/package.json` |
| I2 | S6b | rule mapping commit/tag → sprint window (or explicit map) | derive `sprint-YYYY-WNN.md` skeletons from git tags + CHANGELOG |
| I2b | S6c | review of derived past sprint files, edits to story-to-sprint mapping | finalize past sprint files |
| I3 | S6d | (1) theme/focus for first active sprint, (2) 1-3 stories from backlog to promote, (3) sprint window ID (e.g. 2026-W23) | create `sprint-2026-WNN.md`, flip selected stories `backlog → ready`, run `npx koni-docs status` |

---

## 12. Wave 6 — interactive bootstrap detail

```mermaid
flowchart TB
    START(["Enter Wave 6"])

    I1{"🟣 I1<br/>strategy: unify packages/* -N<br/>vs keep -N suffix"}
    S6a["S6a — apply version policy<br/>edit packages/*/package.json"]

    I2{"🟣 I2<br/>commit/tag → sprint mapping rule"}
    S6b["S6b — derive past sprint files<br/>from git tag dates + CHANGELOG"]
    I2b{"🟣 I2b<br/>review derived past sprint files,<br/>edit story-to-sprint mapping"}
    S6c["S6c — finalize past sprint files"]

    I3{"🟣 I3<br/>theme + 3 stories + sprint window ID"}
    S6d["S6d — create active sprint file<br/>flip selected stories: backlog → ready<br/>npx koni-docs status"]

    G3{"⚠ G3 final integration review"}
    END(["Wave 6 done — PR ready"])

    START --> I1 --> S6a --> I2 --> S6b --> I2b --> S6c --> I3 --> S6d --> G3 --> END

    classDef input fill:#e9d5ff,stroke:#7c3aed
    classDef step fill:#fff3bf,stroke:#a80
    classDef gate fill:#cfe2ff,stroke:#06c
    class I1,I2,I2b,I3 input
    class S6a,S6b,S6c,S6d step
    class G3 gate
```

### 12.1 Input gate schema (used by Plan)

Each input gate in the Plan follows this structure:

```yaml
INPUT_GATE_<ID>:
  blocks: <step it unblocks>
  prompt_to_user: |
    <Plain-language ask with options or required schema>
  expected_input_format: <YAML | answers | file drop in tmp/>
  agent_action_on_receipt: |
    <Deterministic steps the agent runs after input>
  fallback_if_user_unavailable: pause  # never silent-default
  verification: <How agent confirms input is valid before running>
```

---

## 13. Branch & commit convention

```mermaid
flowchart LR
    M[master]
    AID[ai-development]
    M -.->|already branched| AID

    C0["...821bb9e docs: add AI coding behavior<br/>(end of sub-task 1)"]
    C1["intake-a: notion + website synthesis"]
    C2["intake-b/batch-1: issues 1-500"]
    C3["intake-b/batch-2: issues 501-1000"]
    Cdot["..."]
    C4["recon: taxonomy-v1 + report"]
    C5["⚠ G1 review (commit comments)"]
    C6["a1-brief: docs/BRIEF.md"]
    C7["a2-prd: docs/PRD.md"]
    Cdot2["..."]
    C8["wave6-i1: packages version unify"]
    Cdot3["..."]
    PR["PR merged → master"]

    C0 --> C1 --> C2 --> C3 --> Cdot --> C4 --> C5 --> C6 --> C7 --> Cdot2 --> C8 --> Cdot3 --> PR
```

### 13.1 Rules

- **Append-only.** No force-push, no rebase on `ai-development`.
- **One commit per agent run.** Conventional prefix: `<agent-id>: <one-line summary>`.
- **Review per commit**, not per PR. Reviewer can revert any single commit if rejected.
- **PR description**: maintained incrementally — agents append a short bullet to the PR description after each commit, summarising what was added.
- **No commits to `tmp/`.** `tmp/` is gitignored end-to-end; if `git status` shows `tmp/` entries, that is a `.gitignore` bug to fix immediately.
- **Reviewer workflow when receiving handoff**: `git fetch && git diff <last-reviewed-sha>..HEAD` per commit, approve/revert, then signal next agent run.

### 13.2 Conflict surfaces (need light serialization)

```mermaid
flowchart LR
    F1["CLAUDE.md<br/>Active Context block"] -.->|"updated by A1, A2,<br/>A3, Wave 6 steps"| Conflict
    F2["tmp/canonical/taxonomy-v1.md"] -.->|"recon writes,<br/>downstream reads only"| OK
    F3["docs/sprints/STATUS.md"] -.->|"auto-gen,<br/>multiple agents trigger"| MaybeConflict
    Conflict["⚠ serialize edits"]
    OK["✓ no conflict expected"]
    MaybeConflict["⚠ regen idempotently<br/>npx koni-docs status<br/>at end of each commit"]
```

---

## 14. Canonical → target traceability matrix

```mermaid
flowchart LR
    subgraph PRIV["tmp/canonical/"]
        P1["vision-and-strategy.md"]
        P2["product-history.md"]
        P3["taxonomy-v1.md"]
    end

    subgraph PUB["docs/  (public)"]
        D1["BRIEF.md"]
        D2["PRD.md"]
        D3["ARCHITECTURE.md"]
        D4["CONTEXT.md"]
        D5["LESSONS.md"]
        D6["SETUP.md"]
        D7["sprints/epics/EPIC-N.md"]
        D8["sprints/stories/US-X.Y-*.md"]
    end

    P1 --> D1
    P1 --> D2
    P2 --> D1
    P2 --> D2
    P2 --> D3
    P2 --> D4
    P2 --> D5
    P2 --> D7
    P2 --> D8
    P3 --> D2
    P3 --> D7
    P3 --> D8

    REPO[("Repo + git")] --> D2
    REPO --> D3
    REPO --> D4
    REPO --> D5
    REPO --> D6
    REPO --> CHG["CHANGELOG.md"]
```

---

## 15. Out of scope (truly out)

Not in this migration:

- External system integration (Linear, Jira, Slack, etc.) — handled outside koni-docs entirely.
- New skill installation (the `koni-docs` skill is the only one needed; `koni-api` and others are deferred to separate sub-tasks).
- Tooling changes (CI workflows, lint rules) — koni-docs operates over existing CI conventions, not changes them.

Items that **looked** out of scope but were reclassified as input gates in Wave 6 (per user clarification):

- Sprint allocation weekly cadence → ongoing human process; Wave 6 bootstraps the first sprint as template
- Backfill past sprints → I2 + S6b + I2b + S6c
- Priority labeling, theme ordering → part of I3 and recurring weekly
- `packages/* -N` suffix vs root VERSION → I1 + S6a

---

## 16. Success criteria

```mermaid
flowchart TB
    S1["1. All 7 foundation docs<br/>present + reviewed"]
    S2["2. ~200 open issues<br/>converted to US-X.Y backlog"]
    S3["3. EPIC-N files cover all<br/>taxonomy areas (≥80% issue coverage)"]
    S4["4. STATUS.md auto-gen passes<br/>5-layer consistency check"]
    S5["5. First active sprint file exists,<br/>≥1 story in 'ready'"]
    S6["6. packages/* -N suffix policy<br/>documented in CONTEXT.md"]
    S7["7. PR ai-development → master<br/>green, mergeable"]
    S8["8. No 'TBD' / placeholder<br/>in any committed doc"]

    ALL["✅ Migration done"]

    S1 --> ALL
    S2 --> ALL
    S3 --> ALL
    S4 --> ALL
    S5 --> ALL
    S6 --> ALL
    S7 --> ALL
    S8 --> ALL
```

---

## 17. Open risks & considerations

| Risk | Mitigation |
| --- | --- |
| Notion content thin / weak vision section | Intake-A surfaces a `coverage report`; if < 60% of BRIEF template sections covered, escalate to user before Wave 2 |
| Intake-B token cost on full history | Chunking by area cluster (300-500 issues/chunk). Optionally parallelize across sessions. Budget cap per chunk. |
| Taxonomy drift between Intake-A and Intake-B | Reconciliation phase exists precisely for this; G1 human review is mandatory |
| Reviewer bottleneck on per-commit cadence | Per-commit review can batch up to 5 commits if they're independent (intake chunks); critical-path commits review one-at-a-time |
| `npx koni-docs status` failing in CI | Run locally before each commit; do not push commits that leave STATUS.md inconsistent |
| Long-living branch drift from master | Periodic `git merge master --no-ff` from master into ai-development; resolve conflicts in same commit |

---

## 18. Next step

After this spec is approved by user review:

1. Invoke the `writing-plans` skill.
2. Output: `docs/superpowers/plans/2026-06-03-koni-docs-migration.md`.
3. The Plan encodes, per agent run:
  - Prompt template (exact text agent receives)
  - Inputs (files / canonicals to read)
  - Outputs (files to write)
  - Acceptance criteria
  - Verification commands
  - Commit prefix + message template
4. Input gates encoded with full schema per §12.1.
5. The Plan is the handoff deliverable.

---

## Appendix A — Glossary

| Term | Meaning |
| --- | --- |
| **Stream A** | Foundation docs work — BRIEF, PRD, ARCHITECTURE, CONTEXT, LESSONS, SETUP, CHANGELOG |
| **Stream B** | Issue → backlog conversion — Triage, Epic, Story (no Sprint) |
| **Wave** | Time-ordered batch of agent runs sharing the same dependency layer |
| **Review gate** | Human approves an AI-produced artifact before downstream proceeds |
| **Input gate** | Agent pauses to receive structured user input before continuing |
| **Canonical** | A `tmp/canonical/*.md` file — single source of truth for downstream agents |
| **Chunked execution** | Intake-B mode where the input is partitioned (~300-500 issues/run) and runs in parallel |
| **5-layer consistency** | Story ↔ Epic ↔ PRD ↔ Sprint ↔ STATUS.md must agree — per koni-docs skill |
