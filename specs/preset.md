# Preset

## Purpose

The preset identifies the broad ADT workflow that best matches the book. Current preset recommendations provide context for later decisions, but they are not mandatory rules.

## Options

### textbook

- **Meaning:** Textbooks & Activities; structured chapters and exercises for educational content with complex layouts.
- **Good fit / intended use:** School textbooks and workbooks, university academic publications, scientific papers and journals, and technical manuals with diagrams.
- **Relevant ADT context:** Currently recommends `llm`, `single`, `dynamic`, activity generation enabled, and figure extraction `auto`.
- **Important caveats:** These recommendations are evidence from the current ADT preset, not constraints.

### storybook

- **Meaning:** Narrative flow with large images, intended for illustrated books and high-fidelity TTS voices.
- **Good fit / intended use:** Illustrated children's books, young adult fiction, chapter books with images, picture books, and early readers.
- **Relevant ADT context:** Currently recommends `two_column_story`, `spread`, and `page`; its recommended render strategies include `llm-overlay` and `two_column_story`.
- **Important caveats:** The preset context does not force any of those choices in this POC.

### reference

- **Meaning:** Dense text, tables, or glossaries for technical material and documentation.
- **Good fit / intended use:** Technical documentation, legal and compliance manuals, medical references, and engineering handbooks.
- **Relevant ADT context:** Currently recommends `single_column`, `single`, `page`, and figure extraction `auto`.
- **Important caveats:** These recommendations remain contextual rather than mandatory.

### custom

- **Meaning:** Full control over render strategies, pruning, and filters.
- **Good fit / intended use:** Any content type, specialized workflows, experimental configurations, and multi-format publications.
- **Relevant ADT context:** Represents manual control rather than a semantic book preset.
- **Important caveats:** Documented for completeness but intentionally excluded from the runtime choices available to the recommender.

## Current preset recommendations

The current mappings above describe ADT defaults or recommendations. This block does not encode them as rules, weights, scores, or constraints.

## POC notes

Only `textbook`, `storybook`, and `reference` appear in the compact runtime spec. The recommender evaluates this decision using the supplied BookProfile and sampled-page evidence.
