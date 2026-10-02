# Frozen evaluation benchmark

[`benchmark.json`](benchmark.json) contains only manually validated decisions for four books. It measures **agreement with manually validated configurations**, not formal model accuracy. Each manual configuration is known to have worked, but it may not be the only valid configuration. Some decisions were never manually validated, so only fields present under each book's `decisions` are scored. The fixed denominator is **6 + 4 + 4 + 4 = 18 decisions**. Missing fields are unscored; they are not negative labels or `null` values.

The `id` of each benchmark book matches its source PDF basename under `pdfs/`. The benchmark does not contain generated recommendations or model outputs.

## Diagnostic books outside the benchmark

- **Reference / Reimagining Target-Aware Molecular** (`reference-reimagining-target-aware-molecular`): historical manually useful configuration was `preset: reference`, `renderStrategy: single_column`, `pageGrouping: single`, `sectioningMode: page`, and `figureExtraction: auto`. `activitiesGenerator` was **undefined**. This book is diagnostic only and excluded from the 18-decision denominator.
- **Egito Antigo** (`textbook-egito-antigo`): diagnostic, out-of-sample case with no manual ground truth. It is excluded from benchmark scoring. Its filename must not be used to infer a label.

## Generated-artifact policy

Version-control benchmark definitions, small structured summaries, experiment documentation, and the code and specs needed to reproduce the work. Normally keep large source PDFs, generated contact-sheet PNGs, recommendation JSONs from local runs, and credentials or secrets out of version control. A small curated fixture may be committed intentionally when an automated test needs it.

The current `.gitignore` already excludes `output/` (including recommendation JSONs and `output/evidence/` contact sheets), `.env`, and `.env.local`. It excludes `src/pdfs/` but not the repository's actual `pdfs/` directory. The existing source PDFs are tracked. A future policy change could add `pdfs/` to `.gitignore` for new PDFs; that alone would not untrack the existing six PDFs. No artifact was moved or removed in this block.
