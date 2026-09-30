# Section Mode

## Purpose

Section mode controls whether ADT keeps a page together or may split it when distinct activity types occur on the same page.

## Options

### page

- **Meaning:** Treats the entire page as a single section, keeping all text and images together.
- **Good fit / intended use:** Storybooks, reference books, and self-contained pages.
- **Relevant ADT context:** Storybook and reference presets currently recommend `page`.
- **Important caveats:** The selection is not inferred automatically in this block.

### dynamic

- **Meaning:** Keeps the page whole by default but splits it when multiple distinct activity types are detected.
- **Good fit / intended use:** Textbooks containing varied exercises such as multiple-choice, open-ended, and sorting activities on one page.
- **Relevant ADT context:** The textbook preset currently recommends `dynamic`.
- **Important caveats:** The current BookProfile only has an aggregate activity-signal ratio and does not classify activity types.

## Current preset recommendations

Textbook currently recommends `dynamic`; storybook and reference recommend `page`. These recommendations are documented but not codified as rules.

## POC notes

The compact spec describes both options without implementing activity classification, page splitting, or dependencies on preset.
