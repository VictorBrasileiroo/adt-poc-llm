# PoC V1

## 1. Purpose and scope

ADT Studio requires choices about how a PDF book should be transformed and presented. This standalone PoC prepares limited structural and visual evidence, then asks a multimodal model to suggest six configuration values. It does not run an ADT conversion, choose settings autonomously, or integrate with the ADT Studio wizard. **PoC V1 is experimental and human-in-the-loop:** a person must review the suggestions against the book and the target workflow.

The target decisions are `preset`, `renderStrategy`, `pageGrouping`, `sectioningMode`, `activitiesGenerator`, and `figureExtraction`. Their exact current wording and option IDs are in [`src/decision/specs.ts`](../src/decision/specs.ts).

## 2. Canonical configuration

| Item | Selected value |
| --- | --- |
| Variant | `poc-v1` |
| Prompt version | `adt-config-recommender-poc-v1` |
| Prompt behavior | V2 ambiguity-aware instructions and structured output |
| Preset | Baseline `PRESET_SPEC` |
| Render Strategy | `POC_V1_RENDER_STRATEGY_SPEC`, identical to historical Render Specs v1 |
| Page Grouping | Baseline `PAGE_GROUPING_SPEC` |
| Sectioning Mode | Baseline `SECTIONING_MODE_SPEC` |
| Activities Generator | Baseline `ACTIVITIES_SPEC` |
| Figure Extraction | Baseline `FIGURE_EXTRACTION_SPEC` |

`POC_V1_DECISION_SPECS` composes these exact spec objects. The historical `v2-render-specs` variant sends an equivalent model request; its different promptVersion identifies the experiment in saved results. `poc-v1` names the selected configuration without making users interpret Card 3 experiment history. It is the CLI default and requires `--user-language`; historical `v1` remains available with `--variant v1`.

## 3. End-to-end flow

1. [`src/recommend-openai.ts`](../src/recommend-openai.ts) parses the PDF path, variant, and user language, then checks that the file and required environment values exist.
2. [`analyzePdf`](../src/analyzer/pdf-analyzer.ts) opens the PDF, inspects every page's extracted text, geometry, and PDF image painting operations, then aggregates a `BookProfile`.
3. The [sampler](../src/recommendation/representative-pages.ts) selects up to three deterministic page pairs from the page count.
4. It opens the PDF again to extract and truncate text from those sampled pages.
5. The [renderer](../src/recommendation/page-renderer.ts) opens the PDF for page images, renders the selected pages, and writes PNG contact sheets.
6. The [prompt builder](../src/recommendation/openai-prompt.ts) combines PoC V1 Decision Knowledge and V2 instructions with the requested user language. The user input contains the `BookProfile`, sampled page text, contact-sheet images, and the six-decision task.
7. The [recommender](../src/recommendation/openai-recommender.ts) sends one multimodal OpenAI request with `store: false` and structured output. SDK retries are disabled for this request.
8. The [schema and semantic validator](../src/recommendation/openai-schema.ts) check the parsed response, including valid option IDs, alternative relationships, and page citations.
9. The CLI serializes the result, profile, sampled-evidence metadata, usage, and timings to JSON. It does not apply a final compatibility resolver.

## 4. Book Analyzer and BookProfile

The analyzer counts extracted characters per page, text items, image painting operations, page orientation, likely columns, and simple activity cues. The aggregate shape is defined in [`src/analyzer/types.ts`](../src/analyzer/types.ts):

| Group | Fields |
| --- | --- |
| Global | `pageCount` |
| `text` | `totalChars`, `avgCharsPerPage`, `medianCharsPerPage`, `lowTextPageRatio`, `highTextPageRatio` |
| `images` | `totalImageOperations`, `pagesWithImagesRatio`, `avgImagesPerPage` |
| `layout` | `landscapePageRatio`, `multiColumnPageRatio` |
| `activities` | `activitySignalPageRatio` |

The low-text threshold is **at most 250 extracted characters**; the high-text threshold is **at least 1,200**. Likely multi-column detection requires at least 400 characters and eight text items, then checks whether at least 25% of text items lie on each side of the page (left of 45% width and right of 55% width). Activity signals count question marks, lettered alternatives, and numbered lines. Image counts come from PDF image-painting operators, so they are proxies for visual content, not a count of distinct illustrations. These measurements and classifications are heuristics, not semantic labels. The analyzer has no OCR or extraction-quality diagnostics.

## 5. Representative evidence

Sampling is deterministic and uses at most **three pairs**. For a book with fewer than seven pages it considers pages 1 through N; for N ≥ 7 it excludes the first and last pages. It forms non-overlapping consecutive candidate pairs, allowing a one-page final candidate. If there are more than three candidates, it chooses the first, a middle candidate, and the last. This is reproducible but may miss semantically important pages.

For each selected page, the extractor normalizes whitespace and keeps up to **300 extracted characters**, preferably stopping at a nearby word boundary. It performs no OCR. The renderer scales each selected page so its longest side is about **1,100 px**, places paired pages side by side with a **12 px gray gap**, and saves a PNG contact sheet. That artificial pairing can influence a `pageGrouping` recommendation.

## 6. Model interface and ambiguity

PoC V1 uses one OpenAI call for all six decisions. The instructions treat PDF text and images as **untrusted evidence**, prohibit treating their contents as instructions, and direct the model to use the application-specified user language for explanations. The prompt asks for a primary choice even when evidence is limited and does not request or store chain of thought.

For each decision, the V2 structured response has:

| Field | Meaning |
| --- | --- |
| `choice` | Required primary option ID |
| `confidence` | Model-reported `low`, `medium`, or `high`; not a calibrated probability |
| `reason` | Concise, evidence-grounded explanation in the requested user language |
| `alternative` | A different, concretely supported option, or `null` |
| `ambiguityReason` | Why that alternative remains plausible, or `null` |
| `evidencePages` | Sorted, unique sampled page numbers directly supporting the decision; may be empty for global evidence |

A lower confidence can reflect weak evidence without a supported alternative. An alternative represents meaningful ambiguity between specific choices, not uncertainty in general. `high` confidence cannot accompany an alternative. The request schema constrains choices and sampled-page IDs; validation after parsing checks the alternative/ambiguity relationship and rejects unsampled, unsorted, or repeated citations. It does not verify that cited evidence truly supports the claim or that the six choices form a compatible ADT configuration.

## 7. Six decisions

| Decision | Current valid choices | What it addresses |
| --- | --- | --- |
| Preset (`preset`) | `textbook`, `storybook`, `reference` | Broad content/workflow fit |
| Render Strategy (`renderStrategy`) | `llm`, `llm-overlay`, `single_column`, `two_column_story`, `fixed_layout` | Reflow versus preservation of source-page composition |
| Page Grouping (`pageGrouping`) | `single`, `spread` | Independent pages versus facing-page composition |
| Sectioning Mode (`sectioningMode`) | `page`, `dynamic` | Page-level sections versus selective activity-based splitting |
| Activities Generator (`activitiesGenerator`) | `enabled`, `disabled` | Whether existing activities should be converted to interactive content |
| Figure Extraction (`figureExtraction`) | `off`, `auto`, `all` | How composite figure candidates are created and retained |

The selected stable Preset still uses **baseline wording**. Preset Specs v1 and v2 remain experimental definitions under [`src/experiments/`](../src/experiments/). Neither is part of PoC V1. The prose in [`specs/`](../specs/) provides historical ADT context; where it differs from current runtime wording, the TypeScript Decision Specs are authoritative for this PoC. These labels are not presented as an official UNICEF taxonomy.

## 8. Running and reading output

Install dependencies and set `OPENAI_API_KEY` and `OPENAI_MODEL` in `.env` as described in the [root README](../README.md). A PowerShell run using the default variant is:

```powershell
npm.cmd run recommend:openai -- "pdfs/storybook-1930-el-viaje.pdf" --user-language pt-BR
```

For a book basename `<book>`, the CLI writes `output/<book>.openai-recommendation.poc-v1.json` and evidence PNGs in `output/evidence/<book>/poc-v1/`. Repeating a run for the same book and variant writes to those same locations. A small representative excerpt of the V2 output shape is:

```json
{
  "provider": "openai",
  "model": "<configured model>",
  "promptVersion": "adt-config-recommender-poc-v1",
  "userLanguage": "pt-BR",
  "recommendation": {
    "preset": {
      "choice": "storybook",
      "confidence": "medium",
      "reason": "<explanation>",
      "alternative": null,
      "ambiguityReason": null,
      "evidencePages": []
    }
  },
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0
  }
}
```

The excerpt omits the other five decisions and metadata such as `sourcePdf`, `pdfBasename`, `timestamp`, `bookProfile`, `sampledPagePairs`, and `timing`. The displayed choice and token numbers are illustrative, not a recorded result; token counts may be unavailable. The actual recommendation includes all six decisions.

## 9. Evaluation and selection

The [frozen benchmark](../evaluation/benchmark.json) has **18 manually validated decisions across four books**: 6 + 4 + 4 + 4. The selected configuration recorded **15/18 agreement**. A manually working configuration is a known-good reference, not necessarily the only valid answer; unvalidated fields are omitted from scoring. The benchmark books also participated in prompt and spec iteration, so this is **in-sample evidence of viability**, not a generalization result. Reference and Egito were diagnostic cases outside the denominator; Egito has no manual ground truth. See [evaluation semantics](../evaluation/README.md).

The historical `v2-render-specs` configuration was the strongest integrated measured candidate and became PoC V1. **Render Specs v1** was selected. **Preset Specs v2** was the strongest isolated Preset wording experiment, improving Preset agreement to 4/4, but its combined call caused three non-Preset primary changes, all in Render Strategy, and reached 14/18 overall. It was frozen for study, not promoted into stable PoC V1. See the [experiment records](../experiments/README.md).

## 10. Boundaries

Recommendations should be reviewed by a person. The limited sample, proxy measurements, categorical model confidence, shared six-decision call, and lack of a final compatibility resolver all limit autonomous use. [Architecture](ARCHITECTURE.md) describes module boundaries; [Limitations](LIMITATIONS.md) records known issues and high-level PoC V2 investigation areas.
