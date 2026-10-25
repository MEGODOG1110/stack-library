import type { BookFormDraft } from "./book-form.types";
/** 表示確認用の架空データ。保存済みの蔵書ではない。 */
export const sampleBookDraft: BookFormDraft = { title: "コンポーネント設計のサンプル", authors: "サンプル著者A\nサンプル著者B", isbn: "9784815636623", publisher: "サンプル出版社", areaIds: ["web"], keywords: "React", price: "0" };
export const sampleFormTags = [{ id: "react", label: "React" }, { id: "css", label: "CSS" }, { id: "figma", label: "Figma" }, { id: "ai", label: "AI" }, { id: "design", label: "設計" }];

/** Storyの画像選択操作に使う架空のPNG。製品の書影素材ではない。 */
export async function makeSampleCover(): Promise<File> {
  const canvas = document.createElement("canvas"); canvas.width = 104; canvas.height = 157;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#d1d5db"; context.fillRect(0, 0, 104, 157);
  context.fillStyle = "#374151"; context.font = "14px sans-serif"; context.fillText("SAMPLE", 20, 78);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("sample PNG unavailable")), "image/png"));
  return new File([blob], "sample-cover.png", { type: "image/png" });
}
