# Render Strategy Specs v1

- **Objective / hypothesis:** Improve Render Strategy recommendations by replacing the baseline Render Strategy Decision Knowledge with more explicit option semantics.
- **Variant ID:** `v2-render-specs`
- **PromptVersion:** `adt-multimodal-v2-render-specs-v1`
- **Control variant:** `v2` (13/18 agreement).
- **Decision Knowledge changed:** Render Strategy only. Baseline Preset, Page Grouping, Sectioning, Activities Generator, and Figure Extraction remained in the composition. The exact wording is now owned by `POC_V1_RENDER_STRATEGY_SPEC` in [`src/decision/specs.ts`](../../src/decision/specs.ts).
- **Books used:** The four scored books in [`evaluation/benchmark.json`](../../evaluation/benchmark.json). Reference and Egito were diagnostic cases and did not enter the denominator.
- **Benchmark result:** 15/18 agreement, versus 13/18 for the V2 control.
- **Qualitative findings:** The Render Strategy semantics improved the integrated recommendation set. Page Grouping remains potentially sensitive to contact-sheet presentation.
- **Collateral changes / drift:** Low collateral drift relative to the later cumulative experiments; the documented comparison does not quantify it further.
- **Final decision:** Selected as the integrated basis for provisional, human-reviewed PoC V1.
- **Part of PoC V1:** Yes. Canonical `poc-v1` uses the same Decision Knowledge and V2 prompt behavior.
