import type { ShelfBook, ShelfOption } from "./bookshelf.types";

export const shelfAreas: readonly ShelfOption[] = [
  { id: "frontend", label: "フロントエンド" },
  { id: "design", label: "デザイン" },
  { id: "ai-development", label: "AI・開発支援" },
];

export const shelfTags: readonly ShelfOption[] = [
  { id: "react", label: "React" },
  { id: "css", label: "CSS" },
  { id: "figma", label: "Figma" },
  { id: "ai", label: "AI" },
  { id: "design", label: "設計" },
];

/** openBDのTitleText.collationkeyをISBNで照合して取得（2026-10-24）。 */
const titleMetadata: Record<string, { isbn: string; titleReading: string }> = {
  "figma-design-system": { isbn: "9784798181493", titleReading: "フィグマ フォー デザイン システム : デザイン オ チュウシン ト シタ プロダクト カイハツ ノ シクミズクリ" },
  "figma-mcp": { isbn: "9784839990329", titleReading: "タメシテマナブフィグマエムシーピーサーバー : エーアイヲカツヨウシタプロダクトカイハツ" },
  "css-design": { isbn: "9784297111731", titleReading: "シーエスエス セッケイ カンゼン ガイド : ショウサイ カイセツ プラス ジッセンテキ モジュールシュウ" },
  codex: { isbn: "9784297158606", titleReading: "コーデックスデハジメルエージェンティックコーディング  エーアイエージェントニヨルジリツテキシステムカイハツガイド" },
  "web-design": { isbn: "9784815643300", titleReading: "ハジメテ ダケド ヤサシク ワカル ウェブ デザイン キチント ニュウモン" },
  "ai-dialogue": { isbn: "9784297158194", titleReading: "エンジニアノエーアイカベウチジッセンジュツ" },
  "ui-ideas": { isbn: "9784295021285", titleReading: "シーエスエス ト ジャバ スクリプト デ ツクル ウゴク ユーアイ アイデア レシピ" },
  "ai-documents": { isbn: "9784802615624", titleReading: "エンジニアノタメノ　エーアイニツタワルドキュメントノキホン" },
  react: { isbn: "9784815636623", titleReading: "ザセツ シナイ リアクト ノ キョウカショ : ツクリナガラ マナブ ウェブ カイハツ" },
};

/** 書影・書名・著者はユーザー提供Figma 108:24の表紙から転記。
 * 分野・タグ・追加日は表示確認用。実際の所蔵状態やCMSデータではない。
 */
export const shelfBooks: readonly ShelfBook[] = [
  { id: "figma-design-system", title: "Figma for デザインシステム — デザインを中心としたプロダクト開発の仕組み作り", authors: ["沢田俊介"], areaIds: ["design"], tagIds: ["figma", "design"], createdAt: "2026-10-09T00:00:00Z" },
  { id: "figma-mcp", title: "試して学ぶ Figma MCPサーバー — AIを活用したプロダクト開発", authors: ["竹田学", "天辰一希", "高橋秀明", "八木田裕伍"], areaIds: ["ai-development"], tagIds: ["figma", "ai"], createdAt: "2026-10-08T00:00:00Z" },
  { id: "css-design", title: "CSS設計完全ガイド", authors: ["半田惇志"], areaIds: ["frontend"], tagIds: ["css", "design"], createdAt: "2026-10-07T00:00:00Z" },
  { id: "codex", title: "Codexではじめるエージェンティックコーディング — AIエージェントによる自律的システム開発ガイド", authors: ["鈴木章太郎", "スナガク（馬場俊輔）", "中村彰宏", "びーぐる（藤原祥司）", "河村大輔"], areaIds: ["ai-development"], tagIds: ["ai"], createdAt: "2026-10-06T00:00:00Z" },
  { id: "web-design", title: "初めてだけどやさしくわかる Webデザインきちんと入門", authors: ["伊藤庄平", "益子貴寛", "久保知己", "宮田優希", "伊藤由暁"], areaIds: ["design"], tagIds: ["design", "css"], createdAt: "2026-10-05T00:00:00Z" },
  { id: "ai-dialogue", title: "エンジニアのAI壁打ち実践術", authors: ["平湯太郎", "高槻大貴", "米道卓音"], areaIds: ["ai-development"], tagIds: ["ai"], createdAt: "2026-10-04T00:00:00Z" },
  { id: "ui-ideas", title: "CSSとJavaScriptで作る動くUIアイデアレシピ", authors: ["Mana"], areaIds: ["frontend"], tagIds: ["css"], createdAt: "2026-10-03T00:00:00Z" },
  { id: "ai-documents", title: "エンジニアのためのAIに伝わるドキュメントの基本", authors: ["仲田尚央"], areaIds: ["ai-development"], tagIds: ["ai"], createdAt: "2026-10-02T00:00:00Z" },
  { id: "react", title: "挫折しないReactの教科書", authors: ["清水一貴", "大畑篤樹"], areaIds: ["frontend"], tagIds: ["react"], createdAt: "2026-10-01T00:00:00Z" },
].map((book) => ({ ...book, ...titleMetadata[book.id], coverSrc: `/mockups/bookshelf/covers/${book.id}.png` }));
