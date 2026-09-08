# Coding Guideline

Stack Libraryの実装で使うclass名、CSS、状態表現の規約です。アプリケーション所有のclassには`SL-`名前空間を付け、レイアウト・UI要素・状態の責務を名前から追跡できるようにします。

## 目的

本書は、画面やコンポーネントを追加するときの命名判断を揃え、CSSの責務とUIの意味を追いやすくするためのものです。

本書の準拠レベルは次の2段階です。

| レベル | 意味 |
|---|---|
| 必須 | 新規実装・変更時に守るルール |
| 推奨 | 既存構造や実装上の制約がない場合に採用するルール |

### 他の文書との関係

- [AGENTS.md](../AGENTS.md): 作業契約、MVPの制約、セキュリティ、所有範囲
- [Development](./DEVELOPMENT.md): Issue、ブランチ、PR、検証の進め方
- [Architecture](./ARCHITECTURE.md): 技術構成、責務分離、コンポーネントの境界
- 本書: class名、CSS、状態表現など、コードをどう書くか

他の文書と矛盾する場合は、上記のプロジェクト制約とアーキテクチャを優先します。

## 名前空間とclass命名

### Stack Library名前空間

**必須**

- Stack Libraryが所有するアプリケーションclassには、2〜3文字の大文字英字namespaceを付ける。
- 本プロジェクトのnamespaceは`SL-`（識別子`SL`）とする。namespaceの後ろに付く分類・block・element・modifierは小文字で記述する。
- 名前空間の後ろに、責務を示す分類を付ける。
- `is-*`、ARIA/native属性、`data-*`、外部ライブラリが要求するclass、Storybook専用の`storybook-*`は例外として扱う。

分類は次の2層を基本とします。

| 分類 | 形式 | 役割 | 例 |
|---|---|---|---|
| Layout | `.SL-ly_<block>` | 画面や領域の配置、面、構造 | `.SL-ly_grid` |
| UI element | `.SL-el_<block>` | 意味を持つ再利用可能なUI部品 | `.SL-el_book-card` |
| Utility | `.SL-ut_<name>` | 複数箇所で同じ技術的振る舞いを持つ補助class | `.SL-ut_visually-hidden` |

`ly_`は配置責務、`el_`はUIの意味と振る舞い、`ut_`は限定された技術的補助責務に使います。見た目の大きさやAtomic Designの粒度だけで分類を決めません。

記法は`namespace-分類_block__element`とし、namespace自体はこのプロダクト固有の`SL`とします。外部のclass名をそのまま流用せず、Stack Libraryの責務語彙で命名します。

### 記法

**必須**

- namespaceは2〜3文字の大文字英字、それ以外のclass名の基本語は小文字で記述する。
- namespaceと分類はハイフン、分類とblock名はアンダースコアで区切る。
- class名は見た目ではなく、UI上の役割・意味・所属を表す。
- Reactの`className`とCSSのセレクタには同じclass名を使う。
- block名に複数の単語を含める場合はハイフンでつなぐ。

```tsx
<a className="SL-el_book-card" href="/books/example">
  <span className="SL-el_book-card__identity">
    <span className="SL-el_book-card__title">書名</span>
    <span className="SL-el_book-card__authors">著者名</span>
  </span>
</a>
</a>
```

```css
.SL-el_book-card { /* block */ }
.SL-el_book-card__title { /* element */ }
.SL-el_book-card__authors { /* element */ }
```

### BlockとElementの構造

コンポーネント固有のclassは、namespace・分類・Block・Elementの順で表します。

| 種類 | 形式 | 役割 | 例 |
|---|---|---|---|
| Layout Block | `.SL-ly_<block>` | 独立した配置・構造単位 | `.SL-ly_grid` |
| UI Block | `.SL-el_<block>` | 独立したUI単位 | `.SL-el_book-card` |
| Element | `.block__element` | Block内部の意味のある部位 | `.SL-el_book-card__title` |
| Modifier | `.block-<modifier>` | Blockの表示variant | `.SL-el_book-cover-shelf` |

**必須**

- ElementはDOMの入れ子ではなく、Blockとの意味的な関係で命名する。
- `block__element__child`のようにElementを連結しない。
- Modifierは冗長な`--`を使わず、Blockの後ろを単一ハイフンで分離する。
- Element固有のvariantは`block__element-<modifier>`とし、Block全体のvariantと責務を混同しない。
- `.book-card a span`のようなDOM構造だけに依存するセレクタを新規追加しない。
- `.wrapper`、`.container`、`.item`などの汎用名は、namespaceと所属Blockなしでは使わない。

```txt
良い例:  .SL-ly_library-header__navigation
避ける:  .SL-ly_library-header__inner__navigation
良い例:  .SL-el_book-text-section__body
避ける:  .SL-el_big-blue-box
```

Blockとページ上の意味がそれぞれ独立している場合は、複数のBlock classを同じ要素へ付けても構いません。例えば`SL-ly_book-shelf`と`SL-el_book-catalog`は、棚の構造とカタログ領域の意味を別々に担います。単なる同義語を重ねる目的では使いません。

### Modifierと状態

**必須**

- 固定的な表示variantやレイアウト上の役割には、単一ハイフンのModifierを使う。
- 状態値やドメイン値をCSSで参照する場合は`data-*`属性を使う。
- HTMLやARIAに対応する意味がある場合は、classや`data-*`ではなくnative属性・ARIA属性を正本にする。

```tsx
<div className="SL-el_book-cover SL-el_book-cover-shelf" />
<span className="SL-el_status-badge" data-status="reading" />
<span className="SL-el_bank-value" data-unavailable />
```

使い分けの目安:

| 表現 | 用途 | 例 |
|---|---|---|
| Modifier | コンポーネントの表示variant | `SL-el_book-cover-detail` |
| Modifier | Element固有の表示variant | `SL-el_theme-switch__button-light` |
| Modifier | 純粋な視覚状態 | `SL-ly_scroll-context-visible` |
| `.is-*` | 一時的・視覚的な状態hook。意味属性と併用 | `.is-active` |
| `data-*` | 状態・種別・ドメイン値 | `data-status="reading"` |
| `aria-*` / native属性 | 利用者に伝わる操作・意味 | `aria-pressed`, `disabled` |

`active`、`selected`、`disabled`、`hidden`など、HTMLやARIAで表現できる意味をclass名だけで伝えません。`.is-active`などの状態classを使う場合も、`aria-current`、`aria-pressed`、`aria-selected`、native属性、または適切な`data-*`を同じ状態の正本として併用します。`.is-*`をドメイン値やデータの状態表現には使いません。

Themeや画面幅をclass名で表現しません。テーマは`html[data-theme]`、レスポンシブはmedia queryまたはcontainer queryで扱います。`is-active`以外の状態classを増やす場合も、同じ意味の既存属性で表現できないことを確認します。

```txt
避ける: .SL-el_book-card-mobile
避ける: .SL-ly_page-dark
避ける: .SL-el_button.is-active だけで選択状態を表す
```

## 共通classと語彙

### 共通class

複数のコンポーネントで同じ意味・同じ振る舞いを持つ場合だけ、Blockに属さないsemantic classを使います。アプリケーション所有の共通classは、UIの意味を持つものを`SL-el_`、技術的な補助だけを担うものを`SL-ut_`へ置きます。

```txt
.SL-el_text-link
.SL-el_message-state
.SL-ut_visually-hidden
```

単一コンポーネントでしか使わない部位は、共通classにせず所属BlockのElementにします。共通classとして維持する場合は、共有範囲と責務を本書またはComponent Contractへ記録します。

既存の共通classがあることだけを理由に、似た意味の新しい共通classを増やしません。共有範囲や責務が変わる場合は、既存classの利用箇所を確認してから命名します。`is-*`は状態hook、`SL-ut_`は技術的utilityとして役割を混同しません。

### 推奨する語彙

同じ役割へ異なる単語を増やさないため、次の語彙を優先します。

| 語彙 | 用途 |
|---|---|
| `inner` | 外側のBlock内にある内側の配置領域 |
| `surface` | 背景・境界を持つ連続した面 |
| `wrapper` | 配置や余白をまとめる構造上のラップ |
| `heading` | 見出しと見出し周辺の領域 |
| `body` | 主要な本文領域 |
| `meta` | 補助的な書誌情報・メタデータ |
| `record` | 1件の書誌・記録情報のまとまり |
| `summary` | 集計や要約値のまとまり |
| `message` | 空状態、エラー、注意などの説明領域 |
| `image` | 画像本体 |
| `placeholder` | 画像や値がない場合の代替表示 |

**推奨**

- `title`は実際のタイトル文字列を指す場合に使い、見出し領域には`heading`を使う。
- `text`、`content`、`data`など意味が広すぎる語は、必要なら対象を具体化する。
- `img`、`btn`、`desc`のような略語は、既存の語彙や外部APIとの対応が必要な場合を除いて使わない。
- `blue`、`large`、`left`、`margin-top-4`のような見た目やユーティリティをclass名の基本語彙にしない。

## CSSの書き方

### セレクタ

**必須**

- グローバルなリセット・要素の基本スタイルを除き、Blockを起点にして記述する。
- class名の責務が分かるよう、セレクタのネストを浅く保つ。
- 色、余白、罫線、フォントなどの共通値はsemantic CSS variableを使う。
- コンポーネント固有の計算値は、そのコンポーネントのcustom propertyとして閉じ込める。

```css
.SL-el_book-cover {
  background: var(--color-surface);
}

.SL-el_book-cover__image {
  display: block;
}

.SL-el_book-cover-detail {
  width: var(--cover-inline-wide);
}
```

**避ける**

```css
/* DOM構造と見た目に強く依存する */
.book-card > div > a > span { }

/* テーマ値をclass名へ埋め込む */
.dark-blue-card { }

/* 任意のページだけに効く汎用class */
.mt-24 { }
```

### Themeとresponsive

- Light / Darkでclass名やDOMを分けない。
- テーマ差分はsemantic CSS variableを`html[data-theme]`で切り替える。
- Desktop / Mobileで別のDOMや専用Componentを作らない。
- 画面の境界は既存の1024pxを使い、狭いComponent内の調整はcontainer queryを使う。

この方針により、`.dark`、`.mobile`、`.desktop`のような実装詳細のclassを増やしません。

### CSSの配置

現行MVPの共有CSSは`src/app/globals.css`を正本とします。Storybookの表示面だけに必要なclassは`stories/storybook.css`へ置き、アプリのclassをStory専用の都合で変更しません。

## Storybook専用class

Storyのレイアウトや検証用のラップには`storybook-`を付けます。これはアプリケーションclassとは別のStorybook専用namespaceです。新しいStorybook classのModifierも単一ハイフンで分離します。

```txt
.storybook-canvas
.storybook-canvas-component
.storybook-color-block
```

Storybook専用classをアプリのUIへ渡したり、アプリのコンポーネントclassをStoryのレイアウト用途へ流用したりしません。

## 変更時のルール

**必須**

1. 追加前に、同じ責務の既存Block・共通class・語彙を検索する。
2. 新しいclassは、namespace、分類、Block、Element、Modifier、`data-*`のどれに該当するか決める。
3. 再利用コンポーネントのclassを変更した場合は、対応するStoryと必要な状態を確認する。
4. class名だけの変更でも、CSS、JSX、Story、ドキュメントの参照を同時に更新する。
5. 既存classの一括renameは、命名規約の導入だけを理由に行わない。必要になった場合は、CSS、JSX、Story、Figma/traceabilityへの影響と互換性を確認できる別Issueまたは明示されたmigration scopeで扱う。

新しい語彙や例外を追加する場合は、本書の語彙表と理由も同じ変更で更新します。

## Review checklist

- [ ] アプリケーション所有classに2〜3文字の大文字英字namespace（本プロジェクトでは`SL-`）と適切な`ly_`/`el_`/`ut_`分類があるか
- [ ] Block名は小文字のkebab-caseか
- [ ] Blockの所属とElementの責務が明確か
- [ ] Modifierは単一ハイフンで、`.is-*`、`data-*`、ARIA/native属性の使い分けは適切か
- [ ] 見た目だけの名前や汎用名を新設していないか
- [ ] DOMの深いネストに依存していないか
- [ ] Themeやresponsive専用のclassを増やしていないか
- [ ] Storybook専用classに`storybook-`が付いているか
- [ ] 現行のArchitecture、アクセシビリティ方針と矛盾していないか

## 現行classの移行境界

今回の名前空間導入は、既存classの一括renameを意味しません。既存classは利用箇所と互換性を確認し、コンポーネントの変更や明示的なmigration Issueに合わせて段階的に移行します。

| 分類 | 現行の代表例 | 判定 | 扱い |
|---|---|---|---|
| 意味のあるBlock/Element | `library-header__navigation`、`book-text-section__body`、既存の`book-cover*` | Preserve | 責務と参照を維持し、無関係なrenameはしない。Issue #42ではBookCard・棚・カタログの対象classを`SL-`へ移行した |
| 状態を属性で表す設計 | `status-badge` + `data-status`、`library-header` + `data-variant` | Preserve | 属性を状態の正本として維持する。class名の移行は別途判断する |
| 複数箇所で共有するsemantic class | `text-link`、`message-state` | Defer | 共通責務を維持し、変更時に`SL-`名前空間へのmigrationを検討する |
| 単一箇所の未名前空間class | `empty-state`、`back-navigation`、`favorite-badge`、`bank-value`、`back-arrow`、`leading-icon-slot` | Defer | 所属BlockのElementまたは`SL-el_`/`SL-ut_`へ移行するIssueで扱う。`data-*`の状態契約は維持する |
| 旧Modifier記法 | `book-cover--shelf`、`theme-switch__button--light`、`storybook-canvas--component` | Defer | 新規では使わず、参照を一体で更新できるmigration scopeで変更する |

Issue #42のBook List Hybridでは、次の対象classを一体で移行した。`SL-el_book-card`、`SL-el_book-card__identity`、`SL-el_book-card__title`、`SL-el_book-card__authors`、`SL-ly_book-shelf`、`SL-ly_book-shelf__surface`、`SL-el_book-catalog`、`SL-el_book-catalog__heading`、`SL-el_book-catalog__count`、`SL-el_book-catalog__grid`、`SL-el_book-catalog__item`。既存共有の`book-cover*` classと、detail / context variantの契約はこのIssueでは移行しない。新しいglobal token・utility・theme/mobile専用classは追加せず、responsiveはmedia queryと`book-shelf` container query、状態はnative linkと`:focus-visible`で表現する。

`Preserve`は現行コードが新規規約に完全準拠しているという意味ではありません。既存利用の破壊を避けるための判断です。新規classと変更対象のclassは、上記の新規規約へ従います。

## 改訂履歴

| 日付 | 内容 |
|---|---|
| 2026-09-02 | 初版作成 |
| 2026-09-03 | Stack Library名前空間、分類、単一ハイフンModifier、状態表現、既存classの移行境界を追加 |
| 2026-09-03 | namespaceを2〜3文字の大文字英字に制限し、Stack Libraryでは`SL-`を採用 |
| 2026-09-08 | Issue #42 Book List Hybridの対象class移行、自然な折返し、container query、状態表現を追記 |
