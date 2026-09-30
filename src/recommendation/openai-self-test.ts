import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { zodTextFormat } from "openai/helpers/zod";

import { DECISION_SPECS } from "../decision/specs.js";
import type { BookProfile } from "../analyzer/types.js";
import {
  buildBookProfileContext,
  buildMultimodalRecommendationInput,
  buildOpenAIDecisionContext,
  OPENAI_RECOMMENDATION_INSTRUCTIONS,
} from "./openai-prompt.js";
import {
  OPENAI_RECOMMENDATION_SCHEMA,
  validateOpenAIRecommendations,
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
