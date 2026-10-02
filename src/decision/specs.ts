import type {
  ActivitiesDecision,
  ChoiceDecisionSpec,
  FigureExtractionDecision,
  PageGroupingDecision,
  PresetDecision,
  RenderStrategyDecision,
  SectioningModeDecision,
} from "./types.js";

export const PRESET_SPEC = {
  id: "preset",
  instructions: "Which ADT preset best matches this book?",
  options: [
    {
      id: "textbook",
      description:
        "Educational content with structured chapters, exercises, activities, or complex layouts.",
    },
    {
      id: "storybook",
      description:
        "Illustrated narrative content with large images, visual storytelling, and relatively little text.",
    },
    {
      id: "reference",
      description:
        "Dense informational or technical content such as documentation, manuals, handbooks, tables, or glossaries.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<PresetDecision>;

export const RENDER_STRATEGY_SPEC = {
  id: "renderStrategy",
  instructions: "Which ADT rendering strategy best fits this book?",
  options: [
    {
      id: "llm",
      description:
        "Adaptive AI-generated layout that can reorganize each page according to its content.",
    },
    {
      id: "llm-overlay",
      description:
        "AI-generated layout that keeps the original page as a visual background with text overlaid.",
    },
    {
      id: "single_column",
      description:
        "Reflowable full-width layout suited to dense reference, documentation, and technical content.",
    },
    {
      id: "two_column_story",
      description:
        "Template for illustrated stories with large images and relatively little text.",
    },
    {
      id: "fixed_layout",
      description:
        "Preserves the original page composition using the page image as background with positioned text.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<RenderStrategyDecision>;

export const PAGE_GROUPING_SPEC = {
  id: "pageGrouping",
  instructions: "How should the pages of this book be grouped?",
  options: [
    {
      id: "single",
      description:
        "Treat each PDF page as an independent screen; also preferred when only a few exceptional spreads exist.",
    },
    {
      id: "spread",
      description:
        "Join facing pages into wide screens when compositions frequently span both pages or cross the gutter.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<PageGroupingDecision>;

export const SECTIONING_MODE_SPEC = {
  id: "sectioningMode",
  instructions: "How should content be divided into sections?",
  options: [
    {
      id: "page",
      description:
        "Keep each page as one section when its content works as a self-contained unit.",
    },
    {
      id: "dynamic",
      description:
        "Keep pages whole normally but split pages containing multiple distinct activity types.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<SectioningModeDecision>;

export const ACTIVITIES_SPEC = {
  id: "activitiesGenerator",
  instructions: "Should ADT activity conversion be enabled for this book?",
  options: [
    {
      id: "enabled",
      description:
        "Use when existing exercises or activities should be detected and converted into interactive HTML elements.",
    },
    {
      id: "disabled",
      description:
        "Use when the book mainly contains reading content without activities that need interactive conversion.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<ActivitiesDecision>;

export const FIGURE_EXTRACTION_SPEC = {
  id: "figureExtraction",
  instructions: "How should ADT handle composite figure extraction?",
  options: [
    {
      id: "off",
      description:
        "Keep raster and vector artwork separate from nearby selectable text instead of creating composite figure crops.",
    },
    {
      id: "auto",
      description:
        "Create composite candidates and retain those better represented visually than as semantic HTML.",
    },
    {
      id: "all",
      description:
        "Create every composite figure candidate and let the normal image filters decide what remains.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<FigureExtractionDecision>;

export const DECISION_SPECS = [
  PRESET_SPEC,
  RENDER_STRATEGY_SPEC,
  PAGE_GROUPING_SPEC,
  SECTIONING_MODE_SPEC,
  ACTIVITIES_SPEC,
  FIGURE_EXTRACTION_SPEC,
] as const;

export const CARD3_RENDER_STRATEGY_SPEC = {
  id: "renderStrategy",
  instructions: "Which ADT rendering strategy best fits this book?",
  options: [
    {
      id: "llm",
      description:
        "AI-generated reflowable layout that uses the source page as a visual reference but may reorganize content for clear, responsive HTML. Prefer when semantic structure and adaptability matter more than preserving exact page geometry.",
    },
    {
      id: "llm-overlay",
      description:
        "AI-generated layout that visually reconstructs the source page by using the original page image as a background and inferring positions for accessible text overlays. Prefer when strong visual fidelity matters but responsive adaptation and AI-based reconstruction are still desired.",
    },
    {
      id: "single_column",
      description:
        "Deterministic reflowable single-column layout for predominantly linear content. Prefer when text can be read sequentially and meaning does not depend on page-specific spatial relationships; do not choose only because a book is text-heavy.",
    },
    {
      id: "two_column_story",
      description:
        "Deterministic responsive story template that reorganizes content into a prominent image area and a text area. Prefer when pages consistently fit an image-plus-text structure; avoid when meaning depends on arbitrary or complex original positioning.",
    },
    {
      id: "fixed_layout",
      description:
        "Preserves the source PDF page as a largely static, non-reflowable composition using its original page geometry and positioned text rather than asking AI to reconstruct the layout. Prefer when exact spatial placement is essential to meaning or experience; do not choose merely because pages are illustrated or visually complex.",
    },
  ],
} as const satisfies ChoiceDecisionSpec<RenderStrategyDecision>;

export const CARD3_DECISION_SPECS = [
  PRESET_SPEC,
  CARD3_RENDER_STRATEGY_SPEC,
  PAGE_GROUPING_SPEC,
  SECTIONING_MODE_SPEC,
  ACTIVITIES_SPEC,
  FIGURE_EXTRACTION_SPEC,
] as const;

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
