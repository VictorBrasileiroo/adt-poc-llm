import path from "node:path";

import {
  recommendBookWithOpenAI,
  recommendBookWithOpenAIV2Variant,
  type recommendBookWithOpenAIV2,
} from "./openai-recommender.js";
import {
  RECOMMENDATION_VARIANTS,
  RECOMMENDATION_VARIANT_IDS,
  resolveRecommendationVariant,
  type RecommendationVariant,
} from "./variant-config.js";

export type { RecommendationVariant } from "./variant-config.js";

export type OpenAIRecommendationOptions =
  | { filePath: string; variant: "v1"; userLanguage?: never }
  | { filePath: string; variant: Exclude<RecommendationVariant, "v1">; userLanguage: string };

function formatVariantList(variants: readonly string[]): string {
  return `${variants.slice(0, -1).join(", ")}, or ${variants.at(-1)}`;
}

export function parseOpenAIRecommendationArgs(
  args: readonly string[],
): OpenAIRecommendationOptions {
  const [filePath, ...flags] = args;
  if (filePath === undefined || filePath.startsWith("--")) {
    throw new Error("A PDF path is required");
  }

  let variant: RecommendationVariant = "poc-v1";
  let userLanguage: string | undefined;
  let variantProvided = false;
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index];
    const value = flags[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`A value is required for ${flag}`);
    }
    if (flag === "--variant" && !variantProvided) {
      const config = resolveRecommendationVariant(value);
      if (config === undefined) {
        throw new Error(`--variant must be ${formatVariantList(RECOMMENDATION_VARIANT_IDS)}`);
      }
      variant = config.id;
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

  if (RECOMMENDATION_VARIANTS[variant].requiresUserLanguage && userLanguage === undefined) {
    throw new Error(`--user-language is required for ${variant}; provide --user-language (for example, pt-BR)`);
  }
  if (!RECOMMENDATION_VARIANTS[variant].requiresUserLanguage && userLanguage !== undefined) {
    throw new Error(`--user-language is only supported with --variant ${formatVariantList(RECOMMENDATION_VARIANT_IDS.filter((id) => RECOMMENDATION_VARIANTS[id].requiresUserLanguage))}`);
  }
  return variant !== "v1"
    ? { filePath, variant, userLanguage: userLanguage! }
    : { filePath, variant };
}

export function selectOpenAIRecommender(variant: "v1"): typeof recommendBookWithOpenAI;
export function selectOpenAIRecommender(variant: Exclude<RecommendationVariant, "v1">): typeof recommendBookWithOpenAIV2;
export function selectOpenAIRecommender(variant: RecommendationVariant) {
  const config = RECOMMENDATION_VARIANTS[variant];
  if (config.behavior === "v1") return recommendBookWithOpenAI;
  const recommender: typeof recommendBookWithOpenAIV2 = (...args) =>
    recommendBookWithOpenAIV2Variant(args[0], args[1], args[2], args[3], args[4], config, args[5]);
  return recommender;
}

export function openAIRecommendationFileName(
  bookName: string,
  variant: RecommendationVariant,
): string {
  return `${bookName}.openai-recommendation${RECOMMENDATION_VARIANTS[variant].recommendationFileSuffix}.json`;
}

export function openAIRecommendationEvidenceDirectory(
  outputDirectory: string,
  bookName: string,
  variant: RecommendationVariant,
): string {
  const suffix = RECOMMENDATION_VARIANTS[variant].evidenceDirectorySuffix;
  return path.join(outputDirectory, "evidence", bookName, ...(suffix === "" ? [] : [suffix]));
}
