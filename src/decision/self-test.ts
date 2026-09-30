import assert from "node:assert/strict";

import {
  ACTIVITIES_SPEC,
  DECISION_SPECS,
  FIGURE_EXTRACTION_SPEC,
  PAGE_GROUPING_SPEC,
  PRESET_SPEC,
  RENDER_STRATEGY_SPEC,
  SECTIONING_MODE_SPEC,
} from "./specs.js";
import type { ChoiceDecisionSpec } from "./types.js";

const specs: readonly ChoiceDecisionSpec[] = DECISION_SPECS;

assert.equal(specs.length, 6);
assert.deepEqual(
  specs.map(({ id }) => id),
  [
    "preset",
    "renderStrategy",
    "pageGrouping",
    "sectioningMode",
    "activitiesGenerator",
    "figureExtraction",
  ],
);

for (const spec of specs) {
  assert.ok(spec.id.trim().length > 0, "Every spec must have an id");
  assert.ok(
    spec.instructions.trim().length > 0,
    `${spec.id} must have instructions`,
  );
  assert.ok(spec.options.length >= 2, `${spec.id} must have at least two options`);

  const optionIds = spec.options.map(({ id }) => id);
  assert.equal(
    new Set(optionIds).size,
    optionIds.length,
    `${spec.id} option ids must be unique`,
  );

  assert.ok(
    wordCount(spec.instructions) <= 20,
    `${spec.id} instructions must remain compact`,
  );

  for (const option of spec.options) {
    assert.ok(option.description.trim().length > 0);
    assert.ok(
      wordCount(option.description) <= 25,
      `${spec.id}.${option.id} description must remain compact`,
    );
  }
}

assertOptionIds(PRESET_SPEC, ["textbook", "storybook", "reference"]);
assert.ok(!getOptionIds(PRESET_SPEC).includes("custom"));

assertOptionIds(RENDER_STRATEGY_SPEC, [
  "llm",
  "llm-overlay",
  "single_column",
  "two_column_story",
  "fixed_layout",
]);
assert.ok(!getOptionIds(RENDER_STRATEGY_SPEC).includes("two_column"));

assertOptionIds(PAGE_GROUPING_SPEC, ["single", "spread"]);
assertOptionIds(SECTIONING_MODE_SPEC, ["page", "dynamic"]);
assertOptionIds(ACTIVITIES_SPEC, ["enabled", "disabled"]);
assertOptionIds(FIGURE_EXTRACTION_SPEC, ["off", "auto", "all"]);

console.log("Decision specs self-test passed.");

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function getOptionIds(spec: ChoiceDecisionSpec): string[] {
  return spec.options.map(({ id }) => id);
}

function assertOptionIds(
  spec: ChoiceDecisionSpec,
  expectedIds: readonly string[],
): void {
  assert.deepEqual(getOptionIds(spec), expectedIds);
}
