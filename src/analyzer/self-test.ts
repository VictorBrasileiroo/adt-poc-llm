import assert from "node:assert/strict";

import {
  aggregateBookProfile,
  detectActivitySignals,
  detectLikelyMultiColumn,
  median,
} from "./metrics.js";
import type { PageObservation, PositionedTextItem } from "./types.js";

assert.equal(median([9, 1, 5]), 5);
assert.equal(median([10, 2, 4, 8]), 6);
assert.equal(median([]), 0);

const page = (
  overrides: Partial<PageObservation> = {},
): PageObservation => ({
  pageNumber: 1,
  width: 600,
  height: 800,
  charCount: 100,
  textItemCount: 5,
  imageOperationCount: 0,
  isLandscape: false,
  isLikelyMultiColumn: false,
  hasActivitySignals: false,
  ...overrides,
});

const profile = aggregateBookProfile([
  page(),
  page({
    pageNumber: 2,
    charCount: 1_300,
    imageOperationCount: 3,
    isLandscape: true,
    isLikelyMultiColumn: true,
    hasActivitySignals: true,
  }),
]);

assert.equal(profile.pageCount, 2);
assert.equal(profile.text.totalChars, 1_400);
assert.equal(profile.text.avgCharsPerPage, 700);
assert.equal(profile.text.medianCharsPerPage, 700);
assert.equal(profile.text.lowTextPageRatio, 0.5);
assert.equal(profile.text.highTextPageRatio, 0.5);
assert.equal(profile.images.totalImageOperations, 3);
assert.equal(profile.images.pagesWithImagesRatio, 0.5);
assert.equal(profile.images.avgImagesPerPage, 1.5);
assert.equal(profile.layout.landscapePageRatio, 0.5);
assert.equal(profile.layout.multiColumnPageRatio, 0.5);
assert.equal(profile.activities.activitySignalPageRatio, 0.5);

const ratios = [
  profile.text.lowTextPageRatio,
  profile.text.highTextPageRatio,
  profile.images.pagesWithImagesRatio,
  profile.layout.landscapePageRatio,
  profile.layout.multiColumnPageRatio,
  profile.activities.activitySignalPageRatio,
];
for (const value of ratios) {
  assert.ok(value >= 0 && value <= 1);
}

const emptyProfile = aggregateBookProfile([]);
assert.equal(emptyProfile.pageCount, 0);
assert.ok(!JSON.stringify(emptyProfile).includes("null"));

assert.equal(detectActivitySignals("Once upon a time, the fox went home."), false);
assert.equal(detectActivitySignals("A) First choice\nB) Second choice"), true);
assert.equal(detectActivitySignals("1. Why?\n2. Where?"), true);

const positionedItems = (xs: readonly number[]): PositionedTextItem[] =>
  xs.map((x) => ({ text: "x".repeat(50), x }));

assert.equal(
  detectLikelyMultiColumn(positionedItems([50, 60, 70, 80, 90, 100, 110, 120]), 400, 600),
  false,
);
assert.equal(
  detectLikelyMultiColumn(positionedItems([50, 60, 70, 80, 400, 410, 420, 430]), 400, 600),
  true,
);
assert.equal(
  detectLikelyMultiColumn(positionedItems([50, 60, 400, 410, 420, 430, 440, 450]), 200, 600),
  false,
);

console.log("Analyzer self-test passed.");
