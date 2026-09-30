# ADT Configuration Recommender POC

This repository is a standalone proof of concept that explores whether a multimodal LLM can recommend ADT Studio configuration values from a lightweight analysis of a PDF book.

The POC combines deterministic structural PDF analysis, representative page sampling, extracted text, rendered visual evidence, ADT-specific Decision Specs, one multimodal OpenAI request, and structured recommendations. It is an experiment, not a production-ready system, and it does not perform a full ADT conversion.

## Pipeline

```text
PDF
|
+-- Book Analyzer
|   `-- BookProfile
|
`-- Representative Page Sampling
    +-- Extracted page text
    `-- Rendered page-pair contact sheets

BookProfile + Page Evidence + ADT Decision Specs
                         |
                         v
                  Multimodal LLM
                         |
                         v
             Structured Recommendation
```

## Recommendations

The POC recommends Preset, Render Strategy, Page Grouping, Sectioning Mode, Activities Generator, and Figure Extraction. See [`src/decision/specs.ts`](src/decision/specs.ts) and [`specs/`](specs/) for the current domain definitions and valid values.

## How it works

1. Load a PDF locally.
2. Produce deterministic structural metrics as a `BookProfile`.
3. Select up to three representative consecutive page pairs.
4. Extract limited text from the sampled pages.
5. Render those pages and generate page-pair contact sheets.
6. Build a multimodal request containing the `BookProfile`, ADT Decision Specs, sampled-page text, and rendered page evidence.
7. Send one OpenAI request.
8. Receive a Structured Output with a `choice`, `confidence`, concise `reason`, and `evidencePages` for every decision.

## Requirements and installation

Node.js 20 or newer is required.

```sh
npm install
```

## Configuration

Copy `.env.example` to `.env` and set:

```dotenv
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
```

Model availability and capability support depend on the OpenAI API account and project being used.

## Usage

```sh
npm run recommend -- ./path/to/book.pdf
```

For example:

```sh
npm run recommend -- ./examples/book.pdf
```

The example path is illustrative; this repository does not ship a book PDF.

## Output

The command writes a JSON recommendation file under `output/` and rendered contact-sheet images under `output/evidence/`. The JSON contains the provider, model, prompt version, source PDF metadata, `BookProfile`, sampled pages, six recommendations, token usage, and timing data. Each recommendation contains its selected `choice`, `confidence`, evidence-grounded `reason`, and cited `evidencePages`.

## Testing

```sh
npm test
npm run typecheck
```

The default tests make no OpenAI API calls, require no API key, use no network access, and consume no API credits. An optional rendering integration check runs only when its local PDF fixture is present; no fixture is distributed here.

## Current limitations

- This is a proof of concept, not a production-ready system.
- It does not perform OCR.
- Structural measurements include heuristics and proxies.
- Only a limited number of representative page pairs are sent to the model.
- Visual evidence is sampled rather than exhaustive.
- Recommendations may be wrong or ambiguous.
- It is not integrated into the ADT Studio wizard or pipeline.
- It does not implement a final compatibility validator.
- Model/API usage has cost and latency.

## Privacy and external API usage

When a recommendation is executed, the configured OpenAI API receives the evidence prepared by this POC: structural `BookProfile` information, extracted text from sampled pages, and rendered sampled-page images/contact sheets. This implementation does not directly send the entire PDF. The API request currently sets `store: false`.

Review the applicable API terms and your own data-handling requirements before processing documents.

## Relationship to ADT Studio

This repository is a standalone proof of concept exploring automatic configuration recommendation for ADT Studio. It is not the official ADT Studio repository, is not an official ADT Studio release, and should not be interpreted as an official UNICEF product unless explicitly adopted upstream. It uses no UNICEF logos and does not imply endorsement.

The ADT-specific configuration terminology, option names, and domain context used by this POC were derived from reviewing the public ADT Studio codebase and documentation. The following upstream areas were reviewed for domain context and to understand configuration behavior:

- `apps/studio/src/components/wizard/constants.ts`
- `apps/studio/src/components/wizard/step2LayoutOptions/RenderStrategyPicker.tsx`
- `apps/studio/src/components/wizard/step2LayoutOptions/PageGroupingMode.tsx`
- `apps/studio/src/components/wizard/step2LayoutOptions/SectioningMode.tsx`
- `apps/studio/src/components/wizard/step3ContentProcessing/index.tsx`
- `apps/studio/src/components/wizard/bookCreationConfig.ts`
- `packages/types/src/config.ts`
- `packages/pipeline/src/pdf-extraction.ts`

The authoritative upstream implementation is [unicef/adt-studio](https://github.com/unicef/adt-studio). Consult that repository for official source code, documentation, copyright notices, and licensing terms. The licensing decision for this proof of concept is separate and has not been made by this extraction task.

See [NOTICE.md](NOTICE.md) for concise attribution.
