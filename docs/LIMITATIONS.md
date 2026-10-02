# PoC V1 limitations and known issues

These limits describe the current implementation. They are reasons to review each recommendation with a person, not claims that every output is wrong.

## Evidence and extraction

- **No OCR or scanned-PDF detection.** Pages whose content is embedded mainly as images may yield little extracted text. The pipeline does not diagnose that condition before making a recommendation.
- **No extraction-quality diagnostics.** It does not measure encoding quality, text coherence, or whether extracted text preserves reading order. It also has no vector-art or tiled-image diagnostics.
- **Image counts are proxies.** The analyzer counts supported PDF image-painting operations, not distinct illustrations, visual area, or image importance. Vector artwork and repeated/tiled painting can make this signal misleading.
- **Structural heuristics are shallow.** The column heuristic uses text-item positions and thresholds. Activity signals use punctuation and simple enumeration patterns, not semantic activity detection. Sectioning evidence based on these cues can therefore be weak.

## Sampling and visual representation

- **Sparse deterministic sample.** At most three beginning/middle/end candidate pairs are chosen; selection does not optimize semantic coverage or diversity. For books of at least seven pages, the cover and last page are excluded. Important material may be missed.
- **Short text excerpts.** Each sampled page contributes at most the first 300 normalized extracted characters. Dense pages may omit the evidence that would distinguish choices.
- **Artificial pair layout.** Contact sheets place sampled pages side by side with a gray gap, regardless of whether the source pages form a real spread. This can bias `pageGrouping` toward a spread interpretation.

## Decision and confidence behavior

- **One shared model call.** All six decisions use the same prompt and evidence context. Card 3 experiments observed cross-decision coupling: changing Preset Decision Knowledge changed Render Strategy recommendations even when the Render wording was unchanged.
- **Uneven evidence.** Some decisions have weaker observable signals than others. In particular, `figureExtraction` has limited direct evidence from the current profile and sparse page sample; activity-related and sectioning signals are shallow proxies.
- **Uncalibrated confidence.** `low`, `medium`, and `high` are categorical judgments reported by the model, not statistically calibrated probabilities. A high-confidence choice can still be wrong.
- **No final compatibility resolver.** The output schema and semantic validator check individual option IDs, alternative relationships, and citations. They do not enforce cross-decision ADT constraints; a combination unsupported by ADT semantics could pass.

## Evaluation and reproducibility

- **Small, in-sample benchmark.** Only 18 decisions across four main books are scored. Those books participated in prompt and spec iteration, so the 15/18 agreement result does not establish generalization.
- **Known-good manual references, not unique ground truth.** A manually validated configuration worked, but another configuration could also work. Unvalidated decisions are not scored. Reference and Egito are diagnostic cases outside the denominator; Egito has no manual labels.
- **Run-to-run variance is unknown.** The recorded comparison does not provide a meaningful estimate of stochastic variance across repeated model runs, model changes, or different API conditions.

## Performance and integration

- **Multiple PDF passes.** The analyzer processes every page, then sampled text extraction and rendering open the PDF separately. Large books can spend substantial time in preprocessing before inference; total latency varies with document and model.
- **Standalone workflow.** The PoC does not reuse the ADT Studio extraction pipeline or artifacts and has no integrated UI, human override, or downstream conversion step. Local outputs are recommendation JSON and evidence PNGs, not an applied ADT configuration.

## Possible PoC V2 investigation areas

These are directions for later investigation, **not committed architecture**: extraction diagnostics; richer PageProfiles; better evidence sampling; avoiding misleading page-pair presentation; separating semantic/layout signals from configuration decisions; a deterministic recommendation and compatibility engine; user preferences for hybrid choices; a model benchmark including local and cloud options; frozen holdout evaluation; and easier ADT Studio integration or artifact reuse. No PoC V2 design is specified here.
