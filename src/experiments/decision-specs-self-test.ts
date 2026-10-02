import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  ACTIVITIES_SPEC,
  DECISION_SPECS,
  FIGURE_EXTRACTION_SPEC,
  PAGE_GROUPING_SPEC,
  POC_V1_DECISION_SPECS,
  POC_V1_RENDER_STRATEGY_SPEC,
  PRESET_SPEC,
  RENDER_STRATEGY_SPEC,
  SECTIONING_MODE_SPEC,
} from "../decision/specs.js";
import type { ChoiceDecisionSpec } from "../decision/types.js";
import { buildOpenAIDecisionContext } from "../recommendation/openai-prompt.js";
import {
  CARD3_DECISION_SPECS,
  CARD3_PRESET_DECISION_SPECS,
  CARD3_PRESET_SPEC,
  CARD3_PRESET_SPEC_V2,
  CARD3_PRESET_V2_DECISION_SPECS,
  CARD3_RENDER_STRATEGY_SPEC,
  CARD3_V2_DECISION_SPECS,
  CARD3_V2_RENDER_STRATEGY_SPEC,
} from "./decision-specs.js";

const specs: readonly ChoiceDecisionSpec[] = DECISION_SPECS;

assert.strictEqual(POC_V1_DECISION_SPECS, CARD3_DECISION_SPECS);
for (const spec of POC_V1_DECISION_SPECS) {
  assert.notStrictEqual(spec, CARD3_PRESET_SPEC);
  assert.notStrictEqual(spec, CARD3_PRESET_SPEC_V2);
  assert.notStrictEqual(spec, CARD3_V2_RENDER_STRATEGY_SPEC);
}

assert.deepEqual(CARD3_DECISION_SPECS.map(({ id }) => id), specs.map(({ id }) => id));
assert.notStrictEqual(CARD3_RENDER_STRATEGY_SPEC, RENDER_STRATEGY_SPEC);
assert.notStrictEqual(CARD3_RENDER_STRATEGY_SPEC.options, RENDER_STRATEGY_SPEC.options);
assert.equal(CARD3_RENDER_STRATEGY_SPEC.instructions, RENDER_STRATEGY_SPEC.instructions);
assertOptionIds(CARD3_RENDER_STRATEGY_SPEC, getOptionIds(RENDER_STRATEGY_SPEC));
assert.deepEqual(
  CARD3_DECISION_SPECS
    .filter((spec, index) => JSON.stringify(spec) !== JSON.stringify(DECISION_SPECS[index]))
    .map(({ id }) => id),
  ["renderStrategy"],
);
for (let index = 0; index < DECISION_SPECS.length; index++) {
  if (index !== 1) assert.strictEqual(CARD3_DECISION_SPECS[index], DECISION_SPECS[index]);
}
assert.notStrictEqual(CARD3_PRESET_SPEC, PRESET_SPEC);
assert.notStrictEqual(CARD3_PRESET_SPEC.options, PRESET_SPEC.options);
assert.notEqual(CARD3_PRESET_SPEC.instructions, PRESET_SPEC.instructions);
assertOptionIds(CARD3_PRESET_SPEC, getOptionIds(PRESET_SPEC));
for (let index = 0; index < PRESET_SPEC.options.length; index++) {
  assert.notEqual(CARD3_PRESET_SPEC.options[index]!.description, PRESET_SPEC.options[index]!.description);
}
assert.deepEqual(CARD3_PRESET_DECISION_SPECS.map(({ id }) => id), specs.map(({ id }) => id));
assert.deepEqual(
  CARD3_PRESET_DECISION_SPECS
    .filter((spec, index) => JSON.stringify(spec) !== JSON.stringify(CARD3_DECISION_SPECS[index]))
    .map(({ id }) => id),
  ["preset"],
);
for (let index = 1; index < CARD3_DECISION_SPECS.length; index++) {
  assert.strictEqual(CARD3_PRESET_DECISION_SPECS[index], CARD3_DECISION_SPECS[index]);
}
assert.strictEqual(CARD3_PRESET_DECISION_SPECS[1], CARD3_RENDER_STRATEGY_SPEC);
assert.strictEqual(CARD3_PRESET_DECISION_SPECS[2], PAGE_GROUPING_SPEC);
assert.strictEqual(CARD3_PRESET_DECISION_SPECS[3], SECTIONING_MODE_SPEC);
assert.strictEqual(CARD3_PRESET_DECISION_SPECS[4], ACTIVITIES_SPEC);
assert.strictEqual(CARD3_PRESET_DECISION_SPECS[5], FIGURE_EXTRACTION_SPEC);
assert.notStrictEqual(CARD3_PRESET_SPEC_V2, PRESET_SPEC);
assert.notStrictEqual(CARD3_PRESET_SPEC_V2, CARD3_PRESET_SPEC);
assert.notStrictEqual(CARD3_PRESET_SPEC_V2.options, CARD3_PRESET_SPEC.options);
assertOptionIds(CARD3_PRESET_SPEC_V2, getOptionIds(CARD3_PRESET_SPEC));
assert.equal(CARD3_PRESET_V2_DECISION_SPECS.length, CARD3_DECISION_SPECS.length);
assert.strictEqual(CARD3_PRESET_V2_DECISION_SPECS[0], CARD3_PRESET_SPEC_V2);
assert.strictEqual(CARD3_PRESET_V2_DECISION_SPECS[1], CARD3_RENDER_STRATEGY_SPEC);
assert.notStrictEqual(CARD3_PRESET_V2_DECISION_SPECS[1], CARD3_V2_RENDER_STRATEGY_SPEC);
for (let index = 1; index < CARD3_DECISION_SPECS.length; index++) {
  assert.strictEqual(CARD3_PRESET_V2_DECISION_SPECS[index], CARD3_DECISION_SPECS[index]);
  assert.strictEqual(CARD3_PRESET_V2_DECISION_SPECS[index], CARD3_PRESET_DECISION_SPECS[index]);
}
for (const baseline of [CARD3_DECISION_SPECS, CARD3_PRESET_DECISION_SPECS]) {
  assert.deepEqual(
    CARD3_PRESET_V2_DECISION_SPECS
      .filter((spec, index) => JSON.stringify(spec) !== JSON.stringify(baseline[index]))
      .map(({ id }) => id),
    ["preset"],
  );
}
assert.notEqual(CARD3_PRESET_SPEC_V2.instructions, CARD3_PRESET_SPEC.instructions);
for (let index = 0; index < CARD3_PRESET_SPEC.options.length; index++) {
  assert.equal(CARD3_PRESET_SPEC_V2.options[index]!.id, CARD3_PRESET_SPEC.options[index]!.id);
  assert.notEqual(CARD3_PRESET_SPEC_V2.options[index]!.description, CARD3_PRESET_SPEC.options[index]!.description);
}
for (let index = 0; index < RENDER_STRATEGY_SPEC.options.length; index++) {
  assert.notEqual(
    CARD3_RENDER_STRATEGY_SPEC.options[index]!.description,
    RENDER_STRATEGY_SPEC.options[index]!.description,
  );
}
assert.deepEqual(CARD3_V2_DECISION_SPECS.map(({ id }) => id), specs.map(({ id }) => id));
assert.equal(CARD3_V2_RENDER_STRATEGY_SPEC.instructions, RENDER_STRATEGY_SPEC.instructions);
assertOptionIds(CARD3_V2_RENDER_STRATEGY_SPEC, getOptionIds(RENDER_STRATEGY_SPEC));
assert.deepEqual(
  CARD3_V2_DECISION_SPECS
    .filter((spec, index) => JSON.stringify(spec) !== JSON.stringify(DECISION_SPECS[index]))
    .map(({ id }) => id),
  ["renderStrategy"],
);
assert.deepEqual(
  CARD3_V2_RENDER_STRATEGY_SPEC.options
    .filter((option, index) => option.description !== CARD3_RENDER_STRATEGY_SPEC.options[index]?.description)
    .map(({ id }) => id),
  ["llm-overlay", "single_column", "two_column_story"],
);
assert.strictEqual(CARD3_V2_RENDER_STRATEGY_SPEC.options[0], CARD3_RENDER_STRATEGY_SPEC.options[0]);
assert.strictEqual(CARD3_V2_RENDER_STRATEGY_SPEC.options[4], CARD3_RENDER_STRATEGY_SPEC.options[4]);
for (let index = 0; index < DECISION_SPECS.length; index++) {
  if (index !== 1) assert.strictEqual(CARD3_V2_DECISION_SPECS[index], DECISION_SPECS[index]);
}
for (const title of [
  "praticas de alfabetizacao e de matematica",
  "hyena and raven",
  "colouring my school",
  "el viaje",
  "reimagining target aware molecular",
]) {
  for (const spec of [CARD3_RENDER_STRATEGY_SPEC, CARD3_V2_RENDER_STRATEGY_SPEC]) {
    assert.ok(spec.options.every(
      ({ description }) => !description.toLowerCase().includes(title),
    ));
  }
}

assert.strictEqual(CARD3_RENDER_STRATEGY_SPEC, POC_V1_RENDER_STRATEGY_SPEC);
for (const [name, composition, expectedHash] of [
  ["render-v1", CARD3_DECISION_SPECS, "e79bafab8955d959a1d9b8bc180e0d815e7960886f6c2a459a199ce2cef6ea8e"],
  ["preset-v1", CARD3_PRESET_DECISION_SPECS, "fd2f54c680d0a127364a5d07611a8267bc87866eb6ca8a2815d0d6fe1db7485d"],
] as const) {
  assert.equal(createHash("sha256").update(buildOpenAIDecisionContext(composition)).digest("hex"), expectedHash, name);
}

console.log("Experimental decision specs self-test passed.");

function getOptionIds(spec: ChoiceDecisionSpec): string[] {
  return spec.options.map(({ id }) => id);
}

function assertOptionIds(
  spec: ChoiceDecisionSpec,
  expectedIds: readonly string[],
): void {
  assert.deepEqual(getOptionIds(spec), expectedIds);
}
