import {
  recommendBookWithOpenAI,
  recommendBookWithOpenAIV2,
} from "./openai-recommender.js";

export type RecommendationVariant = "v1" | "v2";

export type OpenAIRecommendationOptions =
  | { filePath: string; variant: "v1"; userLanguage?: never }
  | { filePath: string; variant: "v2"; userLanguage: string };

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
      if (value !== "v1" && value !== "v2") {
        throw new Error("--variant must be v1 or v2");
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

  if (variant === "v2" && userLanguage === undefined) {
    throw new Error("--user-language is required with --variant v2");
  }
  if (variant === "v1" && userLanguage !== undefined) {
    throw new Error("--user-language is only supported with --variant v2");
  }
  return variant === "v2"
    ? { filePath, variant, userLanguage: userLanguage! }
    : { filePath, variant };
}

export function selectOpenAIRecommender(variant: "v1"): typeof recommendBookWithOpenAI;
export function selectOpenAIRecommender(variant: "v2"): typeof recommendBookWithOpenAIV2;
export function selectOpenAIRecommender(variant: RecommendationVariant) {
  return variant === "v2" ? recommendBookWithOpenAIV2 : recommendBookWithOpenAI;
}

export function openAIRecommendationFileName(
  bookName: string,
  variant: RecommendationVariant,
): string {
  return `${bookName}.openai-recommendation${variant === "v2" ? ".v2" : ""}.json`;
}
