import { z } from "zod";

import { DECISION_SPECS } from "../decision/specs.js";
import type { DecisionId } from "../decision/types.js";

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
