# Activity Converter

## Purpose

The Activity Converter detects activities already present in a book and transforms them into interactive HTML controls such as radio buttons and text inputs.

## Options

### enabled

- **Meaning:** Makes activity section types available for classification and permits interactive activity rendering.
- **Good fit / intended use:** Books containing existing exercises or activities that should become interactive.
- **Relevant ADT context:** Corresponds to the internal `generate_activities` flag being enabled. The textbook preset currently recommends it.
- **Important caveats:** Detection remains part of ADT processing; the Book Analyzer's activity signal is only a future source of evidence.

### disabled

- **Meaning:** Hides activity section types from the classifier and skips activities during rendering.
- **Good fit / intended use:** Reading-focused books without activities needing interactive conversion.
- **Relevant ADT context:** Storybook and reference have no active activity-generation recommendation in the current presets.
- **Important caveats:** Absence of a preset recommendation is not itself a mandatory disabled state.

## Current preset recommendations

Textbook currently recommends activity generation. Fixed layout automatically disables it in the configuration built by the wizard. Neither relationship is encoded as a rule in this block.

## POC notes

The runtime values are `enabled` and `disabled`. `activities.activitySignalPageRatio` may provide later evidence, but it is not connected to these choices yet.
