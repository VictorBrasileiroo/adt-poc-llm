import { z } from "zod";

import {
  ACTIVITIES_SPEC,
  DECISION_SPECS,
  FIGURE_EXTRACTION_SPEC,
  PAGE_GROUPING_SPEC,
  PRESET_SPEC,
  RENDER_STRATEGY_SPEC,
  SECTIONING_MODE_SPEC,
} from "../decision/specs.js";
import type { ChoiceDecisionSpec, DecisionId } from "../decision/types.js";

export const OPENAI_CONFIDENCE_VALUES = ["low", "medium", "high"] as const;

export type OpenAIConfidence = (typeof OPENAI_CONFIDENCE_VALUES)[number];

export interface OpenAIDecisionRecommendation {
  choice: string;
  confidence: OpenAIConfidence;
  reason: string;
  evidencePages: number[];
}

export type OpenAIRecommendations = Record<
  DecisionId,
  OpenAIDecisionRecommendation
>;

const recommendationShape = Object.fromEntries(
  DECISION_SPECS.map((spec) => {
    const optionIds = spec.options.map(({ id }) => id) as [
      string,
      ...string[],
    ];
    return [
      spec.id,
      z
        .object({
          choice: z.enum(optionIds),
          confidence: z.enum(OPENAI_CONFIDENCE_VALUES),
          reason: z.string().min(1).max(500),
          evidencePages: z.array(z.number().int().positive()),
        })
        .strict(),
    ];
  }),
);

/** Runtime schema generated from the authoritative Decision Specs. */
export const OPENAI_RECOMMENDATION_SCHEMA = z
  .object(recommendationShape)
  .strict();

export function validateOpenAIRecommendations(
  value: unknown,
  sampledPageNumbers: ReadonlySet<number>,
): OpenAIRecommendations {
  const parsed = OPENAI_RECOMMENDATION_SCHEMA.parse(value);
  const recommendations = {} as OpenAIRecommendations;

  for (const spec of DECISION_SPECS) {
    const decision = parsed[spec.id];
    if (decision === undefined) {
      throw new Error(`Structured output is missing decision ${spec.id}`);
    }

    for (let index = 0; index < decision.evidencePages.length; index += 1) {
      const pageNumber = decision.evidencePages[index]!;
      if (!sampledPageNumbers.has(pageNumber)) {
        throw new Error(
          `OpenAI response for ${spec.id} cites unsampled page ${pageNumber}`,
        );
      }
      if (index > 0 && decision.evidencePages[index - 1]! >= pageNumber) {
        throw new Error(
          `OpenAI response for ${spec.id} evidencePages must be unique and sorted`,
        );
      }
    }

    recommendations[spec.id] = {
      choice: decision.choice,
      confidence: decision.confidence,
      reason: decision.reason,
      evidencePages: [...decision.evidencePages],
    };
  }

  return recommendations;
}

/** V2 is structural only and is not used by the baseline V1 request. */
function createDecisionRecommendationSchemaV2<TChoice extends string>(
  spec: ChoiceDecisionSpec<TChoice>,
) {
  const optionIds = spec.options.map(({ id }) => id) as [
    TChoice,
    ...TChoice[],
  ];
  const choiceSchema = z.enum(optionIds);

  return z
    .object({
      choice: choiceSchema,
      confidence: z.enum(OPENAI_CONFIDENCE_VALUES),
      reason: z.string().min(1).max(500),
      alternative: choiceSchema.nullable(),
      ambiguityReason: z.string().min(1).max(500).nullable(),
      evidencePages: z.array(z.number().int().positive()),
    })
    .strict();
}

export const OPENAI_RECOMMENDATION_SCHEMA_V2 = z
  .object({
    recommendation: z
      .object({
        preset: createDecisionRecommendationSchemaV2(PRESET_SPEC),
        renderStrategy: createDecisionRecommendationSchemaV2(RENDER_STRATEGY_SPEC),
        pageGrouping: createDecisionRecommendationSchemaV2(PAGE_GROUPING_SPEC),
        sectioningMode: createDecisionRecommendationSchemaV2(SECTIONING_MODE_SPEC),
        activitiesGenerator: createDecisionRecommendationSchemaV2(ACTIVITIES_SPEC),
        figureExtraction: createDecisionRecommendationSchemaV2(FIGURE_EXTRACTION_SPEC),
      })
      .strict(),
  })
  .strict();

export type OpenAIDecisionRecommendationV2<TChoice extends string> = z.infer<
  ReturnType<typeof createDecisionRecommendationSchemaV2<TChoice>>
>;

export type OpenAIRecommendationOutputV2 = z.infer<
  typeof OPENAI_RECOMMENDATION_SCHEMA_V2
>;

export type OpenAIBookConfigurationRecommendationV2 =
  OpenAIRecommendationOutputV2["recommendation"];
