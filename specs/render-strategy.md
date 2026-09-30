# Render Strategy

## Purpose

Render strategy controls how ADT transforms or preserves each page's visual composition.

## Options

### llm

- **Meaning:** Dynamic, AI-powered layout that adapts to each page's content.
- **Good fit / intended use:** Content that benefits from page-specific layout reorganization.
- **Relevant ADT context:** The textbook preset currently recommends it.
- **Important caveats:** The runtime description expresses suitability, not a forced preset mapping.

### llm-overlay

- **Meaning:** Dynamic Overlay; AI-powered layout preserving the original page as a background with text overlay.
- **Good fit / intended use:** Pages whose original visual context should remain visible while text is overlaid.
- **Relevant ADT context:** It is one of the render strategies recommended for storybooks.
- **Important caveats:** It remains an independent runtime choice.

### single_column

- **Meaning:** A reflowable, full-width single-column template.
- **Good fit / intended use:** Reference material, documentation, and dense technical content.
- **Relevant ADT context:** The reference preset currently recommends it.
- **Important caveats:** No density threshold automatically selects it in this block.

### two_column

- **Meaning:** A clean, continuous two-column reading template described as suitable for novels.
- **Good fit / intended use:** Continuous reading experiences.
- **Relevant ADT context:** The strategy exists in code but is currently marked `hidden: true` in the wizard.
- **Important caveats:** Documented for completeness but intentionally excluded from the runtime choices.

### two_column_story

- **Meaning:** A template pairing large images with minimal text.
- **Good fit / intended use:** Illustrated children's books and similar visual stories.
- **Relevant ADT context:** The storybook preset currently recommends it.
- **Important caveats:** The preset relationship is contextual, not executable.

### fixed_layout

- **Meaning:** Uses the original page image as a background with positioned text extracted from the PDF.
- **Good fit / intended use:** Illustrated storybooks whose original composition should be preserved.
- **Relevant ADT context:** In the current wizard, activity detection, figure extraction, image cropping, and image segmentation do not apply to fixed layout.
- **Important caveats:** Those relationships are documented only; no constraint resolver or automatic overrides exist in this POC.

## Current preset recommendations

Textbook currently recommends `llm`, reference recommends `single_column`, and storybook recommends `two_column_story` while also listing `llm-overlay` as recommended. These are not encoded as dependencies.

## POC notes

The runtime choices are `llm`, `llm-overlay`, `single_column`, `two_column_story`, and `fixed_layout`. Hidden `two_column` is not available to the recommender.
