# Component Traceability Registry — FROZEN_REFERENCE

Stack Libraryの再利用コンポーネントについて、過去のFigma・React・Storybook・検証状態を保持する歴史的台帳です。これは現在のvisual authorityではなく、承認済みWireframeとreplacement contractが確定するまでrefresh/extendしてはいけません。authority orderは[AGENTS.md](../AGENTS.md)に従います。初期4部品に加えて、本棚・書影設計で確定した `BookShelf`、`BookShelfSection`、`BookCard`、`BookCover`を対象とします。

## Authority and evidence

- Contract revision: Issue #42 / `I42-CC-2026-09-08.1`
- Figma file: `viM7iCMNvYu1146EufF2qN`
- Figma source: [Common / 共通部品カタログ](https://www.figma.com/design/viM7iCMNvYu1146EufF2qN/stack-library?node-id=749-384)
- Implementation history: [PR #16](https://github.com/MEGURABBIT1110/stack-library/pull/16)
- Fresh Figma screenshot status: unrelated historical rows `PENDING`（PR #16の既存read-back記録は参照証拠として保持）。Issue #42 rows are `VERIFIED` below.
- Issue #42 Figma target: contract `910:183`; component set `895:2297`; page `884:2` / section `884:3`
- Issue #42 Design Contract: `I42-DC-2026-09-07.2`

`PENDING`の項目は、Issue #42以外のhistorical rowsにおける未確認を意味します。Issue #42 rowsは2026-09-08のfinal QA evidenceにより`VERIFIED`です。既存PRの記録だけで、未検証のhistorical rowsについて現在のFigma構造が維持されているとは断定しません。

## Registry

| Component | Responsibility / layer | Figma main / specimen | React export / path | Storybook title / stories | States and accessibility | Responsive / lifecycle | Evidence / status |
|---|---|---|---|---|---|---|---|
| ThemeSwitch | Light / Darkテーマを選択するPrimitive | Main `256:13` / specimen `750:110` | `ThemeSwitch` / `src/components/common/ThemeSwitch.tsx` | `Components/Common/ThemeSwitch` / `Default` | Native `button` 2個、`aria-label`、`aria-pressed`、44×44操作、キーボード操作 | 100×52の固定操作面。Reuse。テーマ変更とlocalStorage永続化を担当 | PR #16 read-back・Story確認済み。fresh screenshot `PENDING` |
| Heading | 文書構造の見出しlevelと視覚scaleを分離するPrimitive | Main `663:247` / specimen `750:117` | `Heading` / `src/components/common/Heading.tsx` | `Components/Common/Heading` / `Default`, `ScaleGuide` | `as`でnative headingを選び、`scale`は視覚値だけを担う。見出し階層を保持 | 長い日本語は`overflow-wrap`でreflow。Reuse。汎用見出しの正規export | PR #16 read-back・Story確認済み。fresh screenshot `PENDING` |
| StatusBadge | 読書状態を日本語ラベルとsignalで示すPrimitive | Main `257:17` / specimen `750:148` | `StatusBadge` / `src/components/common/StatusBadge.tsx` | `Components/Common/StatusBadge` / `Reading`, `AllReadingStates` | 5状態、テキストラベルとsignalを併用し、色だけに依存しない | Light / Darkでsemantic colorを切替。Extend済み。状態定義は`lib/books/labels.ts`に従う | PR #16 read-back・Story確認済み。fresh screenshot `PENDING` |
| TechnicalAreaTags | 技術分野を中立的な複数タグで示すPrimitive | Main `258:12` / specimen `750:165` | `TechnicalAreaTags` / `src/components/common/TechnicalAreaTags.tsx` | `Components/Common/TechnicalAreaTags` / `Default`, `Wrapped`, `Empty` | `ul`と`aria-label`で分野を伝達。色分けに依存しない。空配列は非表示 | `max-content`、26px高、複数時wrap。Reuse。分類語彙は`lib/books/labels.ts`に従う | PR #16 read-back・Story確認済み。fresh screenshot `PENDING` |
| BookShelf | Flatな棚面と18px railを提供するLayout | node `897:14` | `BookShelf` / `src/components/layout/BookShelf.tsx` | `Components/Layout/BookShelf` / `Default` | データ、見出し、リンクを持たない。空でも最低1行分の面を提供 | CSS-only variable-height row。空状態の最小面高はDesktop330px / Mobile211px。Light / Darkはsemantic theme | Issue #42 Figma read-back・render parity `VERIFIED`（2026-09-08） |
| BookShelfSection | 見出し・冊数・棚行・Hybrid一覧を組み合わせるPattern | node `897:17` | `BookShelfSection` / `src/components/section/BookShelfSection.tsx` | `Components/Section/BookShelfSection` / `Default`, `LongJapaneseTitles`, `Narrow320` | `h1 蔵書一覧`、冊数、`aria-labelledby`、`ul / li`、`aria-label="技術書の一覧"` | Desktop 6冊/行、Mobile 2冊/行、320px以下1冊/行 | Issue #42 Figma read-back・render parity `VERIFIED`（2026-09-08） |
| BookCard | 書影・書名・著者を1リンクで詳細へ結ぶCard / Composite | set `895:2297` | `BookCard` / `src/components/card/BookCard.tsx` | `Components/Card/BookCard` / `CoverAvailable`, `CoverUnavailable`, `Hover`, `Focus`, `LongJapaneseTitle` | 1 link / 1 Tab stop。書名をaccessible name、著者をdescription。tooltipなし。visible focus、pressed geometry固定 | Desktop 6列、Mobile 2列、自然なwrap。新public props / exportなし | Issue #42 Figma read-back・render parity `VERIFIED`（2026-09-08） |
| BookCover | 固有比率を維持する書影表示とshelf代替表示 | node `892:2` | `BookCover` / `src/components/common/BookCover.tsx` | `Components/Common/BookCover` / `Placeholder`, `DecorativePlaceholder`, `ShelfDecorativePlaceholder` | shelfではdecorative。画像未取得時は`書影なし`、ISBNを表示しない。detail / contextは既存責務 | shelf最大枠 Desktop 110×170px、Mobile 78×121px。追加情報や浮遊表現なし | Issue #42 Figma read-back・render parity `VERIFIED`（2026-09-08） |

### Issue #42 frozen Figma node map

| Target | Node |
|---|---|
| Design Contract | `910:183` |
| Component set | `895:2297` |
| Book Cover | `892:2` |
| Shelf | `897:14` |
| Shelf Section | `897:17` |
| Desktop Light / Dark | `897:2287` / `900:63` |
| Mobile Light / Dark | `897:2289` / `905:212` |
| 320px / 200% | `905:282` / `905:283` |
| Focus / Missing cover | `905:284` / `905:285` |
| Interaction / Annotations | `920:2446` / `921:211` |

### Figma evidence fields

The registry deliberately separates historical implementation evidence from current Figma evidence. For unrelated historical rows, the following fields remain explicit until their assigned Figma evidence is refreshed; Issue #42 is the verified exception recorded above:

- Properties: unrelated historical rows `PENDING` (the exact current property set is not asserted from historical evidence).
- Variables: unrelated historical rows `PENDING` (the exact current variable bindings are not asserted from historical evidence).
- Intentional platform differences: unrelated historical rows `PENDING` (no current platform-specific difference is inferred).
- Last verified / evidence revision: unrelated historical rows retain PR #16 read-back at head `1a00283288e88f36444bade4084705df91f69274`; Issue #42 current-node read-back, fresh screenshots, and runtime render parity are `VERIFIED` on 2026-09-08.

These fields must be replaced only by a fresh read-back from the assigned Figma node for the relevant row; `UNKNOWN` or `PENDING` is preferred to an inferred value. This rule does not downgrade the verified Issue #42 evidence.

## Historical change record (not an active protocol)

以下は過去の台帳更新手順を保持する参考記録であり、現在の更新手順ではありません。承認済みWireframeとreplacement contractが確定するまでは、この台帳をrefresh/extendしてはいけません。将来の更新は、[AGENTS.md](../AGENTS.md)のauthority contract、割り当てられたexact target、承認済みのreplacement contractに従う場合だけ許可します。

1. Issueと対象Figma nodeのrevisionを凍結する。
2. React export、Storybook title、代表Story、公開状態、アクセシビリティ契約を更新する。
3. Figma main componentとspecimenのread-back、必要なfresh screenshotを取得する。
4. Storyまたはinteraction evidenceと、変更したtheme・viewport・状態を記録する。
5. `unknown`、`blocker`、意図的なplatform差を推測で埋めずに残す。

### Historical ownership record

- `documentation_writer` owns the registry row, path, Storybook locator, lifecycle, and evidence-status updates.
- `component_implementer` reports React export, Story, state, interaction, and accessibility changes to the registry owner before handoff.
- `figma_designer` or `figma_design_qa` owns current-node properties, variables, read-back, and fresh screenshot evidence when Figma work is authorized.
- The registry remains `PENDING` for unrelated rows while required Figma evidence is unavailable; Issue #42 rows are `VERIFIED` against the final QA evidence below.

## Known gaps

- Issue #42のFigma current-node read-back、fresh screenshots、実装renderとのparityは `figma_design_qa` PASS（findings none）により2026-09-08に`VERIFIED`。対象はDesktop/Mobile Light/Dark、320px、200%、focus、interaction、missing cover。
- Issue #42 final evidence: Desktop typical card `176×241`、long-title card `176×262`、cover `110×170`、shelf `1136×330`（`312+18`）、Mobile / narrow responsive resultsを確認。Header、Page Intro、見出し文言、冊数削除はparity対象外。
- 本棚・書影の設計判断、寸法、Storybook検証面は [本棚・書影設計（歴史的FROZEN_REFERENCE）](./DESIGN.md) を参照する。これは現在のvisual authorityではなく、current visual authorityは[AGENTS.md](../AGENTS.md)と承認済みWireframeに従う。Issue #42のexact nodeは上記node mapで追跡し、propertiesやvariablesは推測で補完しない。
- Figma nodeの移転・削除が判明した場合は、旧IDを再利用せず、新しいexact assignmentを受けてから更新する。
