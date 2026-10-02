import { DECISION_SPECS, POC_V1_DECISION_SPECS } from "../decision/specs.js";
import type { ChoiceDecisionSpec } from "../decision/types.js";
import { EXPERIMENTAL_RECOMMENDATION_VARIANTS } from "../experiments/recommendation-variants.js";
import { OPENAI_PROMPT_VERSION, OPENAI_PROMPT_VERSION_V2, POC_V1_PROMPT_VERSION } from "./openai-prompt.js";

export type RecommendationVariantConfig = {
  id: string;
  promptVersion: string;
  decisionSpecs: readonly ChoiceDecisionSpec[];
  recommendationFileSuffix: string;
  evidenceDirectorySuffix: string;
} & (
  | { behavior: "v1"; requiresUserLanguage: false }
  | { behavior: "v2"; requiresUserLanguage: true }
);

export type V2RecommendationVariantConfig = RecommendationVariantConfig & {
  behavior: "v2";
  requiresUserLanguage: true;
};

export const CORE_RECOMMENDATION_VARIANTS = {
  v1: {
    id: "v1",
    promptVersion: OPENAI_PROMPT_VERSION,
    decisionSpecs: DECISION_SPECS,
    behavior: "v1",
    requiresUserLanguage: false,
    recommendationFileSuffix: "",
    evidenceDirectorySuffix: "",
  },
  v2: {
    id: "v2",
    promptVersion: OPENAI_PROMPT_VERSION_V2,
    decisionSpecs: DECISION_SPECS,
    behavior: "v2",
    requiresUserLanguage: true,
    recommendationFileSuffix: ".v2",
    evidenceDirectorySuffix: "v2",
  },
  "poc-v1": {
    id: "poc-v1",
    promptVersion: POC_V1_PROMPT_VERSION,
    decisionSpecs: POC_V1_DECISION_SPECS,
    behavior: "v2",
    requiresUserLanguage: true,
    recommendationFileSuffix: ".poc-v1",
    evidenceDirectorySuffix: "poc-v1",
  },
} as const satisfies Record<string, RecommendationVariantConfig>;

export const RECOMMENDATION_VARIANTS = {
  ...CORE_RECOMMENDATION_VARIANTS,
  ...EXPERIMENTAL_RECOMMENDATION_VARIANTS,
} as const satisfies Record<string, RecommendationVariantConfig>;

export type RecommendationVariant = keyof typeof RECOMMENDATION_VARIANTS;

export const RECOMMENDATION_VARIANT_IDS = Object.keys(RECOMMENDATION_VARIANTS) as RecommendationVariant[];

export function resolveRecommendationVariant(value: string): (typeof RECOMMENDATION_VARIANTS)[RecommendationVariant] | undefined {
  return Object.hasOwn(RECOMMENDATION_VARIANTS, value)
    ? RECOMMENDATION_VARIANTS[value as RecommendationVariant]
    : undefined;
}
