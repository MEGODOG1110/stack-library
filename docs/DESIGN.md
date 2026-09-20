# 本棚・書影設計 — FROZEN_REFERENCE

本書は、Stack LibraryのBook Listにおける本棚と書影の歴史的な設計証拠です。内部で「正本」「VERIFIED」と記載された内容は、記録済みrevisionにおける旧設計の主張であり、rebuildを承認したり現在のvisual authorityになったりしません。authority orderと停止条件は[AGENTS.md](../AGENTS.md)に従います。

## 設計概要

Stack Libraryは、1人の技術書所有者が自分の蔵書を眺め、持っているかを確認し、書影から詳細へ入るための個人用ライブラリです。Book Listは本棚を眺める画面であり、書籍情報を一覧に詰め込む画面ではありません。暗色を基調にした静かな技術標本室の方向性、日本語ファースト、細い罫線、精密なメタデータ表示、アクセシビリティの原則を維持します。

本棚背景は装飾ではなく、書影を収める面です。書影は固有の縦横比を保ち、カードのように浮かせる追加の面は設けません。Book Listでは書影に加えて、書名と著者を同じリンク面に常時表示します。

## 利用状況

利用者は、Desktopでは本棚全体を眺め、Mobileでは店頭などの狭い場所で「これ持っていたっけ」を素早く確認します。Book Listには書影・書名・著者を並べ、出版社、読書状態、技術領域などの詳細情報はBook Detailで確認します。書影またはidentityを含むリンク面を選択すると、既存のルート契約に従って `/books/[contentId]` のBook Detailへ遷移します。

## 一覧の情報設計

- Book Listの一覧表示は書影・書名・著者のHybridとする。
- 一覧には出版社、状態、技術領域、レベル、概要、ISBNを表示しない。
- 見出し「蔵書一覧」と登録冊数は `BookShelfSection` が提供する。
- 書影がない場合も一覧の位置と遷移可能性を壊さず、`BookCover` の代替表示を使う。
- クリック対象は書影を含む `BookCard` のリンク矩形であり、棚のgrid cell全体ではない。

## 本棚の構造

`BookShelf`は、空の1段分のflatな棚面とrailだけを提供するLayoutです。データ、見出し、リンクを持たず、子要素を収納する面だけを受け取ります。`BookShelf`単体のLayout契約として、子要素が空でも最低1行分の棚面を表示します（Desktopの最小面高330px、Mobileの最小面高211px）。これは`BookShelfSection`に0冊を渡した場合にも適用される表示契約ですが、実際のBook List `/` の0冊状態を意味しません。現在はトップページが0冊時に`BookShelfSection`を経由せず、空状態メッセージを表示します。

`BookShelfSection`は、見出し、冊数、`BookCard`の一覧を組み合わせるPatternです。登録冊数から必要な行数を決め、棚本体をその行数に合わせて表示します。Desktopは1行6冊、Mobileは1行2冊、棚コンテナが320px以下では1行1冊です。行の高さはカードのタイトル・著者の自然な折返しに追従します。

## 書影・クリック領域

`BookCard`は1冊1つの詳細リンクであり、書影・書名・著者を表示します。リンクは1つのTab stopを持ち、書名をaccessible name、著者をaccessible descriptionとして関連付けます。書名は常時表示し、tooltipによる重複表示は行いません。

Rest / Hover / Focus / Pressedの各状態でカードのgeometry、行高、文字の流れ、配置を変えません。Hoverで新しい情報を出さず、`focus-visible`では3pxの外側accent outlineを表示します。BookCardは棚のgrid cell全体をリンクにせず、書影とidentityを含むカード面だけをリンク領域とします。route-changing Linkのクリック後にフォーカスを復元する契約は定義しません。

`BookCover`は書影画像または画像未取得時の代替表示を担います。shelf variantの最大枠はDesktopで幅110px・高さ170px、Mobileで幅78px・高さ121px（320px以下では幅82px・高さ127px）です。固有比率を維持して最大枠内に収め、BookCard内ではdecorativeとして扱います。画像未取得時はISBNやStack Libraryの装飾を表示せず、`書影なし`を表示します。

## PC/SP・Light/Dark仕様

ページレベルの境界は1024pxです。Desktopは1024px以上、Mobile（SP）は1024px未満とします。

### Desktop（`>=1024px`）

- 棚はflat surfaceと18pxのrailで構成する。
- gridは6列、列間gapは16pxとする。
- 行の最小高さは330pxで、タイトル・著者の自然な高さに追従する。
- 書影の最大枠は110×170px、カードの状態変化で位置を移動しない。

### Mobile（`<1024px`）

- gridは2列、列間gapは6pxとする。320px以下の棚コンテナでは1列に切り替える。
- 行の高さは固定せず、タイトル・著者の自然な折返しを含む最も高いカードに合わせる。
- 各行の下端に高さ18pxのrailを置く。
- 書影の最大枠は78×121px（320px以下では82×127px）。
- Desktopと同じ書影・書名・著者・リンク責務を維持し、tooltipは表示しない。

テーマ差は現実装にある範囲だけを記録します。デスクトップ専用のdarknight差分など、実装にないテーマ別差分は追加しません。Light / Darkの切り替えは共通のglobal themeで行い、棚の構造や行数規則は変えません。

## コンポーネント責務

| Component | 層 | 責務 |
|---|---|---|
| `BookShelf` | Layout | 空の1段分のflatな棚面・18px railと子要素の収納面だけを提供する。データ、見出し、リンクを持たず、空状態でもDesktop最小330px／Mobile最小211pxの面を保つ。 |
| `BookShelfSection` | Section / Pattern | 「蔵書一覧」、冊数、冊数に応じた棚行、`BookCard`一覧を組み合わせる。 |
| `BookCard` | Card / Composite | 1冊分の書影・書名・著者とBook Detailへの1リンクを提供する。書誌情報は表示しない。 |
| `BookCover` | Common / Primitive | 画像のURL・固有寸法を使った書影表示と、shelf variantの`書影なし`代替表示を提供する。 |

Atomic Designは表示上の名前ではなく依存方向として扱います。`BookShelfSection`が`BookShelf`と`BookCard`を組み合わせ、`BookCard`が`BookCover`を利用します。App Routerの実データ取得と画面統合は、これらの再利用責務の外側に置きます。

## Storybook検証面

Storybookはglobal themeのLight / Darkと、desktop / tablet / mobile viewportで確認します。棚にmicroCMSを接続せず、`Book`型に準拠したfixtureを使います。

| Storybook title | 代表Story・確認内容 |
|---|---|
| `Components/Section/BookShelfSection` | `Default`、`LongJapaneseTitles`、`Narrow320`。見出し・冊数・棚本体・Hybrid一覧、6/2/1列と可変行高を確認する。 |
| `Components/Card/BookCard` | `CoverAvailable`、`CoverUnavailable`、`Hover`、`Focus`、`LongJapaneseTitle`。書影・書名・著者の1リンク、状態geometry、長い書名、画像未取得を確認する。 |
| `Components/Common/BookCover` | `Placeholder`、`DecorativePlaceholder`、`ShelfDecorativePlaceholder`。detailの既存代替表示とshelfの`書影なし`・decorative挙動を確認する。 |

`Hover`はpointer hoverの検証面、`Focus`はリンクのfocus取得を確認する検証面です。Storyは実ブラウザのTab順、200%ズーム、全viewportの視覚parityを単独では保証しません。`LongJapaneseTitles`、可変行高、6/2/1列、長い日本語の書名・著者、missing coverは対象viewportでの確認対象または手動確認とします。

## 確定事項と非対象

確定事項は、本棚を蔵書の視認面として扱い、書影・書名・著者をHybridで表示すること、`BookShelf`をflatな棚面として分離すること、`BookShelfSection`が行数と組み合わせを担うこと、Desktop6冊/行・Mobile2冊/行・320px以下1冊/行、18px rail、可変行高、1リンク/1Tab stop、Light / Darkのsemantic themeです。

本書の非対象は、Header・Page Intro・見出し文言・冊数、出版社・状態などDetail-only情報、サイドバー、状態別独立ページ、書影の固定比率化、BookCard全cellリンク、routing変更、Figmaの作成・編集です。

## 証拠と更新条件

実装基盤の挙動証拠は、移動前の実装基盤を含むcommit `3ded409af6b443493400e9cfcc101d8541889b57`（`feat(shelf): 本棚と書影表示の基盤を整備`）およびその時点の棚規則・Storybook storiesです。このcommitは移動前の実装基盤の挙動を示す履歴証拠であり、現在の作業ツリーで移動後に更新された物理パスをこのcommitに含まれるものとして扱いません。現在の作業ツリーにおける対応先は `src/components/layout/BookShelf.tsx`、`src/components/section/BookShelfSection.tsx`、`src/components/card/BookCard.tsx`、`src/components/common/BookCover.tsx`、`src/app/page.tsx` などの更新済みconsumerです。トップページの0冊状態は`src/app/page.tsx`が直接扱います。Storyはリポジトリ直下の`stories/`へ分離し、文書のリンクとコンポーネント対応は [Component Traceability Registry](./COMPONENT_TRACEABILITY.md) で追跡します。

Issue #42のFigma targetは file `viM7iCMNvYu1146EufF2qN`、contract `910:183`、component set `895:2297`、cover `892:2`、shelf `897:14`、section `897:17`、Desktop Light/Dark `897:2287` / `900:63`、Mobile Light/Dark `897:2289` / `905:212`、320px `905:282`、200% `905:283`、focus `905:284`、missing cover `905:285`、interaction `920:2446`、annotations `921:211` です。page `884:2`とsection `884:3`は探索・比較コンテキストです。2026-09-08のfigma_design_qa PASS（findings none）により、current-node read-back、fresh screenshots、実装renderとのparityを`VERIFIED`とします。Desktop/Mobile Light/Dark、320px、200%、focus、interaction、missing coverを対象とし、最終renderではDesktop typical card `176×241`、long-title card `176×262`、cover `110×170`、shelf `1136×330`（`312+18`）、Mobile / narrow responsive resultsを確認しました。Header、Page Intro、見出し文言、冊数削除はparity対象外です。推測でFigmaのpropertiesやvariablesを補完しません。寸法、行数、責務、ルート契約を変更する場合は、ユーザーの再確認と実装・Storybookの再検証を必要とします。
