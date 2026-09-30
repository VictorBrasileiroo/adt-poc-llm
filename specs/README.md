# ADT Decision Specifications

These files document the ADT domain knowledge used by this POC. They were derived from behavior and documentation in the current `develop` branch of ADT Studio.

The Markdown files are human-readable references. They are not parsed or sent in full to the model. The compact runtime representation used by the recommender lives in `src/decision/specs.ts`.

Primary ADT source paths reviewed for this knowledge are:

- `apps/studio/src/components/wizard/constants.ts`
- `apps/studio/src/components/wizard/step2LayoutOptions/RenderStrategyPicker.tsx`
- `apps/studio/src/components/wizard/step2LayoutOptions/PageGroupingMode.tsx`
- `apps/studio/src/components/wizard/step2LayoutOptions/SectioningMode.tsx`
- `apps/studio/src/components/wizard/step3ContentProcessing/index.tsx`
- `apps/studio/src/components/wizard/bookCreationConfig.ts`
- `packages/types/src/config.ts`
- `packages/pipeline/src/pdf-extraction.ts`

The six runtime decisions in this POC are preset, render strategy, page grouping, sectioning mode, activity conversion, and figure extraction. Relationships recorded in these documents are ADT context, not executable rules or constraints.
