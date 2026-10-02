import type { ChoiceDecisionSpec, PresetDecision, RenderStrategyDecision } from "../decision/types.js";
import {
  ACTIVITIES_SPEC,
  FIGURE_EXTRACTION_SPEC,
  PAGE_GROUPING_SPEC,
  POC_V1_DECISION_SPECS,
  POC_V1_RENDER_STRATEGY_SPEC,
  PRESET_SPEC,
  SECTIONING_MODE_SPEC,
} from "../decision/specs.js";

export const CARD3_RENDER_STRATEGY_SPEC = POC_V1_RENDER_STRATEGY_SPEC;
export const CARD3_DECISION_SPECS = POC_V1_DECISION_SPECS;

export const CARD3_PRESET_SPEC = {
  id: "preset",
  instructions: "Which ADT preset best matches the book's primary purpose and content type?",
  options: [
    {
      id: "textbook",
      description:
        "Instructional or educational material whose primary purpose is to teach, practice, or assess knowledge or skills. Typical examples include school textbooks, workbooks, course modules, and structured curricular materials. Do not choose solely because a book is used in an educational context, has educational front matter, structured chapters, or a complex layout.",
    },
    {
      id: "storybook",
      description:
        "Literary or narrative content whose primary purpose is to tell or present a story. This includes picture books, children's literature, novels, chapter books, comics, and other narrative works. Illustrations, large images, or little text are not required, and educational use does not by itself make a narrative work a textbook.",
    },
    {
      id: "reference",
      description:
        "Scientific, technical, or specialized informational material primarily intended for consultation, documentation, or communicating factual or research content. Typical examples include scientific papers, technical references, specialized manuals, and documentation. Do not choose only because a book is text-heavy, structured, or contains tables and glossaries.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<PresetDecision>;

export const CARD3_PRESET_DECISION_SPECS = [
  CARD3_PRESET_SPEC,
  CARD3_RENDER_STRATEGY_SPEC,
  PAGE_GROUPING_SPEC,
  SECTIONING_MODE_SPEC,
  ACTIVITIES_SPEC,
  FIGURE_EXTRACTION_SPEC,
] as const;

export const CARD3_PRESET_SPEC_V2 = {
  id: "preset",
  instructions: "Which ADT preset best matches the book as a whole? Prioritize explicit evidence about the work's genre and primary purpose over surface characteristics of the sampled pages. If sampled pages are front matter, use what they say about the work itself rather than classifying the front matter as the whole book. If the overall purpose remains genuinely unclear, reflect that uncertainty through confidence or an alternative instead of inferring from layout, image size, text density, or writing tone alone.",
  options: [
    {
      id: "textbook",
      description: "Instructional material whose primary purpose is to teach, practice, or assess knowledge or skills. Strong evidence includes lessons, learning objectives, guided instruction, exercises, activities, or curricular progression. Factual content, illustrations, structured chapters, or educational use alone do not make a book a textbook.",
    },
    {
      id: "storybook",
      description: "Literary or narrative work whose primary content is a story, such as a novel, children's story, chapter book, comic, or other work centered on plot, characters, or narrative events. Do not choose solely because the writing has a storytelling tone, the chapters are short, the pages are illustrated, or factual events are presented narratively.",
    },
    {
      id: "reference",
      description: "Scientific, technical, or specialized informational material whose primary purpose is to communicate, document, organize, or support consultation of factual, research, or technical knowledge. Expository or factual writing alone is not enough when the work is primarily instructional or literary.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<PresetDecision>;

export const CARD3_PRESET_V2_DECISION_SPECS = [
  CARD3_PRESET_SPEC_V2,
  CARD3_RENDER_STRATEGY_SPEC,
  PAGE_GROUPING_SPEC,
  SECTIONING_MODE_SPEC,
  ACTIVITIES_SPEC,
  FIGURE_EXTRACTION_SPEC,
] as const;

export const CARD3_V2_RENDER_STRATEGY_SPEC = {
  ...CARD3_RENDER_STRATEGY_SPEC,
  options: [
    CARD3_RENDER_STRATEGY_SPEC.options[0],
    {
      id: "llm-overlay",
      description:
        "AI-generated layout that visually reconstructs the source page by using the original page image as a background and inferring positions for accessible text overlays. Prefer when important visual relationships should remain close to the source while responsive adaptation and AI-based reconstruction are still desired; do not choose solely because the original page is multi-column, technical, or visually complex.",
    },
    {
      id: "single_column",
      description:
        "Deterministic reflowable single-column layout for content that can be safely linearized into a sequential reading flow. Prefer when meaning does not depend on preserving page-specific spatial relationships, even if the original PDF uses multiple visual columns; do not choose only because a book is text-heavy.",
    },
    {
      id: "two_column_story",
      description:
        "Deterministic responsive story template that reorganizes content into a prominent image region and a separate text region. Prefer when image and text are distinct, separable content blocks that can be rearranged without losing important spatial meaning; avoid when text is embedded in, overlaid on, or dependent on the full-page illustration or composition.",
    },
    CARD3_RENDER_STRATEGY_SPEC.options[4],
  ],
} as const satisfies ChoiceDecisionSpec<RenderStrategyDecision>;

export const CARD3_V2_DECISION_SPECS = [
  PRESET_SPEC,
  CARD3_V2_RENDER_STRATEGY_SPEC,
  PAGE_GROUPING_SPEC,
  SECTIONING_MODE_SPEC,
  ACTIVITIES_SPEC,
  FIGURE_EXTRACTION_SPEC,
] as const;
