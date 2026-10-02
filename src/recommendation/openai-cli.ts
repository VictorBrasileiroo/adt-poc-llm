import path from "node:path";

import {
  recommendBookWithOpenAI,
  recommendBookWithOpenAIV2,
  recommendBookWithOpenAIV2RenderSpecs,
  recommendBookWithOpenAIV2RenderSpecsV2,
  recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV1,
  recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV2,
} from "./openai-recommender.js";

export type RecommendationVariant = "v1" | "v2" | "v2-render-specs" | "v2-render-specs-v2" | "v2-render-specs-v1-preset-specs-v1" | "v2-render-specs-v1-preset-specs-v2";

export type OpenAIRecommendationOptions =
  | { filePath: string; variant: "v1"; userLanguage?: never }
  | { filePath: string; variant: Exclude<RecommendationVariant, "v1">; userLanguage: string };

export function parseOpenAIRecommendationArgs(
  args: readonly string[],
): OpenAIRecommendationOptions {
  const [filePath, ...flags] = args;
  if (filePath === undefined || filePath.startsWith("--")) {
    throw new Error("A PDF path is required");
  }

  let variant: RecommendationVariant = "v1";
  let userLanguage: string | undefined;
  let variantProvided = false;
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index];
    const value = flags[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`A value is required for ${flag}`);
    }
    if (flag === "--variant" && !variantProvided) {
      if (value !== "v1" && value !== "v2" && value !== "v2-render-specs" && value !== "v2-render-specs-v2" && value !== "v2-render-specs-v1-preset-specs-v1" && value !== "v2-render-specs-v1-preset-specs-v2") {
        throw new Error("--variant must be v1, v2, v2-render-specs, v2-render-specs-v2, v2-render-specs-v1-preset-specs-v1, or v2-render-specs-v1-preset-specs-v2");
      }
      variant = value;
      variantProvided = true;
    } else if (flag === "--user-language" && userLanguage === undefined) {
      userLanguage = value.trim();
      if (userLanguage.length === 0) {
        throw new Error("--user-language requires a non-empty value");
      }
    } else {
      throw new Error(`Unknown or repeated option: ${flag}`);
    }
  }

  if (variant !== "v1" && userLanguage === undefined) {
    throw new Error(`--user-language is required with --variant ${variant}`);
  }
  if (variant === "v1" && userLanguage !== undefined) {
    throw new Error("--user-language is only supported with --variant v2, v2-render-specs, v2-render-specs-v2, v2-render-specs-v1-preset-specs-v1, or v2-render-specs-v1-preset-specs-v2");
  }
  return variant !== "v1"
    ? { filePath, variant, userLanguage: userLanguage! }
    : { filePath, variant };
}

export function selectOpenAIRecommender(variant: "v1"): typeof recommendBookWithOpenAI;
export function selectOpenAIRecommender(variant: "v2"): typeof recommendBookWithOpenAIV2;
export function selectOpenAIRecommender(variant: "v2-render-specs"): typeof recommendBookWithOpenAIV2RenderSpecs;
export function selectOpenAIRecommender(variant: "v2-render-specs-v2"): typeof recommendBookWithOpenAIV2RenderSpecsV2;
export function selectOpenAIRecommender(variant: "v2-render-specs-v1-preset-specs-v1"): typeof recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV1;
export function selectOpenAIRecommender(variant: "v2-render-specs-v1-preset-specs-v2"): typeof recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV2;
export function selectOpenAIRecommender(variant: Exclude<RecommendationVariant, "v1">): typeof recommendBookWithOpenAIV2;
export function selectOpenAIRecommender(variant: RecommendationVariant) {
  if (variant === "v2") return recommendBookWithOpenAIV2;
  if (variant === "v2-render-specs") return recommendBookWithOpenAIV2RenderSpecs;
  if (variant === "v2-render-specs-v2") return recommendBookWithOpenAIV2RenderSpecsV2;
  if (variant === "v2-render-specs-v1-preset-specs-v1") return recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV1;
  if (variant === "v2-render-specs-v1-preset-specs-v2") return recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV2;
  return recommendBookWithOpenAI;
}

export function openAIRecommendationFileName(
  bookName: string,
  variant: RecommendationVariant,
): string {
  return `${bookName}.openai-recommendation${variant === "v1" ? "" : `.${variant}`}.json`;
}

export function openAIRecommendationEvidenceDirectory(
  outputDirectory: string,
  bookName: string,
  variant: RecommendationVariant,
): string {
  return path.join(outputDirectory, "evidence", bookName, ...(variant === "v1" ? [] : [variant]));
}
