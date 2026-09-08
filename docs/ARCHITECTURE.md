# ARCHITECTURE.md

Stack Library MVP のアーキテクチャ方針です。

## 採用方針

| 項目 | 方針 |
|---|---|
| フレームワーク | Next.js |
| ルーティング | App Router |
| CMS | microCMS |
| 登録処理 | Next.js Server Action |
| データモデル | `books` APIのみ |
| APIキー | サーバー側だけで利用 |
| 実装済み画面 | Book List / Book Detail / Library Bank |
| 将来実装 | Book Form |

旧Astro構成、旧6画面構成、サイドバー付き構成、knowledge map中心の構成は現在のMVPでは採用しません。

## 現在の主要ディレクトリ

表示用コンポーネントとデータ取得を分離します。

```txt
src/
  app/
    globals.css
    layout.tsx
    page.tsx
    bank/page.tsx
    books/[contentId]/page.tsx
  components/
    common/
      BookCover.tsx
      Heading.tsx
      StatusBadge.tsx
      TechnicalAreaTags.tsx
      ThemeSwitch.tsx
    card/
      BookCard.tsx
    section/
      BookDetailIdentity.tsx
      BookShelfSection.tsx
      BookTextSection.tsx
      ConnectionError.tsx
      LibraryBank.tsx
    layout/
      AppShell.tsx
      BookShelf.tsx
      LibraryHeader.tsx
      ScrollContextBar.tsx
  lib/
    microcms/client.ts
    books/queries.ts
    books/bank.ts
    books/normalize.ts
    books/labels.ts
  types/book.ts
stories/
  components/
    common/  (Heading, StatusBadge, TechnicalAreaTags, ThemeSwitch, BookCover)
    card/    (BookCard)
    section/ (BookDetailIdentity, BookShelfSection, ConnectionError, LibraryBank)
    layout/  (BookShelf, LibraryHeader, ScrollContextBar)
  fixtures/books.ts
  foundations/color.mdx
  storybook.css
```

ページとmicroCMS取得はServer Componentのまま維持します。Client Componentは、ブラウザ状態が必要なTheme Switchと、`IntersectionObserver`を使うContext Barに限定します。

Library Bankの集計は `lib/books/bank.ts` の純粋関数で行い、microCMS取得・画面表示から分離します。登録価格が `0` の場合と未登録の場合を異なる値として扱います。

## 表示基盤

- 主要コンテンツの最大幅は1224px
- Headerは画面上端へ連続する全幅の面とし、細い下境界線で本文と分ける。外側余白、強い角丸、影による浮遊表現は使わず、Product Contextは表示しない
- Theme Switchは太陽／月の各44×44操作を持つ100×52の既存PrimitiveをDesktop / Mobileで共用し、選択状態とアクセシブルネームを維持する
- ページレベルのレスポンシブ境界は1024pxのみ
- Desktop / Mobileで別DOMを作らず、同じコンポーネントをCSSで再配置
- 320pxなど狭い領域への対応は、Shelf TileとBook Identity自身のcontainer queryで扱う
- Light / Darkの差はsemantic CSS variablesで切り替え、余白や構造は変えない
- Footerは固定せず通常フローに置き、Page Shellの余剰高をMainが吸収する

## デザインシステムとコンポーネント

Figma、React、Storybookは同じものの複製ではなく、責務の異なる正本として扱います。

| 対象 | 責務 |
|---|---|
| Figma | 視覚仕様、トークン、レイアウト、状態、コンポーネント間の構成 |
| React | 振る舞い、props、データ境界、アクセシビリティ |
| Storybook | 再利用部品のカタログ、状態・テーマ・表示幅の検証 |
| App Router | 実データを使う画面構成とルーティング |

Storybookは`@storybook/nextjs-vite`で導入しています。Figmaの見た目をそのままComponent propsへ変換せず、Reactの再利用単位と責務を基準にStoryを作ります。

本棚・書影の設計判断は [本棚・書影設計正本](./DESIGN.md) に集約し、Figma・React・Storybook・検証状態の対応は [Component Traceability Registry](./COMPONENT_TRACEABILITY.md) で管理します。台帳の初期4部品に加えて、`BookShelf`、`BookShelfSection`、`BookCard`、`BookCover`を追跡対象とします。

Atomic Designはページの見出し名ではなく、依存方向の規則として使います。

```txt
Foundations
  -> Primitives
    -> Composites
      -> Patterns
        -> Screens
```

- Foundations: 色、文字、余白、罫線など。React Componentとしてexportしない
- Primitives: Button、Link、Statusなど、単独責務の小さな部品
- Composites: Book Cardなど、Primitiveを組み合わせた再利用部品
- Patterns: Header、Context Bar、Book List、Book Shelfなど、ページ領域として振る舞う構造
- Screens: App Router上の実ページ。部品ライブラリへ混ぜず、統合例として扱う

下位層が上位層へ依存しないようにします。粒度だけを理由にComponentを分割せず、独立した責務、再利用性、検証価値がある場合に抽出します。

Reactのファイル配置はAtomic Designの層名をそのままディレクトリ名にせず、実装上の責務で分類します。

```txt
src/components/
  common/   複数の画面領域で使う、ドメインに依存しない小さな部品
  card/     1件の対象を要約し、一覧や関連情報で再利用する部品
  section/  見出しと本文など、ページ内の意味のまとまり
  layout/   複数領域の配置規則を再利用する必要が生じた場合のみ追加
```

- `common/`は「何でも置く場所」ではなく、単独責務を持ち、複数の上位部品から利用される確定済みPrimitiveに限定する
- `card/`、`section/`、`layout/`は対象コンポーネントの責務と契約が確定してから作成し、空ディレクトリは置かない
- Reactコンポーネントと対応するStoryのファイル名は、export名に合わせたPascalCaseを正とする。fixture、CSS、設定ファイルなどの非コンポーネントはこの規則の対象外とする
- Atomic層はFigma名、Storybookの説明、Architecture上の分類で追跡し、`atoms/`、`molecules/`、`organisms/`という重複したファイル階層は作らない
- `Heading`は確定済みPrimitiveであり、`components/common/Heading.tsx`を正規のimport先とする。HTMLの見出しレベルは`as`、視覚スケールは`scale`で独立して指定する
- `StatusBadge`は確定済みPrimitiveであり、`components/common/StatusBadge.tsx`を正規のimport先とする。読書状態は日本語ラベルとsignalを併用し、色だけに依存しない
- `TechnicalAreaTags`は確定済みPrimitiveであり、`components/common/TechnicalAreaTags.tsx`を正規のimport先とする。各タグは`max-content`で内容幅に追従し、分類色を増やさず、複数時はwrapする
- `ThemeSwitch`は確定済みPrimitiveであり、`components/common/ThemeSwitch.tsx`を正規のimport先とする
- `BookShelf`は何も収納していない棚面と18px railだけを提供するLayoutであり、書籍データや見出しを持たない。`BookShelfSection`は書名・著者を含むHybrid `BookCard`一覧の行数に応じて棚本体を伸ばし、見出し・冊数・`BookCard`を組み合わせるBook ListのPatternとする。Desktop 6列、Mobile 2列、棚コンテナ320px以下1列はCSSへ委譲し、行高は最も高いカードへ追従させる

本棚・書影の寸法、背景、クリック領域、PC/SP・Light/Dark、Storybook検証面の正本は [本棚・書影設計正本](./DESIGN.md) を参照します。Issue #42のFigma exact nodesはComponent Traceability Registryのnode mapで追跡し、2026-09-08のfigma_design_qa PASS（findings none）によりcurrent-node read-backと実装renderとのparityを`VERIFIED`とします。Desktop typical cardは176×241、long-title cardは176×262、coverは110×170、shelfは1136×330（312+18）で、Mobile / narrow、200%、focus、interaction、missing coverも確認済みです。Header、Page Intro、見出し文言、冊数削除はparity対象外です。

Storybookの実体はリポジトリ直下の`stories/`に置き、`stories/components/`以下は`src/components/`の責務別ディレクトリに対応させます。titleも同じ論理階層を使い、Atomic Design上の層名はナビゲーション階層へ重ねず、各Storyの説明とArchitectureで追跡します。

```txt
Foundations/Color
Components/Common/Heading
Components/Common/StatusBadge
Components/Common/TechnicalAreaTags
Components/Common/ThemeSwitch
Components/Card/BookCard
Components/Section/SectionName
Components/Section/BookShelfSection
Components/Layout/BookShelf
Components/Layout/LayoutName
```

- 実装コンポーネントとStoryを同じディレクトリへ置かず、Storyは`stories/components/`以下の対応する責務別ディレクトリへ置く
- Light / DarkはStorybook globalとして切り替える
- Desktop / MobileはStorybook標準のViewport機能またはcontainerで検証する。Viewportは日本語のデスクトップ、タブレット、スマートフォンを用意し、別パッケージのViewport addonは追加しない
- Responsive専用ComponentやTheme専用variantを作らない
- Figma名、React export名、Storybook titleの対応を追跡できるようにする
- 画面固有のfixtureと公開Componentを分離する
- StorybookからmicroCMSへ接続せず、`Book`型に準拠したfixtureで状態を再現する
- 再利用コンポーネントには代表状態のStoryを用意し、操作がある場合は必要なinteraction testを追加する

## データ取得

### Book List

`/` はサーバー側で microCMS から `books` を取得します。

蔵書は状態別の棚へ分割せず、実際の棚面に書影・書名・著者を並べる単一のカタログとして表示します。`BookShelf`はflatな棚面とrail、`BookShelfSection`は見出し・冊数・Hybrid `BookCard`の組み合わせ、`BookCard`は1リンク/1 Tab stopの詳細導線、`BookCover`は書影または`書影なし`の表示を担当します。書影またはidentityを選ぶとBook Detailへ遷移し、出版社・読書状態・技術領域などを確認します。将来の絞り込みは `/` の検索パラメータとして扱い、状態別の独立ページは作りません。

### Book Detail

`/books/[contentId]` は `contentId` を使って microCMS から1件取得します。

slug はMVPでは使いません。

### Library Bank

`/bank` は `getAllContents` を使って `books` を全件取得し、100件を超える蔵書も集計します。取得と集計はServer Component境界に置き、APIキーや生レスポンスをClient Componentへ渡しません。

画面上部は登録価格合計・価格登録済み冊数・価格未登録冊数に限定し、明細は書名・出版社・登録価格の安定した列で表示します。平均、登録率、読書状態別内訳、日付は表示しません。

表示する金額は蔵書に登録した税込価格（日本円）であり、市場価格・買取価格・資産価値ではありません。

視覚仕様はFigmaの `Library Bank / Implementation Source`（section `605:1066`）を正本とします。Desktop Light/Darkは `605:1067` / `605:1068`、Mobile Light/Darkは `605:1069` / `605:1070` を参照し、Headerは`color/surface`、外側ラップと本文は`color/canvas`で連続させます。

通常状態はEyebrow、ページ見出し、集計、明細の階層だけで理解できる構成とし、見出しを反復するdescriptionや実装注記を画面へ表示しません。Book 0件、価格登録済み0件、取得失敗など、誤解を防ぐ必要がある状態説明は残します。

### Book Form

`/books/new` はフォームを表示し、送信は Server Action に委譲します。

## Server Action の流れ

```txt
Book Form
  -> Server Action
  -> 入力値を検証
  -> microCMS books API にPOST
  -> 成功時に /books/[contentId] または / へ遷移
  -> 失敗時にフォームへエラーを返す
```

## microCMS APIキー

APIキーはクライアントへ公開しません。

`.env.local` には以下を置く想定です。

```txt
MICROCMS_SERVICE_DOMAIN=
MICROCMS_API_KEY=
```

`NEXT_PUBLIC_` で始まる microCMS APIキーは作りません。

Hobbyプランでは作成可能なAPIキーが1本のため、読み取りと登録で同じキーを使用します。

開発時のmicroCMS操作は、親の`development_lead`だけが公式リモートMCP（`https://mcp.microcms.io/mcp/meguru-stack-library`）へ直接接続して行います。全30 custom agent TOMLはmicroCMS serverを明示的に無効化します。親の公式MCP inventoryは接続設定に従って実行時に確認し、tool数やallowlistを固定要件にしません。`books` APIへのcreateはプロンプト承認を必須とします。Codex MCP認証はhost/user environment variableの`MICROCMS_API_KEY`を使い、アプリruntime用の`.env.local`だけをcredential sourceとして扱いません。対象は`books` APIに限り、APIキーの扱い、one-shot mutation、read-back検証、禁止操作、MCP evidenceは[AGENTS.md](../AGENTS.md)を正本とします。

推奨権限:

- デフォルト権限はすべて無効
- `books` APIの個別権限で `GET` と `POST` のみ有効
- `PUT`、`PATCH`、`DELETE` は対応機能を実装するまで無効
- app runtimeのAPIキーはServer ComponentとServer Actionからだけ利用する。開発時の公式MCPは別のdevelopment MCP境界として、host processからAPIキーを秘密として供給する例外であり、browser/clientへ公開しない

## バリデーション

Server Action 側で最低限以下を検証します。

- `title` が空でない
- `authors` が空でない
- `readingStatus` が許可された値である
- URL項目がURLとして妥当である
- 日付項目が日付として妥当である

## MVPで扱わないもの

- topics API
- notes API
- collections API
- knowledge map
- 学習ルート
- サイドバー
- ログイン
- 権限管理
- 画像アップロード
- 読書レビュー投稿
- AI推薦

書影はmicroCMS Assetsの画像フィールドを利用します。画面側ではURLと固有の幅・高さを正規化し、固定比率へ変形せず最大枠内に収めます。
