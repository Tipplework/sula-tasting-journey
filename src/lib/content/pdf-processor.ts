import { supabase } from "@/integrations/supabase/client";

// Lazy load pdfjs to keep main bundle light
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  // Use the bundled worker via Vite ?url import
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("blob failed"))),
      "image/webp",
      quality,
    );
  });
}

export interface PdfRenderResult {
  pageCount: number;
  coverUrl: string;
  pages: { fullUrl: string; thumbUrl: string; width: number; height: number }[];
}

export async function processPdf(
  itemId: string,
  file: File,
  onProgress?: (p: { stage: string; current: number; total: number }) => void,
): Promise<PdfRenderResult> {
  const pdfjs = await loadPdfjs();

  // Upload source pdf
  onProgress?.({ stage: "uploading source", current: 0, total: 1 });
  const sourceKey = `${itemId}/source.pdf`;
  const { error: upErr } = await supabase.storage
    .from("content-pdfs")
    .upload(sourceKey, file, { upsert: true, contentType: "application/pdf" });
  if (upErr) throw upErr;

  // Render pages
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const total = doc.numPages;
  const pages: PdfRenderResult["pages"] = [];

  for (let i = 1; i <= total; i++) {
    onProgress?.({ stage: "rendering pages", current: i, total });
    const page = await doc.getPage(i);

    const targetWidth = 1600;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const fullBlob = await canvasToBlob(canvas, 0.85);

    // Thumbnail
    const thumbScale = 320 / canvas.width;
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 320;
    thumbCanvas.height = Math.floor(canvas.height * thumbScale);
    thumbCanvas.getContext("2d")!.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    const thumbBlob = await canvasToBlob(thumbCanvas, 0.75);

    const fullKey = `${itemId}/page-${i}.webp`;
    const thumbKey = `${itemId}/thumb-${i}.webp`;

    await Promise.all([
      supabase.storage.from("content-thumbnails").upload(fullKey, fullBlob, {
        upsert: true,
        contentType: "image/webp",
      }),
      supabase.storage.from("content-thumbnails").upload(thumbKey, thumbBlob, {
        upsert: true,
        contentType: "image/webp",
      }),
    ]);

    const fullUrl = supabase.storage.from("content-thumbnails").getPublicUrl(fullKey).data.publicUrl;
    const thumbUrl = supabase.storage.from("content-thumbnails").getPublicUrl(thumbKey).data.publicUrl;
    pages.push({ fullUrl, thumbUrl, width: canvas.width, height: canvas.height });
  }

  return {
    pageCount: total,
    coverUrl: pages[0]?.fullUrl ?? "",
    pages,
  };
}

export async function getPdfSourceUrl(itemId: string) {
  return supabase.storage.from("content-pdfs").getPublicUrl(`${itemId}/source.pdf`).data.publicUrl;
}
