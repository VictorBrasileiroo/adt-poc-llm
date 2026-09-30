import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createCanvas, type Canvas } from "@napi-rs/canvas";
import type { PDFPageProxy } from "pdfjs-dist";

import type { SampledPageEvidence, SampledPagePair } from "./representative-pages.js";

export const RENDER_MAX_PAGE_SIDE_PX = 1_100;
const CONTACT_SHEET_GAP_PX = 12;
const CONTACT_SHEET_BACKGROUND = "#eeeeee";

interface RenderedPage {
  canvas: Canvas;
  width: number;
  height: number;
}

export async function renderSampledPagePairs(
  pdfPath: string,
  sampledPages: readonly (readonly [SampledPageEvidence, SampledPageEvidence?])[],
  evidenceDirectory: string,
): Promise<SampledPagePair[]> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({
    data: new Uint8Array(await readFile(pdfPath)),
  });

  await mkdir(evidenceDirectory, { recursive: true });

  try {
    const document = await loadingTask.promise;
    const results: SampledPagePair[] = [];

    for (const pages of sampledPages) {
      const renderedPages: RenderedPage[] = [];
      for (const evidence of pages) {
        if (evidence !== undefined) {
          const page = await document.getPage(evidence.pageNumber);
          try {
            renderedPages.push(await renderPage(page));
          } finally {
            page.cleanup();
          }
        }
      }

      const imageBuffer = composeContactSheet(renderedPages);
      const pageNumbers = pages
        .filter((page): page is SampledPageEvidence => page !== undefined)
        .map(({ pageNumber }) => String(pageNumber).padStart(3, "0"));
      const imagePath = path.join(
        evidenceDirectory,
        `pages-${pageNumbers.join("-")}.png`,
      );
      await writeFile(imagePath, imageBuffer);
      results.push({ pages, imagePath, imageBuffer });
    }

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to render sampled PDF pages: ${message}`, {
      cause: error,
    });
  } finally {
    await loadingTask.destroy();
  }
}

async function renderPage(page: PDFPageProxy): Promise<RenderedPage> {
  const originalViewport = page.getViewport({ scale: 1 });
  const scale =
    RENDER_MAX_PAGE_SIDE_PX /
    Math.max(originalViewport.width, originalViewport.height);
  const viewport = page.getViewport({ scale });
  const width = Math.max(1, Math.ceil(viewport.width));
  const height = Math.max(1, Math.ceil(viewport.height));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
    background: "#ffffff",
  }).promise;

  return { canvas, width, height };
}

function composeContactSheet(renderedPages: readonly RenderedPage[]): Buffer {
  if (renderedPages.length === 0) {
    throw new Error("Cannot create a contact sheet without a rendered page");
  }

  const width =
    renderedPages.reduce((sum, page) => sum + page.width, 0) +
    CONTACT_SHEET_GAP_PX * (renderedPages.length - 1);
  const height = Math.max(...renderedPages.map((page) => page.height));
  const sheet = createCanvas(width, height);
  const context = sheet.getContext("2d");
  context.fillStyle = CONTACT_SHEET_BACKGROUND;
  context.fillRect(0, 0, width, height);

  let x = 0;
  for (const page of renderedPages) {
    context.drawImage(page.canvas, x, 0, page.width, page.height);
    x += page.width + CONTACT_SHEET_GAP_PX;
  }

  return sheet.toBuffer("image/png");
}
