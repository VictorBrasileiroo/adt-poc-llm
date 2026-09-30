import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  aggregateBookProfile,
  detectActivitySignals,
  detectLikelyMultiColumn,
} from "./metrics.js";
import type {
  BookProfile,
  PageObservation,
  PositionedTextItem,
} from "./types.js";

async function validatePdfPath(filePath: string): Promise<void> {
  if (path.extname(filePath).toLowerCase() !== ".pdf") {
    throw new Error(`Expected a .pdf file: ${filePath}`);
  }

  try {
    await access(filePath);
  } catch {
    throw new Error(`PDF file does not exist or is not accessible: ${filePath}`);
  }

  if (!(await stat(filePath)).isFile()) {
    throw new Error(`PDF path is not a file: ${filePath}`);
  }
}

function countImageOperations(
  operatorCodes: readonly number[],
  imageOperationCodes: ReadonlySet<number>,
): number {
  return operatorCodes.reduce(
    (count, operation) =>
      count + (imageOperationCodes.has(operation) ? 1 : 0),
    0,
  );
}

export async function analyzePdf(filePath: string): Promise<BookProfile> {
  await validatePdfPath(filePath);

  const { getDocument, OPS } = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );
  // pdfjs-dist 6.3.289 does not expose paintJpegXObject. Count only image
  // operations that the installed version actually exposes.
  const imageOperationCodes = new Set<number>(
    [OPS.paintImageXObject, OPS.paintInlineImageXObject].filter(
      (operation): operation is number => typeof operation === "number",
    ),
  );
  const bytes = new Uint8Array(await readFile(filePath));
  const loadingTask = getDocument({ data: bytes });

  try {
    const document = await loadingTask.promise;
    const observations: PageObservation[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const [textContent, operatorList] = await Promise.all([
        page.getTextContent(),
        page.getOperatorList(),
      ]);

      const textItems: PositionedTextItem[] = textContent.items.flatMap((item) => {
        if (!("str" in item)) {
          return [];
        }

        return [{ text: item.str.trim(), x: item.transform[4] }];
      });
      const nonEmptyTextItems = textItems.filter(({ text }) => text.length > 0);
      const pageText = nonEmptyTextItems.map(({ text }) => text).join("\n");
      const charCount = nonEmptyTextItems.reduce(
        (sum, { text }) => sum + text.length,
        0,
      );

      observations.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        charCount,
        textItemCount: nonEmptyTextItems.length,
        imageOperationCount: countImageOperations(
          operatorList.fnArray,
          imageOperationCodes,
        ),
        isLandscape: viewport.width > viewport.height,
        isLikelyMultiColumn: detectLikelyMultiColumn(
          nonEmptyTextItems,
          charCount,
          viewport.width,
        ),
        hasActivitySignals: detectActivitySignals(pageText),
      });

      page.cleanup();
    }

    return aggregateBookProfile(observations);
  } finally {
    await loadingTask.destroy();
  }
}
