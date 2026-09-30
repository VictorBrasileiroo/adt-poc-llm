import { readFile } from "node:fs/promises";

export const MAX_REPRESENTATIVE_PAGE_PAIRS = 3;
export const MAX_EXTRACTED_CHARS_PER_PAGE = 300;
export const MAX_EXTRACTED_CHARS_TOTAL =
  MAX_REPRESENTATIVE_PAGE_PAIRS * 2 * MAX_EXTRACTED_CHARS_PER_PAGE;

export interface SampledPageEvidence {
  pageNumber: number;
  text: string;
}

export interface SampledPagePair {
  pages: readonly [SampledPageEvidence, SampledPageEvidence?];
  imagePath: string;
  imageBuffer: Buffer;
}

/**
 * Selects non-overlapping consecutive pairs. Documents with at least seven
 * pages use only pages 2..N-1, avoiding the cover and final page. If more than
 * three pairs are available, the first, middle, and last candidates are used.
 */
export function selectRepresentativePagePairs(
  pageCount: number,
): Array<readonly [number, number?]> {
  if (!Number.isInteger(pageCount) || pageCount <= 0) {
    throw new Error("PDF must contain at least one valid page");
  }

  const firstPage = pageCount >= 7 ? 2 : 1;
  const lastPage = pageCount >= 7 ? pageCount - 1 : pageCount;
  const candidates: Array<readonly [number, number?]> = [];

  for (let page = firstPage; page <= lastPage; page += 2) {
    candidates.push(
      page + 1 <= lastPage ? [page, page + 1] : [page],
    );
  }

  if (candidates.length <= MAX_REPRESENTATIVE_PAGE_PAIRS) {
    return candidates;
  }

  return [
    candidates[0]!,
    candidates[Math.round((candidates.length - 1) / 2)]!,
    candidates[candidates.length - 1]!,
  ];
}

export async function extractSampledPageTexts(
  pdfPath: string,
  pairs: readonly (readonly [number, number?])[],
): Promise<Array<readonly [SampledPageEvidence, SampledPageEvidence?]>> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({
    data: new Uint8Array(await readFile(pdfPath)),
  });

  try {
    const document = await loadingTask.promise;
    return await Promise.all(
      pairs.map(async ([first, second]) => {
        const firstEvidence = await extractPageText(document, first);
        const secondEvidence =
          second === undefined
            ? undefined
            : await extractPageText(document, second);
        return [firstEvidence, secondEvidence] as const;
      }),
    );
  } finally {
    await loadingTask.destroy();
  }
}

export function normalizeSampledPageWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function truncateSampledPageText(text: string): string {
  if (text.length <= MAX_EXTRACTED_CHARS_PER_PAGE) {
    return text;
  }

  const candidate = text.slice(0, MAX_EXTRACTED_CHARS_PER_PAGE);
  const lastWhitespace = candidate.lastIndexOf(" ");
  const reasonableBoundary = Math.floor(MAX_EXTRACTED_CHARS_PER_PAGE * 0.8);
  return candidate
    .slice(0, lastWhitespace >= reasonableBoundary ? lastWhitespace : undefined)
    .trimEnd();
}

type PdfDocument = Awaited<
  ReturnType<(typeof import("pdfjs-dist/legacy/build/pdf.mjs"))["getDocument"]>["promise"]
>;

async function extractPageText(
  document: PdfDocument,
  pageNumber: number,
): Promise<SampledPageEvidence> {
  if (pageNumber < 1 || pageNumber > document.numPages) {
    throw new Error(
      `Sampled page ${pageNumber} is outside PDF page range 1-${document.numPages}`,
    );
  }

  const page = await document.getPage(pageNumber);
  try {
    const content = await page.getTextContent();
    const text = normalizeSampledPageWhitespace(
      content.items
        .filter((item) => "str" in item)
        .map((item) => item.str)
        .join(" "),
    );
    return { pageNumber, text: truncateSampledPageText(text) };
  } finally {
    page.cleanup();
  }
}
