# Preset Specs v1 with Render Specs v1

- **Objective / hypothesis:** Test revised Preset Decision Knowledge while retaining the selected Render Specs v1 wording.
- **Variant ID:** `v2-render-specs-v1-preset-specs-v1`
- **PromptVersion:** `adt-multimodal-v2-render-specs-v1-preset-specs-v1`
- **Control variant:** `v2-render-specs` (15/18 agreement).
- **Decision Knowledge changed:** Preset only relative to the control; Render Strategy remained Render Specs v1, and the other four decisions remained baseline. The Preset wording is in [`src/experiments/decision-specs.ts`](../../src/experiments/decision-specs.ts).
- **Books used:** The four scored benchmark books. Reference and Egito were diagnostic cases and excluded from scoring.
- **Benchmark result:** 14/18 overall agreement; Preset agreement remained 3/4.
- **Qualitative findings:** The Preset revision did not improve Preset agreement in the scored set.
- **Collateral changes / drift:** Collateral Render Strategy changes appeared despite changing only Preset Decision Knowledge. All six decisions shared one model call.
- **Final decision:** Not selected.
- **Part of PoC V1:** No.
