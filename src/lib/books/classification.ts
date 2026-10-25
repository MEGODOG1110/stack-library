export const bookAreas = [
  {id:"web",label:"Web・アプリ開発"}, {id:"programming",label:"プログラミング・設計"},
  {id:"infrastructure",label:"インフラ・運用"}, {id:"data",label:"データ・データベース"},
  {id:"ai",label:"AI"}, {id:"design",label:"デザイン"},
] as const;
const legacy: Record<string,string> = {
  "フロントエンド":"web", "バックエンド":"web", "モバイル":"web",
  "プログラミング言語":"programming", "アーキテクチャ":"programming", "テスト":"programming",
  "インフラ":"infrastructure", "DevOps":"infrastructure", "セキュリティ":"infrastructure",
  "データ":"data", "データベース":"data",
};
export function areaIds(values: readonly string[]) {
  return [...new Set(values.map(value => bookAreas.find(area=>area.label===value)?.id ?? legacy[value]).filter((id):id is string=>!!id))];
}
export const splitKeywords = (value: string) => [...new Set(value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean))];
