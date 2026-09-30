export interface DecisionOption<TId extends string = string> {
  id: TId;
  description: string;
}

export interface ChoiceDecisionSpec<TId extends string = string> {
  id: string;
  instructions: string;
  options: readonly DecisionOption<TId>[];
}

export type PresetDecision = "textbook" | "storybook" | "reference";

export type RenderStrategyDecision =
  | "llm"
  | "llm-overlay"
  | "single_column"
  | "two_column_story"
  | "fixed_layout";

export type PageGroupingDecision = "single" | "spread";

export type SectioningModeDecision = "page" | "dynamic";

export type ActivitiesDecision = "enabled" | "disabled";

export type FigureExtractionDecision = "off" | "auto" | "all";

export type DecisionId =
  | "preset"
  | "renderStrategy"
  | "pageGrouping"
  | "sectioningMode"
  | "activitiesGenerator"
  | "figureExtraction";
