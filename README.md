# ADT Configuration Recommender PoC

## Overview

This standalone proof of concept recommends ADT Studio configuration values for a PDF book. It combines deterministic PDF analysis and sampled page evidence with one multimodal OpenAI request. **PoC V1 is an experimental human-in-the-loop recommendation engine.** Its suggestions require human review; it is not an autonomous production configuration selector or an ADT conversion pipeline.

## Current stable version

The canonical variant is `poc-v1`, with promptVersion `adt-config-recommender-poc-v1`. It recommends six fields: `preset`, `renderStrategy`, `pageGrouping`, `sectioningMode`, `activitiesGenerator`, and `figureExtraction`. The selected Decision Specs live in [`src/decision/specs.ts`](src/decision/specs.ts). Historical variants remain available for reproduction.

## Quick start

Requires Node.js 20 or newer, an OpenAI API key, and an available model that supports the request. From the repository root:

```powershell
npm.cmd install
Copy-Item .env.example .env
```

Set `OPENAI_API_KEY` and `OPENAI_MODEL` in `.env` (see [`.env.example`](.env.example)). Then run the canonical variant on one included PDF:

```powershell
npm.cmd run recommend:openai -- "pdfs/storybook-1930-el-viaje.pdf" --user-language pt-BR
```

`poc-v1` is the CLI default. `--user-language` is required and specifies the language of `reason` and `ambiguityReason`; book language does not set it. The command makes an OpenAI request and writes `output/storybook-1930-el-viaje.openai-recommendation.poc-v1.json` and contact-sheet PNGs under `output/evidence/storybook-1930-el-viaje/poc-v1/`. Replace the PDF path with another book as needed. On shells where `npm` runs directly, `npm run recommend:openai -- ...` is equivalent. Use `--variant v1` to reproduce the historical V1 behavior without `--user-language`.

## How it works

```text
PDF → deterministic Book Analyzer → BookProfile
    → representative page pairs → sampled text + rendered contact sheets
    → Decision Specs + multimodal OpenAI request → structured recommendation
    → semantic validation → JSON output
```

The analyzer produces structural measurements and heuristic signals. At most three page pairs supply limited text and images. The API receives the `BookProfile`, sampled text, and rendered contact sheets rather than the entire PDF; the request sets `store: false`. All six decisions share one model call. The parsed answer is checked for valid choices, ambiguity relationships, and sampled-page citations. There is no final cross-decision compatibility resolver. See [PoC V1](docs/POC_V1.md) and [Architecture](docs/ARCHITECTURE.md).

## Repository structure

| Path | Role |
| --- | --- |
| `src/analyzer/` | PDF measurements and `BookProfile` aggregation |
| `src/decision/` | Stable runtime Decision Specs, including PoC V1 |
| `src/recommendation/` | Sampling, rendering, prompt, schema, variant registry, and OpenAI execution |
| `src/experiments/` | Executable historical experiment definitions needed to reproduce old variants |
| `evaluation/` | Frozen manual benchmark and scoring semantics |
| `experiments/` | Human-readable experiment history and selection rationale |
| `docs/` | Technical overview, architecture, and limitations |
| `specs/` | Historical/reference ADT domain notes; use runtime specs for exact current wording |
| `pdfs/` | Source PDF books currently present in this repository |
| `output/` | Local generated recommendation JSON and rendered evidence; ignored by Git |

## Evaluation snapshot

The frozen benchmark has **18 manually validated decisions across four books**. PoC V1's historical equivalent, `v2-render-specs`, recorded **15/18 agreement**. This is agreement with known-good manual configurations, not formal model accuracy or evidence of generalization: the same books participated in iteration. Reference and Egito are diagnostic cases outside the scored denominator. See [Evaluation](evaluation/README.md) and [Experiment history](experiments/README.md).

## Limitations and use

The system has no OCR, uses sparse deterministic samples and heuristic signals, reports uncalibrated confidence, and has no final compatibility resolver or ADT Studio UI integration. Review its recommendations against the source book and ADT constraints before use. See [Limitations](docs/LIMITATIONS.md).

## Documentation and checks

- [PoC V1 technical and product guide](docs/POC_V1.md)
- [Current architecture](docs/ARCHITECTURE.md)
- [Known limitations and deferred areas](docs/LIMITATIONS.md)
- [Frozen evaluation benchmark](evaluation/README.md)
- [Experiment history](experiments/README.md)

Local checks: `npm.cmd run typecheck` and `npm.cmd test`. The normal self-tests use fake clients and do not call OpenAI; an optional PDF integration check runs only when its fixture is present.

This repository is independent of ADT Studio and is not an official ADT Studio or UNICEF release. Domain terminology was informed by the [ADT Studio source](https://github.com/unicef/adt-studio); see [NOTICE.md](NOTICE.md) for attribution.
