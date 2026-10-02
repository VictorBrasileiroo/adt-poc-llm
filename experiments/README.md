# Experiment history and PoC V1 selection

The scored results below are **agreement with the 18 manually validated decisions** in [`evaluation/benchmark.json`](../evaluation/benchmark.json). Diagnostic books do not enter the denominator. See the [evaluation notes](../evaluation/README.md) for its limits.

| Variant | Prompt version | Agreement | Outcome |
| --- | --- | ---: | --- |
| `v2` | `adt-multimodal-v2` | 13/18 | Baseline control |
| `v2-render-specs` | `adt-multimodal-v2-render-specs-v1` | 15/18 | Selected integrated basis |
| `v2-render-specs-v2` | `adt-multimodal-v2-render-specs-v2` | 13/18 | Diagnostic; not selected |
| `v2-render-specs-v1-preset-specs-v1` | `adt-multimodal-v2-render-specs-v1-preset-specs-v1` | 14/18 | Not selected |
| `v2-render-specs-v1-preset-specs-v2` | `adt-multimodal-v2-render-specs-v1-preset-specs-v2` | 14/18 | Preset wording frozen; not integrated |

The stable, provisional **PoC V1** uses V2 ambiguity-aware behavior, baseline Preset, Render Specs v1, baseline Page Grouping, baseline Sectioning, baseline Activities Generator, and baseline Figure Extraction. Its canonical variant is `poc-v1`, with promptVersion `adt-config-recommender-poc-v1`. The historical `v2-render-specs` variant sends equivalent requests with its historical promptVersion.

Render Specs v1 gave the strongest integrated measured result, **15/18**, with low collateral drift relative to the other cumulative experiments and improved Render Strategy semantics. It was selected as a human-reviewed provisional PoC V1 baseline. This does not establish production readiness.

## Card 3 records

- [Render Specs v1](card3/render-specs-v1.md)
- [Render Specs v2](card3/render-specs-v2.md)
- [Preset Specs v1](card3/preset-specs-v1.md)
- [Preset Specs v2](card3/preset-specs-v2.md)

## Cross-experiment findings

- Preset Specs v2 improved Preset behavior, but its combined configuration did not produce the strongest integrated result.
- El viaje showed that a model can misweight evidence even when genre evidence is present.
- Egito exposed an unresolved textbook/reference boundary and confidence-calibration issue. It has no manual ground truth and is not scored.
- Changing one Decision Spec can affect another decision because all six decisions currently share one model call.
- Page Grouping may be biased by the contact-sheet presentation.
- Further prompt and spec tuning was intentionally stopped to avoid an experiment snowball and overfitting the small benchmark.

The experiment definitions remain in [`src/experiments/`](../src/experiments/); the selected stable definitions are in [`src/decision/specs.ts`](../src/decision/specs.ts). Generated local outputs and evidence remain under ignored `output/` and are not part of these frozen documents.
