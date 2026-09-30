# Figure Extraction

## Purpose

Figure extraction controls whether ADT creates composite figure candidates by combining artwork with nearby selectable text.

## Options

### off

- **Meaning:** Extracts raster and vector artwork without merging nearby selectable text into composite page crops.
- **Good fit / intended use:** Content where artwork and semantic text should remain separate.
- **Relevant ADT context:** This setting does not mean that artwork extraction itself is disabled.
- **Important caveats:** It specifically prevents creation of composite figures combining artwork and nearby text.

### auto

- **Meaning:** Creates composite candidates and uses image meaningfulness to retain only candidates better represented as images than semantic HTML.
- **Good fit / intended use:** Charts, labeled images, and complex infographics while preserving headings, callouts, and conventional tables as accessible HTML.
- **Relevant ADT context:** Textbook and reference presets currently recommend `auto`.
- **Important caveats:** Candidate retention is selective rather than exhaustive.

### all

- **Meaning:** Creates every composite candidate and leaves retention to the normal image filters.
- **Good fit / intended use:** Workflows that need all composite candidates before ordinary filtering.
- **Relevant ADT context:** It is broader than `auto` because meaningfulness does not perform the initial selective retention.
- **Important caveats:** Normal image filters still determine what remains.

## Current preset recommendations

Textbook and reference currently recommend `auto`; storybook has no explicit current recommendation. Fixed layout does not use figure extraction. These relationships are documentation, not constraints.

## POC notes

The compact runtime IDs are exactly `off`, `auto`, and `all`. No image extraction behavior or fixed-layout override is implemented here.
