import type { V2RecommendationVariantConfig } from "../recommendation/variant-config.js";
import {
  CARD3_DECISION_SPECS,
  CARD3_PRESET_DECISION_SPECS,
  CARD3_PRESET_V2_DECISION_SPECS,
  CARD3_V2_DECISION_SPECS,
} from "./decision-specs.js";

export const OPENAI_PROMPT_VERSION_V2_RENDER_SPECS = "adt-multimodal-v2-render-specs-v1";
export const OPENAI_PROMPT_VERSION_V2_RENDER_SPECS_V2 = "adt-multimodal-v2-render-specs-v2";
export const OPENAI_PROMPT_VERSION_V2_RENDER_SPECS_V1_PRESET_SPECS_V1 = "adt-multimodal-v2-render-specs-v1-preset-specs-v1";
export const OPENAI_PROMPT_VERSION_V2_RENDER_SPECS_V1_PRESET_SPECS_V2 = "adt-multimodal-v2-render-specs-v1-preset-specs-v2";

export const EXPERIMENTAL_RECOMMENDATION_VARIANTS = {
  "v2-render-specs": {
    id: "v2-render-specs",
    promptVersion: OPENAI_PROMPT_VERSION_V2_RENDER_SPECS,
    decisionSpecs: CARD3_DECISION_SPECS,
    behavior: "v2",
    requiresUserLanguage: true,
    recommendationFileSuffix: ".v2-render-specs",
    evidenceDirectorySuffix: "v2-render-specs",
  },
  "v2-render-specs-v2": {
    id: "v2-render-specs-v2",
    promptVersion: OPENAI_PROMPT_VERSION_V2_RENDER_SPECS_V2,
    decisionSpecs: CARD3_V2_DECISION_SPECS,
    behavior: "v2",
    requiresUserLanguage: true,
    recommendationFileSuffix: ".v2-render-specs-v2",
    evidenceDirectorySuffix: "v2-render-specs-v2",
  },
  "v2-render-specs-v1-preset-specs-v1": {
    id: "v2-render-specs-v1-preset-specs-v1",
    promptVersion: OPENAI_PROMPT_VERSION_V2_RENDER_SPECS_V1_PRESET_SPECS_V1,
    decisionSpecs: CARD3_PRESET_DECISION_SPECS,
    behavior: "v2",
    requiresUserLanguage: true,
    recommendationFileSuffix: ".v2-render-specs-v1-preset-specs-v1",
    evidenceDirectorySuffix: "v2-render-specs-v1-preset-specs-v1",
  },
  "v2-render-specs-v1-preset-specs-v2": {
    id: "v2-render-specs-v1-preset-specs-v2",
    promptVersion: OPENAI_PROMPT_VERSION_V2_RENDER_SPECS_V1_PRESET_SPECS_V2,
    decisionSpecs: CARD3_PRESET_V2_DECISION_SPECS,
    behavior: "v2",
    requiresUserLanguage: true,
    recommendationFileSuffix: ".v2-render-specs-v1-preset-specs-v2",
    evidenceDirectorySuffix: "v2-render-specs-v1-preset-specs-v2",
  },
} as const satisfies Record<string, V2RecommendationVariantConfig>;
