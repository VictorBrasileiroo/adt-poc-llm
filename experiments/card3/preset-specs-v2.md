# Preset Specs v2 with Render Specs v1

- **Objective / hypothesis:** Refine Preset wording to prioritize evidence of a book's genre and primary purpose while retaining Render Specs v1.
- **Variant ID:** `v2-render-specs-v1-preset-specs-v2`
- **PromptVersion:** `adt-multimodal-v2-render-specs-v1-preset-specs-v2`
- **Control variant:** `v2-render-specs` (15/18 agreement).
- **Decision Knowledge changed:** Preset only relative to the control; Render Strategy remained Render Specs v1, and the other four decisions remained baseline. The historical Preset wording is in [`src/experiments/decision-specs.ts`](../../src/experiments/decision-specs.ts).
- **Books used:** The four scored benchmark books. Reference and Egito were diagnostic cases and excluded from scoring.
- **Benchmark result:** 14/18 overall agreement; Preset agreement improved to 4/4.
- **Qualitative findings:** This was the strongest Preset wording experiment. El viaje showed that genre evidence can be present yet misweighted; Egito exposed an unresolved textbook/reference boundary and confidence-calibration issue.
- **Collateral changes / drift:** Three non-Preset primary changes occurred relative to the Render Specs v1 control, all in Render Strategy. This showed cross-decision drift in the shared call.
- **Final decision:** Freeze Preset Specs v2 as an experimental result, but do not integrate it into stable PoC V1 because the combined configuration drifted and reached only 14/18 overall.
- **Part of PoC V1:** No.
