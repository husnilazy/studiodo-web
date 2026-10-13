// Client-side: shrink a picked image before it is sent through a server action (and stored by the API as a normal file).
// Keeps uploads small and fast on mobile data, and well under the 4 MB action limit.

export async function resizeImageToDataUrl(file: File, maxSide = 900, type: "image/jpeg" | "image/png" = "image/jpeg", quality = 0.85): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Pilih file gambar (JPG, PNG, atau WebP).");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pengolahan gambar.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL(type, quality);
}
