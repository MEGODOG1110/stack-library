# Phase 1 Audit

**Status:** reviewed, publication pending（レビュー済み・公開待ち）
**Baseline SHA:** `d56d9236175fe233744ab34d13fd6c39586e0356`
**Linear parent:** [MEG-11](https://linear.app/megu-workspace/issue/MEG-11)
**Child work:** [MEG-12](https://linear.app/megu-workspace/issue/MEG-12), [MEG-13](https://linear.app/megu-workspace/issue/MEG-13), [MEG-14](https://linear.app/megu-workspace/issue/MEG-14), [MEG-15](https://linear.app/megu-workspace/issue/MEG-15), [MEG-16](https://linear.app/megu-workspace/issue/MEG-16)

Previous publication evidence is stale; this classification correction invalidates prior approval and test conclusions until review is repeated.

この文書はPhase 1の統合成果物です。対象はbaseline SHA時点のtracked file 134件であり、Phase 1では削除・移動・Figma/Linear/GitHub mutationを行いません。旧Figma記録と過去の`VERIFIED`表記はhistorical evidenceであり、現在のvisual authorityではありません。権限順序は、current user instruction → frozen Linear Issue → approved Rough → recorded Reference decisions → approved Wireframeです。未承認の見た目変更は、current behaviorの調査を除き停止します。

## Audit boundary and execution model

- baseline/schema確認を最初に行い、tracked fileの正確な集合と分類枠を凍結する。
- read-only lane Aはauthority・docs・agent/config、lane Bはruntime・data・types、lane CはUI・Story・CSS・assetsを調査する。
- lane間でtracked fileを書かず、分類の衝突は全lane完了後にdocumentation_writerが順次reconcileする。
- Phase 1のwriterはこの監査文書とREADMEのリンクだけを所有する。product/app/UI/Figma/data/package/lock/config/TOMLは変更しない。

## Classification contract

| 分類 | 意味 |
|---|---|
| **Keep** | 現行の正本、境界、契約、runtime/dataの安全性を保持する。 |
| **Hold** | 参考資料・fixture・検証証拠として保持するが、現行visual authorityや新規仕様には使わない。 |
| **Replace candidate** | reset intentとdisplay-layer couplingが確認できるため、Phase 2以降で置換を検討する。保護されたroute/data/accessibility/interaction behaviorは先に契約化する。 |
| **Remove candidate** | 現行consumerがなく、旧provenanceだけが残るため削除候補。ただし承認と後続Phaseまでは削除しない。 |

各行または同一根拠のグループは、exact path/group、current role/consumer、authority/source、evidence/rationale、dependency/impact、next owner/decision、confidenceを必ず持つ。「既存だから」はrationaleにならない。

## Findings by deterministic group

### Governance, workflow, and configuration — Keep

`.codex/config.toml`、30 agent TOML、`.github/ISSUE_TEMPLATE/config.yml`、`.github/ISSUE_TEMPLATE/task.yml`、`AGENTS.md`、`README.md`、`.gitignore`、`.oxlintrc.json`、`cspell.json`、`package.json`、`package-lock.json`、`next.config.ts`、`tsconfig.json`、`vitest.config.ts`、`next-env.d.ts`、`.storybook/main.ts`、`.storybook/preview.tsx`は、role activation、Linear/Git境界、MVP identity、tooling、build/type/runtime設定の正本または再現に必要なためKeepとする。authorityは各ファイルの既存契約とAGENTS.mdである。consumerはCodex実行、開発者、Next.js/TypeScript/Storybook/Vitestであり、変更は各ownerのレビューが必要。**owner/decision:** development_leadと該当role owner、confidence High。

### Canonical project documents — Keep

- `docs/AGENT_ORGANIZATION.md`: roleはorganization/ownership authority、sourceはAGENTS.mdとfrozen Linear Issue、evidenceは現行のactivation/ownership記録。dependency/impactはwriter競合と権限逸脱を防ぐこと。**next owner/decision:** development_leadがrole ledgerを更新、confidence High。
- `docs/ARCHITECTURE.md`: roleはcomponent/software/data boundaryの契約、sourceはAGENTS.mdと実装構造、evidenceは現行route/component mapping。dependency/impactは安全なruntime境界を保つこと。visual claimsはFROZEN_REFERENCEとauthority orderに従い、Keep判定は非視覚的contractに限る。**next owner/decision:** software_architectが境界を再確認、confidence High。
- `docs/CODING_GUIDELINE.md`: roleはmigration、命名、CSS/stateの変更契約、sourceはAGENTS.mdと既存コード規約、evidenceはtracked implementation patterns。dependency/impactは置換時の命名・state一貫性。visual claimsはFROZEN_REFERENCEとauthority orderに従う。**next owner/decision:** component_implementerがP2以降のmigration contractを提案、confidence Medium-High。
- `docs/CONTENT_MODEL.md`: roleはcontent/data contract、sourceはmicroCMS schemaと`src/types/book.ts`、evidenceはquery/normalization/fixture境界。dependency/impactはAPI shape、pagination、secret boundary、状態語彙の破壊を防ぐこと。**next owner/decision:** data_implementerがdata contractを維持、confidence High。
- `docs/DEVELOPMENT.md`: roleはworkflow、Git、handoff、validation、publication boundary、sourceはAGENTS.mdとfrozen Linear Issue、evidenceは現行のbranch/PR/check運用。dependency/impactは未承認mutationとstale headを防ぐこと。**next owner/decision:** development_leadがworkflowを管理、confidence High。
- `docs/ROUTING.md`: roleはroute、URL、static generation、sourceはApp Router構造とAGENTS.md、evidenceは現行page/query mapping。dependency/impactはURL/data loading/not-found契約を保つこと。visual descriptionsはhistorical FROZEN_REFERENCEとしてのみ扱い、Keep判定は非視覚的routing contractに限る。**next owner/decision:** software_architectがroute contractを確認、confidence High。

`.github`はGitHub Issueを正本に戻すものではなく、templateを必要時のmirror/external collaborationとして保持する。GitHub IssueはLinearに明示同期された場合のみsecondary referenceである。

### Historical design references — Remove candidate

`docs/DESIGN.md`、`docs/COMPONENT_TRACEABILITY.md`、`docs/design/stack-library-wireframe.html`は過去のFigma/React/Storybook設計、寸法、node map、historical verificationを保持するRemove candidateである。clean-slate resetでは旧visual decisionが将来の作業を再び固定するため、current visual authorityとして使わない。P1はaudit-onlyなので物理削除せず、削除はP5まで延期する。**dependency/impact:** P5で削除する際はREADMEリンクとARCHITECTURE/ROUTING内の参照を同一変更で更新・除去し、broken linkを残さない。独立した非視覚的factsだけは正本文書へ先に保持し、旧visual decisionのarchive/copyは作らない。**next owner/decision:** user/development_leadがP5削除を承認し、exact path writerを後続packetで割り当てる。confidence High。

### Data and content boundary — Keep

`microcms/api-books-import.json`、`src/lib/books/bank.ts`、`src/lib/books/labels.ts`、`src/lib/books/normalize.ts`、`src/lib/books/queries.ts`、`src/lib/microcms/client.ts`、`src/types/book.ts`はKeep。current consumerはページ、Server-side queries、型、fixture/データ変換である。server-only/API secret boundary、normalization、pagination/all-content、`0`とmissing/unknown/unavailable/error/not-applicableの区別を保護し、visual resetで捨てない。**next owner/decision:** data_implementerとsoftware_architectがcontractを再確認。confidence High。

### Runtime and route surfaces — Replace candidate with protected contracts

`src/app/bank/page.tsx`、`src/app/books/[contentId]/page.tsx`、`src/app/globals.css`、`src/app/layout.tsx`、`src/app/not-found.tsx`、`src/app/page.tsx`は、current display-layer couplingとuser reset intentからReplace candidateとする。削除はPhase 1では行わない。**protected behavior:** `/`、`/books/[contentId]`、`/bank`のroute、data loading/query/error/0件表示、metadata、keyboard/focus、semantic status、theme/runtime boundary、not-found動作を先に記録する。`globals.css`は特にvisual tokens/layoutをReplace candidateとするが、focus、contrast、motion、responsive、state表現のbehavior contractは保持する。**authority/source:** frozen Linear IssueとP2以降の承認済み成果物のみが将来判断を許可する。**next owner/decision:** application_implementer、component_implementer、software_architectがP2でbehaviorと必要情報を整理する。confidence Medium-High。

### UI components — Replace candidate with behavior inventory

`src/components/card/BookCard.tsx`、`src/components/common/BookCover.tsx`、`src/components/common/Heading.tsx`、`src/components/common/StatusBadge.tsx`、`src/components/common/TechnicalAreaTags.tsx`、`src/components/common/ThemeSwitch.tsx`、`src/components/layout/AppShell.tsx`、`src/components/layout/BookShelf.tsx`、`src/components/layout/LibraryHeader.tsx`、`src/components/layout/ScrollContextBar.tsx`、`src/components/section/BookDetailIdentity.tsx`、`src/components/section/BookShelfSection.tsx`、`src/components/section/BookTextSection.tsx`、`src/components/section/ConnectionError.tsx`、`src/components/section/LibraryBank.tsx`はReplace candidate。現行のdisplay composition・CSS couplingがreset intentに直接関係するためである。**protected behavior:** props/data mapping、heading hierarchy、link/navigation、loading/error/empty states、ARIA/keyboard/focus、theme state、content order、interaction outcomesをcomponent contractとして保持する。**next owner/decision:** component_implementerがdependency inventoryを作り、figma_designerはapproved exact targetが割り当てられた場合だけvisual authorityを供給。confidence Medium。

### Stories and cover fixtures — Hold

`stories/components/card/BookCard.stories.tsx`、`stories/components/common/BookCover.stories.tsx`、`stories/components/common/Heading.stories.tsx`、`stories/components/common/StatusBadge.stories.tsx`、`stories/components/common/TechnicalAreaTags.stories.tsx`、`stories/components/common/ThemeSwitch.stories.tsx`、`stories/components/layout/BookShelf.stories.tsx`、`stories/components/layout/LibraryHeader.stories.tsx`、`stories/components/layout/ScrollContextBar.stories.tsx`、`stories/components/section/BookDetailIdentity.stories.tsx`、`stories/components/section/BookShelfSection.stories.tsx`、`stories/components/section/ConnectionError.stories.tsx`、`stories/components/section/LibraryBank.stories.tsx`、`stories/fixtures/books.ts`、`stories/foundations/color.mdx`、`stories/storybook.css`はHold。Storybook browserのevidence/fixturesであり、future visual authorityではない。**consumer:** Storybookと13 story files/39 tests。**next owner/decision:** test_engineerとcomponent_implementerがprotected interaction/accessibility contractを抽出。confidence High。

### Public assets

`public/icon-dark.svg`、`public/icon-light.svg`、`public/ogp-center-stage.png`はKeep。`src/app/layout.tsx`のmetadata/brand参照と`src/components/common/ThemeSwitch.tsx`のtheme icon参照があるためである。**owner/decision:** application_implementerがdirect referenceを維持。confidence High。

`public/assets/covers/book-01.jpg`、`book-02.jpg`、`book-03.jpg`、`book-04.jpg`、`book-05.jpg`、`book-06.jpg`、`book-07.jpg`、`book-08.jpg`、`book-09.jpg`、`book-10.jpg`、`book-11.jpg`、`book-12.jpg`、`book-13.jpg`、`book-14.jpg`はHold。Storiesのcover refsとold wireframe evidenceが根拠であり、visual resetで即時削除しない。**next owner/decision:** data_implementerがfixture/evidence契約を確認。confidence Medium-High。

`public/assets/shelf/bg_cafe@2x.png`、`bg_cherry@2x.png`、`bg_craftwork@2x.png`、`bg_custom@2x.png`、`bg_darknight@2x.png`、`bg_grafitti@2x.png`、`bg_kids@2x.png`、`bg_maple@2x.png`、`bg_premium01@2x.png`、`bg_premium02@2x.png`、`bg_spider@2x.png`、`bg_stationery@2x.png`、`bg_walnut@2x.png`、`maple_center.png`、`maple_left.png`、`maple_right.png`、`maple_shadow_left.png`、`maple_shadow_right.png`はHold。raw reusable assetsとして物理保持するが、old wireframe provenanceのみであり、現行visual authorityではない。後続のRough/Reference/Wireframeが独立に採用した場合だけ再利用でき、既存ファイルの存在自体はdesign requirementではない。**next owner/decision:** user/development_leadが再利用または保持方針を承認し、release_managerはpublicationのみ。confidence Medium。

## Dependency graph and sequence

```text
P1 Audit
  -> P2 Rough (4画面の主操作・必須情報・遷移・状態、装飾なし)
  -> P3 Reference (Rough起点でAdopt/Adapt/Reject)
  -> P4 Wireframe + Element Manifest
  -> P5 Reset (Element Manifestから逆算削除)
  -> P6 Rebuild
  -> P7 Re-extract
```

P1はbaselineを読むだけで、visual implementationを変更しない。P2は4画面の主操作、必須情報、遷移、状態を装飾なしで作成するラフ工程であり、visual implementationを禁止する。P3はP2 Roughを起点に外部ReferenceをAdopt/Adapt/Rejectし、P4でWireframeとElement Manifestを承認する。承認済みWireframeがP4の完了条件であり、P5以降のvisual mutation gateとなる。P5はElement Manifestから逆算してReplace/Removeを実行判断し、P6でrebuild、P7で再抽出する。

## High-risk findings and unresolved decisions

- 現行UIはvisual layerとroute/data/interaction/accessibilityが同じ実装単位に結合しているため、P2 Rough作成前にbehavior contractが必要。
- `globals.css`のReplace candidate判定はvisual resetに限定し、focus、contrast、state、responsive、motionの保護を解除しない。
- 旧Figmaの寸法・node・`VERIFIED` claimsはhistorical evidenceであり、新しいexact targetの割当がない限り仕様として再利用できない。
- shelf assetsはraw reusable assetsとしてHoldし、old wireframe provenance以外のauthorityを持たない。Rough/Reference/Wireframeの独立採用なしに再利用せず、coversはStories refsとold wireframe evidenceとして保持する。
- 現行のdata normalization、pagination/all-content、server-only secret boundary、0とmissing等の状態語彙を新UIへどう公開するかはPhase 2 decision。
- `public/icon-*`、OGP、route metadataの保持範囲と新visual systemの接続は未決定。
- retired skill residueは0。replacement skillは作成しない。

## Asset Decision Matrix

| Asset group | Classification | Current role/consumer | Evidence/rationale | Next owner/decision |
|---|---|---|---|---|
| `public/assets/covers/**` (14) | Hold | Stories cover refs、old wireframe evidence | fixture/evidenceとして参照可能 | data_implementer: consumer確認 |
| `public/assets/shelf/**` (18) | Hold | raw reusable assets、現行runtime/Story consumerなし | old wireframe-only provenance。後続成果物の独立採用がなければdesign requirementではない | user/development_lead: reuse/retention decision; release_manager: publication only |
| `public/icon-dark.svg`, `icon-light.svg` | Keep | `src/app/layout.tsx`、`src/components/common/ThemeSwitch.tsx` | direct icon refs | application_implementer: ref維持 |
| `public/ogp-center-stage.png` | Keep | `src/app/layout.tsx` | direct metadata/OGP ref | application_implementer: ref維持 |
| `docs/design/stack-library-wireframe.html` | Remove candidate | historical visual evidence | clean-slate resetで旧visual decisionを再アンカーしない。P1では保持、P5で削除 | user/development_lead: deletion approval; exact writer later |

## Baseline evidence

- lint: **PASS**、既存warning 2件（ThemeSwitch role group semantic suggestion、LibraryBank role status/output suggestion）。
- Storybook browser: **PASS**、13 story files / 39 tests。
- standalone unit/integration tests: なし。
- build: read-only scopeと`.next/env` dependencyのため未実行。
- CI workflow: なし。
- cspell: script接続なし。
- tracked contamination: なし。

## Phase 2 entry gate

Phase 2へ進める条件は、(1) MEG-11のfrozen revisionが一致、(2) 134件のcoverageと分類にunclassified/overlapがない、(3) protected route/data/accessibility/interaction contractがowner付きで記録済み、(4) unresolved decisionsとstop lineが記録済み、(5) P2のLinear scope、owner、non-goalsが凍結済み、(6) visual implementation禁止とP4 Wireframe approval gateが明記されている、である。approved Rough、Reference decisions、approved WireframeはP2開始条件ではなく後続Phaseの成果物である。条件未達ならread-only auditに戻る。

## Appendix A — Exact baseline membership (134 files, once each)

### `.codex/config` (1)

`.codex/config.toml`

### Agent TOML (30)

`.codex/agents/apex/design-philosophy-steward.toml`, `.codex/agents/apex/global-context-intelligence-lead.toml`, `.codex/agents/apex/innovation-futures-portfolio-lead.toml`, `.codex/agents/apex/principal-product-strategist.toml`, `.codex/agents/apex/technology-readiness-lead.toml`, `.codex/agents/architecture/design-system-architect.toml`, `.codex/agents/architecture/software-architect.toml`, `.codex/agents/assurance/code-reviewer.toml`, `.codex/agents/assurance/debugger.toml`, `.codex/agents/assurance/epistemic-red-team-analyst.toml`, `.codex/agents/assurance/figma-design-qa.toml`, `.codex/agents/assurance/human-factors-error-specialist.toml`, `.codex/agents/assurance/security-privacy-risk-steward.toml`, `.codex/agents/assurance/test-engineer.toml`, `.codex/agents/build/application-implementer.toml`, `.codex/agents/build/component-implementer.toml`, `.codex/agents/build/data-implementer.toml`, `.codex/agents/build/documentation-writer.toml`, `.codex/agents/build/skill-writer.toml`, `.codex/agents/delivery/release-manager.toml`, `.codex/agents/design/adaptive-resilience-experimenter.toml`, `.codex/agents/design/design-critic.toml`, `.codex/agents/design/figma-designer.toml`, `.codex/agents/discovery/authority-control-librarian.toml`, `.codex/agents/discovery/bibliographic-identity-librarian.toml`, `.codex/agents/discovery/requirements-analyst.toml`, `.codex/agents/discovery/ux-researcher.toml`, `.codex/agents/governance/product-integrity-reviewer.toml`, `.codex/agents/governance/product-owner.toml`, `.codex/agents/governance/scrum-master.toml`

### `.github` (2)

`.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/task.yml`

### `.storybook` (2)

`.storybook/main.ts`, `.storybook/preview.tsx`

### `docs` (9)

`docs/AGENT_ORGANIZATION.md`, `docs/ARCHITECTURE.md`, `docs/CODING_GUIDELINE.md`, `docs/COMPONENT_TRACEABILITY.md`, `docs/CONTENT_MODEL.md`, `docs/DESIGN.md`, `docs/DEVELOPMENT.md`, `docs/ROUTING.md`, `docs/design/stack-library-wireframe.html`

### `microcms` (1)

`microcms/api-books-import.json`

### `public/assets/covers` (14)

`public/assets/covers/book-01.jpg`, `public/assets/covers/book-02.jpg`, `public/assets/covers/book-03.jpg`, `public/assets/covers/book-04.jpg`, `public/assets/covers/book-05.jpg`, `public/assets/covers/book-06.jpg`, `public/assets/covers/book-07.jpg`, `public/assets/covers/book-08.jpg`, `public/assets/covers/book-09.jpg`, `public/assets/covers/book-10.jpg`, `public/assets/covers/book-11.jpg`, `public/assets/covers/book-12.jpg`, `public/assets/covers/book-13.jpg`, `public/assets/covers/book-14.jpg`

### `public/assets/shelf` (18)

`public/assets/shelf/bg_cafe@2x.png`, `public/assets/shelf/bg_cherry@2x.png`, `public/assets/shelf/bg_craftwork@2x.png`, `public/assets/shelf/bg_custom@2x.png`, `public/assets/shelf/bg_darknight@2x.png`, `public/assets/shelf/bg_grafitti@2x.png`, `public/assets/shelf/bg_kids@2x.png`, `public/assets/shelf/bg_maple@2x.png`, `public/assets/shelf/bg_premium01@2x.png`, `public/assets/shelf/bg_premium02@2x.png`, `public/assets/shelf/bg_spider@2x.png`, `public/assets/shelf/bg_stationery@2x.png`, `public/assets/shelf/bg_walnut@2x.png`, `public/assets/shelf/maple_center.png`, `public/assets/shelf/maple_left.png`, `public/assets/shelf/maple_right.png`, `public/assets/shelf/maple_shadow_left.png`, `public/assets/shelf/maple_shadow_right.png`

### `public` other (3)

`public/icon-dark.svg`, `public/icon-light.svg`, `public/ogp-center-stage.png`

### Root files (11)

`.gitignore`, `.oxlintrc.json`, `AGENTS.md`, `README.md`, `cspell.json`, `next-env.d.ts`, `next.config.ts`, `package-lock.json`, `package.json`, `tsconfig.json`, `vitest.config.ts`

### `src/app` (6)

`src/app/bank/page.tsx`, `src/app/books/[contentId]/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/page.tsx`

### `src/components` (15)

`src/components/card/BookCard.tsx`, `src/components/common/BookCover.tsx`, `src/components/common/Heading.tsx`, `src/components/common/StatusBadge.tsx`, `src/components/common/TechnicalAreaTags.tsx`, `src/components/common/ThemeSwitch.tsx`, `src/components/layout/AppShell.tsx`, `src/components/layout/BookShelf.tsx`, `src/components/layout/LibraryHeader.tsx`, `src/components/layout/ScrollContextBar.tsx`, `src/components/section/BookDetailIdentity.tsx`, `src/components/section/BookShelfSection.tsx`, `src/components/section/BookTextSection.tsx`, `src/components/section/ConnectionError.tsx`, `src/components/section/LibraryBank.tsx`

### `src/lib` (5)

`src/lib/books/bank.ts`, `src/lib/books/labels.ts`, `src/lib/books/normalize.ts`, `src/lib/books/queries.ts`, `src/lib/microcms/client.ts`

### `src/types` (1)

`src/types/book.ts`

### `stories` (16)

`stories/components/card/BookCard.stories.tsx`, `stories/components/common/BookCover.stories.tsx`, `stories/components/common/Heading.stories.tsx`, `stories/components/common/StatusBadge.stories.tsx`, `stories/components/common/TechnicalAreaTags.stories.tsx`, `stories/components/common/ThemeSwitch.stories.tsx`, `stories/components/layout/BookShelf.stories.tsx`, `stories/components/layout/LibraryHeader.stories.tsx`, `stories/components/layout/ScrollContextBar.stories.tsx`, `stories/components/section/BookDetailIdentity.stories.tsx`, `stories/components/section/BookShelfSection.stories.tsx`, `stories/components/section/ConnectionError.stories.tsx`, `stories/components/section/LibraryBank.stories.tsx`, `stories/fixtures/books.ts`, `stories/foundations/color.mdx`, `stories/storybook.css`

**Coverage assertion:** the category counts sum to 134; every baseline path appears exactly once above. The new audit document is not part of the baseline set.
