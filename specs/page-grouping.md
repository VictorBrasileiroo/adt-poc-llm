# Page Grouping

## Purpose

Page grouping controls whether each PDF page becomes an independent screen or facing pages become one wide screen.

## Options

### single

- **Meaning:** Every page becomes its own screen, one after another.
- **Good fit / intended use:** Predominantly single-page books, including books with only a few exceptional spreads.
- **Relevant ADT context:** Exceptional spread pairs can be joined manually later in the Extract step. Textbook and reference presets currently recommend `single`.
- **Important caveats:** Choosing `single` does not prevent later manual merging of genuine spreads.

### spread

- **Meaning:** Facing pages join into one wide screen so a picture crossing the gutter stays whole.
- **Good fit / intended use:** Books where compositions frequently span facing pages.
- **Relevant ADT context:** The storybook preset currently recommends `spread`.
- **Important caveats:** Landscape orientation alone does not establish that a page pair is a spread.

## Current preset recommendations

Storybook currently recommends `spread`; textbook and reference recommend `single`. These mappings are contextual and are not runtime rules.

## POC notes

The current BookProfile has no reliable facing-page spread signal. A better spread detector may be added to the Book Analyzer later, but no `spreadLikelihood` field is invented here.
