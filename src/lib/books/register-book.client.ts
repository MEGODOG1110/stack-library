import type { CheckedBookInput } from "@/components/book-form/book-form.types";
const messages: Record<string,string> = {
  "registration-disabled": "登録設定がまだ完了していません。", "media-key-not-configured": "microCMSのAPIキーが未設定です。MICROCMS_API_KEYを確認してください。",
  "media-upload-rejected": "書影を保存できませんでした。メディアアップロード権限を確認してください。",
  "registration-unknown": "保存結果を確認できません。microCMS管理画面で書籍とメディアを確認するまで再登録しないでください。",
  "isbn-already-registered": "このISBNの本は登録済みです。", "cms-create-rejected": "書籍を保存できませんでした。API権限とtechnicalAreasの6分類設定を確認してください。",
  "cover-too-large": "書影は5MB以下にしてください。", "cover-format-invalid": "書影はJPEG・PNG・WebPを選択してください。",
  "cms-not-configured": "保存先の設定が不足しています。.env.localのMICROCMS_SERVICE_DOMAINとMICROCMS_API_KEYを確認してください。",
  "cms-read-failed": "登録済み書籍を確認できませんでした。microCMSのbooksへのGET権限と接続先を確認してください。まだ書影・書籍は保存していません。",
  "cover-download-failed": "書影のダウンロードに失敗しました。「不足情報の入力・修正」から画像ファイルを選んでください。",
  "cover-source-invalid": "この書影URLは保存できません。「不足情報の入力・修正」から画像ファイルを選んでください。",
  "cover-invalid": "書影が空か、読み取れません。「不足情報の入力・修正」から画像を選び直してください。",
  "title-authors-required": "書名または著者が不足しています。「不足情報の入力・修正」で入力してください。",
  "invalid-price": "税込価格は0以上の数値で入力してください。",
  "invalid-areas": "分野の値が正しくありません。6分類から選び直してください。",
  "invalid-keywords": "検索語を文字列で入力してください。",
};
export async function registerBook(book: CheckedBookInput) {
  const form = new FormData(); const { cover, ...fields } = book;
  form.set("book", JSON.stringify(fields)); if (cover instanceof File) form.set("cover", cover); else form.set("coverUrl", cover);
  let response: Response;
  try { response = await fetch("/api/books", { method: "POST", body: form }); }
  catch { throw new Error(messages["registration-unknown"]); }
  let data;
  try { data = await response.json(); } catch { throw new Error(messages["registration-unknown"]); }
  if (data.error === "configuration-missing" && Array.isArray(data.missing)) throw new Error(`保存設定が不足しています：${data.missing.join("、")}。.env.localで設定し、開発サーバーを再起動してください。本の入力内容は不足していません。`);
  if (!response.ok) throw new Error(messages[data.error] ?? "登録できませんでした。入力は保持しています。");
  return data as { contentId: string };
}
