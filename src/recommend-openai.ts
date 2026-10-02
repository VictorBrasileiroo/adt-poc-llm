import "dotenv/config";

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { analyzePdf } from "./analyzer/pdf-analyzer.js";
import { DECISION_SPECS } from "./decision/specs.js";
import {
  openAIRecommendationFileName,
  openAIRecommendationEvidenceDirectory,
  parseOpenAIRecommendationArgs,
  selectOpenAIRecommender,
  type OpenAIRecommendationOptions,
} from "./recommendation/openai-cli.js";
import { renderSampledPagePairs } from "./recommendation/page-renderer.js";
import {
  extractSampledPageTexts,
  MAX_EXTRACTED_CHARS_PER_PAGE,
  selectRepresentativePagePairs,
} from "./recommendation/representative-pages.js";

const inputPath = process.argv[2];

if (inputPath === undefined) {
  console.error("Usage: npm run recommend:openai -- path/to/book.pdf --user-language pt-BR");
  process.exitCode = 1;
} else {
  try {
    await runOpenAIRecommendation(parseOpenAIRecommendationArgs(process.argv.slice(2)));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`OpenAI recommendation failed: ${message}`);
    process.exitCode = 1;
  }
}

async function runOpenAIRecommendation(options: OpenAIRecommendationOptions): Promise<void> {
  const totalStartedAt = performance.now();
  const resolvedPath = path.resolve(options.filePath);

  try {
    await validatePdfPath(resolvedPath);
    const apiKey = requireEnvironmentValue("OPENAI_API_KEY");
    const model = requireEnvironmentValue("OPENAI_MODEL");
    const bookName = path.basename(resolvedPath, path.extname(resolvedPath));
    const outputDirectory = path.resolve("output");
    const evidenceDirectory = openAIRecommendationEvidenceDirectory(outputDirectory, bookName, options.variant);

    console.log("[analyze] Building structural BookProfile...");
    const analyzerStartedAt = performance.now();
    const profile = await analyzePdf(resolvedPath);
    const analyzerMs = performance.now() - analyzerStartedAt;

    console.log("[evidence] Selecting, extracting, and rendering page pairs...");
    const evidenceStartedAt = performance.now();
    const selectedPairs = selectRepresentativePagePairs(profile.pageCount);
    const sampledTexts = await extractSampledPageTexts(
      resolvedPath,
      selectedPairs,
    );
    const evidence = await renderSampledPagePairs(
      resolvedPath,
      sampledTexts,
      evidenceDirectory,
    );
    const evidencePreparationMs = performance.now() - evidenceStartedAt;

    console.log("[openai] Sending one multimodal recommendation request...");
    if (options.variant !== "v1") {
      const result = await selectOpenAIRecommender(options.variant)(
        apiKey,
        model,
        profile,
        evidence,
        options.userLanguage,
      );
      const totalMs = performance.now() - totalStartedAt;
      const outputPath = path.join(
        outputDirectory,
        openAIRecommendationFileName(bookName, options.variant),
      );
      const output = {
        provider: result.provider,
        model: result.model,
        promptVersion: result.promptVersion,
        userLanguage: options.userLanguage,
        sourcePdf: resolvedPath,
        pdfBasename: path.basename(resolvedPath),
        timestamp: new Date().toISOString(),
        bookProfile: profile,
        sampledPagePairs: evidence.map(({ pages, imagePath }) => ({
          pages: pages
            .filter((page) => page !== undefined)
            .map(({ pageNumber, text }) => ({
              pageNumber,
              extractedTextCharacters: text.length,
            })),
          evidenceImage: path.relative(process.cwd(), imagePath),
          maximumExtractedCharactersPerPage: MAX_EXTRACTED_CHARS_PER_PAGE,
        })),
        recommendation: result.recommendation,
        usage: result.usage,
        timing: {
          analyzerMs,
          evidencePreparationMs,
          inferenceMs: result.inferenceMs,
          totalMs,
        },
      };

      await mkdir(outputDirectory, { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
      console.log(`\nSaved: ${path.relative(process.cwd(), outputPath)}`);
      console.log("\nOpenAI recommendation JSON");
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    const result = await selectOpenAIRecommender("v1")(
      apiKey,
      model,
      profile,
      evidence,
    );

    const totalMs = performance.now() - totalStartedAt;
    const outputPath = path.join(
      outputDirectory,
      openAIRecommendationFileName(bookName, "v1"),
    );
    const output = {
      provider: result.provider,
      model: result.model,
      promptVersion: result.promptVersion,
      sourcePdf: resolvedPath,
      pdfBasename: path.basename(resolvedPath),
      timestamp: new Date().toISOString(),
      bookProfile: profile,
      sampledPagePairs: evidence.map(({ pages, imagePath }) => ({
        pages: pages
          .filter((page) => page !== undefined)
          .map(({ pageNumber, text }) => ({
            pageNumber,
            extractedTextCharacters: text.length,
          })),
        evidenceImage: path.relative(process.cwd(), imagePath),
        maximumExtractedCharactersPerPage: MAX_EXTRACTED_CHARS_PER_PAGE,
      })),
      recommendations: result.recommendations,
      usage: result.usage,
      timing: {
        analyzerMs,
        evidencePreparationMs,
        inferenceMs: result.inferenceMs,
        totalMs,
      },
    };

    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    printSummary(resolvedPath, result.model, output, outputPath);
    console.log("\nOpenAI recommendation JSON");
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`OpenAI recommendation failed: ${message}`);
    process.exitCode = 1;
  }
}

async function validatePdfPath(filePath: string): Promise<void> {
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    throw new Error(`PDF does not exist or is not accessible: ${filePath}`);
  }
  if (!fileStat.isFile()) {
    throw new Error(`PDF path is not a file: ${filePath}`);
  }
  if (path.extname(filePath).toLowerCase() !== ".pdf") {
    throw new Error(`Expected a .pdf file: ${filePath}`);
  }
}

function requireEnvironmentValue(name: "OPENAI_API_KEY" | "OPENAI_MODEL"): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required in the environment or .env file`);
  }
  return value;
}

function printSummary(
  filePath: string,
  model: string,
  output: {
    sampledPagePairs: Array<{ pages: Array<{ pageNumber: number }> }>;
    recommendations: Record<
      string,
      { choice: string; confidence: string; reason: string; evidencePages: number[] }
    >;
    usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
    timing: {
      analyzerMs: number;
      evidencePreparationMs: number;
      inferenceMs: number;
      totalMs: number;
    };
  },
  outputPath: string,
): void {
  console.log(`\nBook: ${path.basename(filePath)}`);
  console.log(`Model: ${model}`);
  console.log("\nSampled pages:");
  for (const pair of output.sampledPagePairs) {
    console.log(`  ${pair.pages.map(({ pageNumber }) => pageNumber).join("-")}`);
  }
  console.log("\nRecommendations:");
  for (const spec of DECISION_SPECS) {
    const decision = output.recommendations[spec.id]!;
    console.log(
      `  ${spec.id.padEnd(22)} ${decision.choice.padEnd(20)} ${decision.confidence}`,
    );
    console.log(`    ${decision.reason}`);
    console.log(`    evidence: [${decision.evidencePages.join(", ")}]`);
  }
  console.log("\nUsage:");
  console.log(`  input tokens: ${output.usage.inputTokens ?? "unavailable"}`);
  console.log(`  output tokens: ${output.usage.outputTokens ?? "unavailable"}`);
  console.log(`  total tokens: ${output.usage.totalTokens ?? "unavailable"}`);
  console.log("\nTiming:");
  console.log(`  analysis: ${output.timing.analyzerMs.toFixed(1)} ms`);
  console.log(`  evidence: ${output.timing.evidencePreparationMs.toFixed(1)} ms`);
  console.log(`  inference: ${output.timing.inferenceMs.toFixed(1)} ms`);
  console.log(`  total: ${output.timing.totalMs.toFixed(1)} ms`);
  console.log(`\nSaved: ${path.relative(process.cwd(), outputPath)}`);
}
