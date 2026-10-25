import { RegistrationError } from "./microcms-registration";
const max = 5 * 1024 * 1024;
async function bounded(response: Response) {
  if (!response.ok || Number(response.headers.get("content-length")) > max) throw new RegistrationError("cover-download-failed", 422);
  const reader = response.body?.getReader(); if (!reader) throw new RegistrationError("cover-invalid", 422);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > max) { await reader.cancel(); throw new RegistrationError("cover-too-large", 422); } chunks.push(part.value); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; } return bytes;
}
export async function uploadCover(cover: File | string, isbn: string): Promise<string> {
  if (!/^(978|979)\d{10}$/.test(isbn)) throw new RegistrationError("invalid-isbn", 400);
  const key = process.env.MICROCMS_API_KEY;
  if (!key) throw new RegistrationError("media-key-not-configured", 503);
  let bytes: Uint8Array;
  if (typeof cover === "string") {
    let url: URL; try { url = new URL(cover); } catch { throw new RegistrationError("cover-invalid", 422); }
    const signal = AbortSignal.timeout(10000);
    let response: Response | undefined;
    for (let hop = 0; hop < 4; hop++) {
      if (url.protocol !== "https:" || !["books.google.com", "books.googleusercontent.com"].includes(url.hostname) || url.username || url.password || url.port) throw new RegistrationError("cover-source-invalid", 422);
      try { response = await fetch(url, { cache: "no-store", redirect: "manual", signal }); }
      catch { throw new RegistrationError("cover-download-failed", 422); }
      if (![301,302,303,307,308].includes(response.status)) break;
      const location = response.headers.get("location"); await response.body?.cancel();
      if (!location || hop === 3) throw new RegistrationError("cover-download-failed", 422);
      url = new URL(location, url);
    }
    if (!response) throw new RegistrationError("cover-download-failed", 422);
    bytes = await bounded(response);
  } else { if (!cover.size || cover.size > max) throw new RegistrationError("cover-too-large", 422); bytes = new Uint8Array(await cover.arrayBuffer()); }
  const png = bytes.length > 8 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
  const jpeg = bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  const webp = String.fromCharCode(...bytes.slice(0,4))==="RIFF" && String.fromCharCode(...bytes.slice(8,12))==="WEBP";
  if (!png && !jpeg && !webp) throw new RegistrationError("cover-format-invalid", 422);
  const form = new FormData(); form.set("file", new Blob([bytes as BlobPart], { type: png ? "image/png" : jpeg ? "image/jpeg" : "image/webp" }), `${isbn}.${png ? "png" : jpeg ? "jpg" : "webp"}`);
  try {
    const response = await fetch("https://stack-library.microcms-management.io/api/v1/media", { method: "POST", headers: { "X-MICROCMS-API-KEY": key }, body: form, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new RegistrationError("media-upload-rejected", 502);
    const value = await response.json();
    if (typeof value.url !== "string" || !value.url.startsWith("https://images.microcms-assets.io/")) throw new Error("Invalid media result");
    return value.url;
  } catch (error) { if (error instanceof RegistrationError) throw error; throw new RegistrationError("registration-unknown", 503); }
}
