import { registerInMicrocms, RegistrationError } from "@/lib/books/microcms-registration";
import { uploadCover } from "@/lib/books/cover-upload";
import { auth } from "@/auth";
import { authConfigured, isLocalDevelopment, isOwner } from "@/lib/auth/owner";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!isLocalDevelopment(url) && (!authConfigured() || !isOwner((await auth())?.user?.id))) return Response.json({ error: "authentication-required" }, { status: 401 });
  const missing = [
    ...(process.env.MICROCMS_SERVICE_DOMAIN !== "stack-library" ? ["MICROCMS_SERVICE_DOMAIN=stack-library"] : []),
    ...(!process.env.MICROCMS_API_KEY ? ["MICROCMS_API_KEY"] : []),
  ];
  if (missing.length) return Response.json({ error: "configuration-missing", missing }, { status: 503 });
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return Response.json({ error: "invalid-content-type" }, { status: 415 });
  let input: unknown;
  let cover: File | string;
  try {
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024) return Response.json({ error: "input-too-large" }, { status: 413 });
    const form = await request.formData(); const raw = form.get("book");
    if (typeof raw !== "string" || raw.length > 32000) throw new Error("metadata");
    const fields = JSON.parse(raw);
    cover = form.get("cover") instanceof File ? form.get("cover") as File : String(form.get("coverUrl") ?? "");
    input = { ...fields, cover: "https://images.microcms-assets.io/pending.png" };
  }
  catch { return Response.json({ error: "invalid-json" }, { status: 400 }); }
  try { return Response.json(await registerInMicrocms(input, (isbn) => uploadCover(cover, isbn)), { status: 201, headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return Response.json({ error: error instanceof RegistrationError ? error.code : "cms-unavailable" }, { status: error instanceof RegistrationError ? error.httpStatus : 502 }); }
}
