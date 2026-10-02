import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import type { BookProfile } from "../analyzer/types.js";
import { EXPERIMENTAL_RECOMMENDATION_VARIANTS } from "../experiments/recommendation-variants.js";
import {
  buildOpenAIRecommendationInstructionsV2,
  buildMultimodalRecommendationInput,
  OPENAI_PROMPT_VERSION,
  OPENAI_RECOMMENDATION_INSTRUCTIONS,
} from "./openai-prompt.js";
import { CORE_RECOMMENDATION_VARIANTS, type V2RecommendationVariantConfig } from "./variant-config.js";
import {
  createOpenAIRecommendationSchemaV2,
  OPENAI_RECOMMENDATION_SCHEMA,
  validateOpenAIRecommendationOutputV2,
  validateOpenAIRecommendations,
  type OpenAIBookConfigurationRecommendationV2,
  type OpenAIRecommendations,
} from "./openai-schema.js";
import type { SampledPagePair } from "./representative-pages.js";

export interface OpenAIRecommendationResult {
  provider: "openai";
  model: string;
  promptVersion: string;
  recommendations: OpenAIRecommendations;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  inferenceMs: number;
}

export async function recommendBookWithOpenAI(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
): Promise<OpenAIRecommendationResult> {
  // Retries are explicitly disabled: this experiment permits one real request.
  const client = new OpenAI({ apiKey, maxRetries: 0 });
  const input = buildMultimodalRecommendationInput(profile, pairs);
  const startedAt = performance.now();
  const response = await client.responses.parse({
    model,
    store: false,
    instructions: OPENAI_RECOMMENDATION_INSTRUCTIONS,
    input,
    text: {
      format: zodTextFormat(
        OPENAI_RECOMMENDATION_SCHEMA,
        "adt_configuration_recommendation",
      ),
    },
  });
  const inferenceMs = performance.now() - startedAt;

  if (response.output_parsed === null) {
    throw new Error(
      `OpenAI returned no parsed structured output (response status: ${response.status})`,
    );
  }

  const sampledPageNumbers = new Set(
    pairs.flatMap(({ pages }) =>
      pages
        .filter((page) => page !== undefined)
        .map(({ pageNumber }) => pageNumber),
    ),
  );
  const recommendations = validateOpenAIRecommendations(
    response.output_parsed,
    sampledPageNumbers,
  );

  return {
    provider: "openai",
    model,
    promptVersion: OPENAI_PROMPT_VERSION,
    recommendations,
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      totalTokens: response.usage?.total_tokens,
    },
    inferenceMs,
  };
}

export interface OpenAIRecommendationResultV2 {
  provider: "openai";
  model: string;
  promptVersion: string;
  recommendation: OpenAIBookConfigurationRecommendationV2;
  usage: OpenAIRecommendationResult["usage"];
  inferenceMs: number;
}

export async function recommendBookWithOpenAIV2(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  return recommendBookWithOpenAIV2Variant(apiKey, model, profile, pairs, userLanguage, CORE_RECOMMENDATION_VARIANTS.v2, client);
}

export async function recommendBookWithOpenAIV2RenderSpecs(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  return recommendBookWithOpenAIV2Variant(apiKey, model, profile, pairs, userLanguage, EXPERIMENTAL_RECOMMENDATION_VARIANTS["v2-render-specs"], client);
}

export async function recommendBookWithOpenAIPoCV1(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  return recommendBookWithOpenAIV2Variant(apiKey, model, profile, pairs, userLanguage, CORE_RECOMMENDATION_VARIANTS["poc-v1"], client);
}

export async function recommendBookWithOpenAIV2RenderSpecsV2(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  return recommendBookWithOpenAIV2Variant(apiKey, model, profile, pairs, userLanguage, EXPERIMENTAL_RECOMMENDATION_VARIANTS["v2-render-specs-v2"], client);
}

export async function recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV1(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  return recommendBookWithOpenAIV2Variant(apiKey, model, profile, pairs, userLanguage, EXPERIMENTAL_RECOMMENDATION_VARIANTS["v2-render-specs-v1-preset-specs-v1"], client);
}

export async function recommendBookWithOpenAIV2RenderSpecsV1PresetSpecsV2(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  return recommendBookWithOpenAIV2Variant(apiKey, model, profile, pairs, userLanguage, EXPERIMENTAL_RECOMMENDATION_VARIANTS["v2-render-specs-v1-preset-specs-v2"], client);
}

export async function recommendBookWithOpenAIV2Variant(
  apiKey: string,
  model: string,
  profile: BookProfile,
  pairs: readonly SampledPagePair[],
  userLanguage: string,
  variant: V2RecommendationVariantConfig,
  client: OpenAI = new OpenAI({ apiKey, maxRetries: 0 }),
): Promise<OpenAIRecommendationResultV2> {
  const instructions = buildOpenAIRecommendationInstructionsV2(userLanguage, variant.decisionSpecs);
  const input = buildMultimodalRecommendationInput(profile, pairs);
  const sampledPageNumbers = new Set(
    pairs.flatMap(({ pages }) =>
      pages
        .filter((page) => page !== undefined)
        .map(({ pageNumber }) => pageNumber),
    ),
  );
  const startedAt = performance.now();
  const response = await client.responses.parse({
    model,
    store: false,
    instructions,
    input,
    text: {
      format: zodTextFormat(
        createOpenAIRecommendationSchemaV2(sampledPageNumbers),
        "adt_configuration_recommendation_v2",
      ),
    },
  });
  const inferenceMs = performance.now() - startedAt;

  if (response.output_parsed === null) {
    throw new Error(
      `OpenAI returned no parsed structured output (response status: ${response.status})`,
    );
  }

  const { recommendation } = validateOpenAIRecommendationOutputV2(
    response.output_parsed,
    sampledPageNumbers,
  );

  return {
    provider: "openai",
    model,
    promptVersion: variant.promptVersion,
    recommendation,
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      totalTokens: response.usage?.total_tokens,
    },
    inferenceMs,
  };
}
