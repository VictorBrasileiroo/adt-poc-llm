import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { zodTextFormat } from "openai/helpers/zod";

import { DECISION_SPECS } from "../decision/specs.js";
import type {
  ActivitiesDecision,
  FigureExtractionDecision,
  PageGroupingDecision,
  PresetDecision,
  RenderStrategyDecision,
  SectioningModeDecision,
} from "../decision/types.js";
import type { BookProfile } from "../analyzer/types.js";
import {
  buildBookProfileContext,
  buildMultimodalRecommendationInput,
  buildOpenAIDecisionContext,
  OPENAI_RECOMMENDATION_INSTRUCTIONS,
} from "./openai-prompt.js";
import {
  OPENAI_CONFIDENCE_VALUES,
  OPENAI_RECOMMENDATION_SCHEMA,
  OPENAI_RECOMMENDATION_SCHEMA_V2,
  validateOpenAIRecommendations,
  type OpenAIBookConfigurationRecommendationV2,
  type OpenAIDecisionRecommendationV2,
  type OpenAIRecommendationOutputV2,
} from "./openai-schema.js";
import { renderSampledPagePairs } from "./page-renderer.js";
import {
  extractSampledPageTexts,
  MAX_EXTRACTED_CHARS_PER_PAGE,
  selectRepresentativePagePairs,
  truncateSampledPageText,
} from "./representative-pages.js";

const STORYBOOK_PROFILE: BookProfile = {
  pageCount: 32,
  text: {
    totalChars: 3_200,
    avgCharsPerPage: 100,
    medianCharsPerPage: 80,
    lowTextPageRatio: 0.9,
    highTextPageRatio: 0,
  },
  images: {
    totalImageOperations: 60,
    pagesWithImagesRatio: 0.95,
    avgImagesPerPage: 1.875,
  },
  layout: {
    landscapePageRatio: 0.03,
    multiColumnPageRatio: 0.02,
  },
  activities: {
    activitySignalPageRatio: 0.01,
  },
};

const expectedSelections = new Map<number, Array<readonly [number, number?]>>([
  [1, [[1]]],
  [2, [[1, 2]]],
  [3, [[1, 2], [3]]],
  [4, [[1, 2], [3, 4]]],
  [5, [[1, 2], [3, 4], [5]]],
  [10, [[2, 3], [6, 7], [8, 9]]],
  [100, [[2, 3], [50, 51], [98, 99]]],
]);

for (const [pageCount, expected] of expectedSelections) {
  const first = selectRepresentativePagePairs(pageCount);
  const second = selectRepresentativePagePairs(pageCount);
  assert.deepEqual(first, expected);
  assert.deepEqual(first, second, "Sampling must be deterministic");
  assert.ok(first.length <= 3);
  const flattened = first
    .flatMap((pair) => pair)
    .filter((page): page is number => page !== undefined);
  assert.equal(new Set(flattened).size, flattened.length);
  assert.ok(flattened.every((page) => page >= 1 && page <= pageCount));
}
assert.throws(() => selectRepresentativePagePairs(0), /at least one valid page/);
assert.equal(
  truncateSampledPageText("word ".repeat(100)).length <=
    MAX_EXTRACTED_CHARS_PER_PAGE,
  true,
);

const decisionContext = buildOpenAIDecisionContext();
for (const spec of DECISION_SPECS) {
  assert.ok(decisionContext.includes(spec.id));
  assert.ok(decisionContext.includes(spec.instructions));
  for (const option of spec.options) {
    assert.ok(decisionContext.includes(option.id));
    assert.ok(decisionContext.includes(option.description));
  }
}
assert.ok(OPENAI_RECOMMENDATION_INSTRUCTIONS.includes("untrusted evidence"));
assert.ok(buildBookProfileContext(STORYBOOK_PROFILE).includes('"pageCount": 32'));

const mockPair = {
  pages: [
    { pageNumber: 4, text: "First sampled text" },
    { pageNumber: 5, text: "Second sampled text" },
  ],
  imagePath: "pages-004-005.png",
  imageBuffer: Buffer.from("png"),
} as const;
const multimodalInput = JSON.stringify(
  buildMultimodalRecommendationInput(STORYBOOK_PROFILE, [mockPair]),
);
assert.ok(multimodalInput.includes("Page 4 extracted text"));
assert.ok(multimodalInput.includes("First sampled text"));
assert.ok(multimodalInput.includes("Page 5 extracted text"));
assert.ok(multimodalInput.includes("data:image/png;base64"));
assert.ok(!multimodalInput.toLowerCase().includes("ground truth"));

interface MutableRecommendation {
  choice: string;
  confidence: string;
  reason: string;
  evidencePages: number[];
}

const validRecommendation: Record<string, MutableRecommendation> = Object.fromEntries(
  DECISION_SPECS.map((spec) => [
    spec.id,
    {
      choice: spec.options[0].id,
      confidence: "medium",
      reason: "Supported by the supplied structural evidence.",
      evidencePages: [4, 5],
    },
  ]),
);
assert.equal(OPENAI_RECOMMENDATION_SCHEMA.safeParse(validRecommendation).success, true);
const structuredFormat = zodTextFormat(
  OPENAI_RECOMMENDATION_SCHEMA,
  "adt_configuration_recommendation",
);
assert.equal(structuredFormat.type, "json_schema");
assert.equal(structuredFormat.strict, true);
assert.doesNotThrow(() =>
  validateOpenAIRecommendations(validRecommendation, new Set([4, 5])),
);

const invalidChoice = structuredClone(validRecommendation);
invalidChoice.preset!.choice = "custom";
assert.equal(OPENAI_RECOMMENDATION_SCHEMA.safeParse(invalidChoice).success, false);

const invalidConfidence = structuredClone(validRecommendation);
invalidConfidence.preset!.confidence = "certain";
assert.equal(
  OPENAI_RECOMMENDATION_SCHEMA.safeParse(invalidConfidence).success,
  false,
);

const unsampledEvidence = structuredClone(validRecommendation);
unsampledEvidence.preset!.evidencePages = [4, 99];
assert.throws(
  () => validateOpenAIRecommendations(unsampledEvidence, new Set([4, 5])),
  /unsampled page 99/,
);

const duplicateEvidence = structuredClone(validRecommendation);
duplicateEvidence.preset!.evidencePages = [4, 4];
assert.throws(
  () => validateOpenAIRecommendations(duplicateEvidence, new Set([4, 5])),
  /unique and sorted/,
);

interface MutableRecommendationV2 extends MutableRecommendation {
  alternative: string | null;
  ambiguityReason: string | null;
}

const validOutputV2: {
  recommendation: Record<string, MutableRecommendationV2>;
} = {
  recommendation: Object.fromEntries(
    DECISION_SPECS.map((spec) => [
      spec.id,
      {
        choice: spec.options[0].id,
        confidence: "medium",
        reason: "Supported by the supplied structural evidence.",
        alternative: null,
        ambiguityReason: null,
        evidencePages: [4, 5],
      },
    ]),
  ),
};

const parsedOutputV2: OpenAIRecommendationOutputV2 =
  OPENAI_RECOMMENDATION_SCHEMA_V2.parse(validOutputV2);
assert.deepEqual(parsedOutputV2, validOutputV2);
assert.deepEqual(
  Object.keys(parsedOutputV2.recommendation),
  DECISION_SPECS.map(({ id }) => id),
);

// Compile-time equality checks prevent the inferred choices from widening to string.
type SameType<T, U> =
  (<V>() => V extends T ? 1 : 2) extends
  (<V>() => V extends U ? 1 : 2) ? true : false;
type ExpectedRecommendationV2 = {
  preset: OpenAIDecisionRecommendationV2<PresetDecision>;
  renderStrategy: OpenAIDecisionRecommendationV2<RenderStrategyDecision>;
  pageGrouping: OpenAIDecisionRecommendationV2<PageGroupingDecision>;
  sectioningMode: OpenAIDecisionRecommendationV2<SectioningModeDecision>;
  activitiesGenerator: OpenAIDecisionRecommendationV2<ActivitiesDecision>;
  figureExtraction: OpenAIDecisionRecommendationV2<FigureExtractionDecision>;
};
const recommendationTypesMatch: SameType<
  OpenAIBookConfigurationRecommendationV2,
  ExpectedRecommendationV2
> = true;
assert.equal(recommendationTypesMatch, true);

const structuredFormatV2 = zodTextFormat(
  OPENAI_RECOMMENDATION_SCHEMA_V2,
  "adt_configuration_recommendation_v2",
);
assert.equal(structuredFormatV2.type, "json_schema");
assert.equal(structuredFormatV2.strict, true);

for (const spec of DECISION_SPECS) {
  const acceptsDecision = (changes: Record<string, unknown>): boolean => {
    const output = structuredClone(validOutputV2);
    Object.assign(output.recommendation[spec.id]!, changes);
    return OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse(output).success;
  };

  for (const option of spec.options) {
    assert.equal(acceptsDecision({ choice: option.id }), true);
    assert.equal(acceptsDecision({
      alternative: option.id,
      ambiguityReason: "A second option is plausible from the evidence.",
    }), true);
  }
  for (const confidence of OPENAI_CONFIDENCE_VALUES) {
    assert.equal(acceptsDecision({ confidence }), true);
  }
  for (const confidence of ["certain", "", 0.9, null]) {
    assert.equal(acceptsDecision({ confidence }), false);
  }
  for (const invalidOption of ["nonexistent", "custom", "two_column", null]) {
    assert.equal(acceptsDecision({ choice: invalidOption }), false);
  }
  for (const invalidOption of ["nonexistent", "custom", "two_column", 42]) {
    assert.equal(acceptsDecision({ alternative: invalidOption }), false);
  }
  const foreignOption = DECISION_SPECS
    .flatMap(({ options }) => options.map(({ id }) => id))
    .find((id) => !spec.options.some((option) => option.id === id))!;
  assert.equal(acceptsDecision({ choice: foreignOption }), false);
  assert.equal(acceptsDecision({ alternative: foreignOption }), false);

  assert.equal(acceptsDecision({ alternative: null }), true);
  assert.equal(acceptsDecision({ ambiguityReason: null }), true);
  for (const field of ["reason", "ambiguityReason"]) {
    assert.equal(acceptsDecision({ [field]: "Evidence-grounded explanation." }), true);
    assert.equal(acceptsDecision({ [field]: "x".repeat(500) }), true);
    assert.equal(acceptsDecision({ [field]: "" }), false);
    assert.equal(acceptsDecision({ [field]: "x".repeat(501) }), false);
    assert.equal(acceptsDecision({ [field]: 42 }), false);
  }
  assert.equal(acceptsDecision({ reason: null }), false);
  assert.equal(acceptsDecision({ evidencePages: [] }), true);
  assert.equal(acceptsDecision({ evidencePages: [1, 4, 99] }), true);
  for (const invalidPages of [[0], [-1], [1.5], ["4"], null, 4]) {
    assert.equal(acceptsDecision({ evidencePages: invalidPages }), false);
  }

  for (const field of Object.keys(validOutputV2.recommendation[spec.id]!)) {
    const output = structuredClone(validOutputV2);
    Reflect.deleteProperty(output.recommendation[spec.id]!, field);
    assert.equal(OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse(output).success, false);
  }
  assert.equal(acceptsDecision({ extra: "unexpected" }), false);

  const missingDecision = structuredClone(validOutputV2);
  delete missingDecision.recommendation[spec.id];
  assert.equal(OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse(missingDecision).success, false);
}

assert.equal(OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse(validRecommendation).success, false);
assert.equal(OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse({
  recommendations: validOutputV2.recommendation,
}).success, false);
assert.equal(OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse({
  ...validOutputV2,
  extra: "unexpected",
}).success, false);
assert.equal(OPENAI_RECOMMENDATION_SCHEMA_V2.safeParse({
  recommendation: { ...validOutputV2.recommendation, extra: {} },
}).success, false);

// Both contracts remain independently available; V1 keeps its original flat shape.
assert.equal(OPENAI_RECOMMENDATION_SCHEMA.safeParse(validOutputV2).success, false);
assert.deepEqual(
  validateOpenAIRecommendations(validRecommendation, new Set([4, 5])),
  validRecommendation,
);

const ravenPdfPath = "src/pdfs/storybook-hyena-and-raven.pdf";
let localPdfFixtureAvailable = true;
try {
  await access(ravenPdfPath);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
    throw error;
  }
  localPdfFixtureAvailable = false;
}

if (localPdfFixtureAvailable) {
  const sampledTexts = await extractSampledPageTexts(ravenPdfPath, [[2, 3]]);
  assert.equal(sampledTexts.length, 1);
  assert.deepEqual(sampledTexts[0]!.map((page) => page?.pageNumber), [2, 3]);
  assert.ok(sampledTexts[0]!.every((page) => page!.text.length <= 300));

  const temporaryDirectory = await mkdtemp(
    path.join(tmpdir(), "adt-openai-evidence-test-"),
  );
  try {
    const rendered = await renderSampledPagePairs(
      ravenPdfPath,
      sampledTexts,
      temporaryDirectory,
    );
    assert.equal(rendered.length, 1);
    assert.ok(rendered[0]!.imageBuffer.length > 0);
    assert.equal(path.basename(rendered[0]!.imagePath), "pages-002-003.png");
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
} else {
  console.log("Optional local PDF integration test skipped (fixture not present).");
}

console.log("OpenAI recommendation self-test passed.");
