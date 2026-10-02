# Render Strategy Specs v2

- **Objective / hypothesis:** Test revised Render Strategy option wording for ambiguity and confidence calibration after Render Specs v1.
- **Variant ID:** `v2-render-specs-v2`
- **PromptVersion:** `adt-multimodal-v2-render-specs-v2`
- **Control variant:** `v2-render-specs` (Render Specs v1, 15/18 agreement).
- **Decision Knowledge changed:** Render Strategy wording only; Preset and the other four decisions kept baseline specs. The historical wording is in [`src/experiments/decision-specs.ts`](../../src/experiments/decision-specs.ts).
- **Books used:** The four scored benchmark books. Reference was diagnostic and excluded from scoring.
- **Benchmark result:** 13/18 agreement.
- **Qualitative findings:** Useful for ambiguity and calibration diagnostics, but it did not improve integrated agreement.
- **Collateral changes / drift:** The integrated result fell from the 15/18 control; no separate collateral-change count was frozen for this experiment.
- **Final decision:** Not selected.
- **Part of PoC V1:** No.
