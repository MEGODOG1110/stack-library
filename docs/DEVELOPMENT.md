# DEVELOPMENT.md

Stack Libraryの開発ワークフローです。人間、Codex、その他の自動化を区別せず、変更の種類に基づいて同じルールを適用します。

## 基本方針

- `main`は常に統合可能な状態に保つ
- `main`へ直接コミットしない
- 凍結Linear Issueを作業記録と仕様の正本にする。GitHub Issueは明示的に要求・同期された場合だけoptional mirrorとする
- 1ブランチ、1目的とする
- 短命な作業ブランチからPRを作る
- merge方法は明示的なuser承認に従い、方法指定のない「マージ」はGitHub merge commitとする
- 未完了の別作業を、無断で現在のブランチへ混ぜない

長期の`develop`ブランチや、担当者・ツール名を表すブランチは作りません。

## 作業開始

最初に凍結Linear Issueを確認または作成し、目的、対応範囲、完了条件を記録します。GitHub Issueは明示的に要求・同期された場合だけ作成し、Linear ID/URLを紐付けます。

Linear Issue確定後、作業ツリーがクリーンであることを確認してから、最新の`main`を起点にLinear IDを含むブランチを作ります。

```bash
git status --short --branch
git switch main
git pull --ff-only origin main
git switch -c feature/meg-7-freeze
```

未コミット差分がある場合は、別作業か現在の作業かを確認します。判断できない差分をstash、破棄、コミットしてはいけません。

## Codex chat lifecycleと引き継ぎ

Codexによる変更は、原則として`1 Linear Issue / 1 coherent outcome / 1 parent Codex chat`で進めます。requirements、implementation、review、fix、delivery、mergeは職能ごとの別chatへ分断せず、同じLinear Issue、branch、outcomeを所有するparent chatで継続します。parent chatは必要な専門職をbounded internal subagentとして起動し、user-visible chatを職能ごとに増やしません。

| 状況 | Chatの扱い |
|---|---|
| 同じIssue、branch、coherent outcomeを継続 | requirementsからmergeまで同じparent chatを使う |
| 別のIssueまたは別のoutcome | 新しいparent chatを作る |
| shared contextからgenuine alternativeを比較 | forkできる。単なる工程分割、職能分割、引き継ぎには使わない |
| 軽量なread-only question、説明、state check、report | Issueを省略できる。mutation開始前にLinear Issue、outcome、branch、ownershipを確定する |
| merge後のfollow-up change | 完了したparent chatをarchive candidateとし、通常は新しいIssueとparent chatを使う |

同じ論理作業でreview findingやvalidation failureが出ても、新しいparent chatへ移さず、findingを元writerへ返して同じparent chat内のFix Waveで解消します。publication authorizationは、承認済みpathのstage、commit、push、Draft PRの作成・更新の許可であり、Ready-only変更やmerge authorizationを含みません。対象PR/revisionへの明示的なmerge approvalがある場合、その承認は必要なDraftからReadyへの遷移を包含します。

| 状態 | 記録と意味 |
|---|---|
| PR作成・更新 | publication authorizationによりDraft PRを作成または更新できる |
| DraftからReadyへの変更 | Ready-only変更ではPR作成とは別の明示的authorizationを必要とする。対象PR/revisionへの明示的なmerge approvalがある場合は、そのapprovalに包含される |
| merge authorization | userが対象PRのmerge実行を明示的に承認し、`development_lead`が対象PR/revisionへ束縛して記録する。Draftの場合は必要なReady遷移も同じapprovalに含める |
| recorded merge_method | 方法指定のない明示的な「マージ」承認は`development_lead`が`merge_method=merge`へ正規化する。SquashまたはRebaseはuserがその方法を明示した場合だけ`merge_method=squash|rebase`と記録する |

`release_manager`はpublication authorizationとmerge authorizationを統合または推測せず、merge authorization、必要なReady承認またはそれを包含するmerge approval、記録済み`merge_method`、authorized/frozen `expected_head_sha`が揃った場合だけ実行します。

新しいparent chatは、root `AGENTS.md`と`.codex/config.toml`をdiscoverできるよう、同じlocal projectを開き、primary repositoryのproject rootから開始します。tracked fileへの並行writeは禁止し、別Issueや別outcomeへ移る場合も正のworktreeを一つだけ使って順次handoffします。同じbranchまたは同じpathへ複数chatから書いてはいけません。read-only chatも追加worktreeを作成せず、正のworktreeまたは既存の履歴をread-onlyで確認します。開始時とbranch変更の前後に `git rev-parse --show-toplevel` と `git worktree list --porcelain` を確認し、指定rootと正のworktree一件だけに一致しない場合は停止します。

### New-chat handoff packet

別Issue、別outcome、または環境上の理由で新しいparent chatへ移るときは、会話履歴だけに依存せず、次のpacketを渡します。値がない項目も省略せず`none`または`absent`と記録します。

- Linear Issue ID/URLとfrozen updated revision（同期GitHub Issueが明示割当された場合はそのID/URLも記録）
- branch、base commit、head commit
- dirty diffの有無、exact changed paths、各diffのowner
- exact scope、coherent outcome、non-goals
- owner、allowed write surfaces、forbidden write surfaces、path単位のownership ledgerとそのrevision
- frozen Acceptance Matrix、Design Brief、Component Contract、Design Contract、Design Critic Approval、Technical Planなど、適用するcontractとrevision
- 完了済みvalidation、validation input revision、結果、再利用条件とinvalidation conditions
- Figma file/node ID、対象file、theme、viewport、state
- publication authorization、Ready-only時のDraftからReadyへのauthorization、merge authorization（DraftならReady遷移を包含）、`merge_method=merge|squash|rebase`、authorized/frozen `expected_head_sha=<40-character SHA>|absent`の各状態
- 既存Draft PRのURL/numberと状態
- 次のdownstream handoff、未解決finding、stop condition

`head commit`はpacket作成時に観測したbranchの状態です。`expected_head_sha`はそれとは独立して`development_lead`がmerge authorizationへ束縛し、MCP merge mutationへそのまま渡すexact SHAです。merge対象を凍結するまでは`expected_head_sha=absent`とし、観測したheadから暗黙に補完しません。

受け取ったparent chatは、branch、base/head、dirty diff、ownership ledger、frozen input revisionがpacketと一致することをread-onlyで確認してから作業を続けます。不一致、同じbranch/pathへの別chatのwrite、凍結入力の更新があれば停止し、`development_lead`へ返します。

ChatGPT、Codex Local、Codex Cloudは、会話履歴や未共有のファイルを自動的には引き継ぎません。このrepositoryではCodex Worktreeを使用せず、会話を正本にせず、Linear IssueとDraft PRを共有状態として使用します。GitHub Issueは明示的に同期された場合だけ補助参照です。

明示的な同期GitHub Issueまたは外部協業用mirrorが必要な場合だけ`.github/ISSUE_TEMPLATE/task.yml`を使用します。通常の作業仕様はLinear Issueを正本として、以下を記録します。

- 背景と解決する問題
- 完了時のゴール
- 対応範囲と対象外
- 客観的な完了条件
- 実行環境
- 制約と変更してはいけないもの
- 検証計画
- 参照資料と引き継ぎ元
- 未確定事項

通常の実装は`Codex Local`を選択します。別環境を使う場合も、追加worktreeを作成せず正のworktree一つを作業場所とし、ローカルにしか存在しないファイルや未pushコミットを前提にせず、必要な入力と成果物の受け渡し方法をLinear Issueへ記録します。

推奨する流れ:

```txt
ChatGPTで要件を整理
  -> Linear Issueを凍結
  -> CodexがLinear ID付きブランチで実装
  -> 早い段階でDraft PRを作成
  -> コミット、検証結果、残課題をDraft PRへ反映
  -> ChatGPTまたは人間がIssueとDraft PRを確認
  -> 明示的な承認後にマージ
```

Linear Issueは「なぜ、何を、どこまで行うか」の正本です。Draft PRは「現在どのコードがあり、何を検証し、何が残っているか」の共有状態です。作業中に決まった重要事項は、会話だけに残さずLinear Issueの決定ログまたはDraft PR本文へ反映します。

## ブランチ命名

形式は`<category>/<linear-id>-<short-summary>`です。`linear-id`には起点となるLinear IDを小文字化して使い、`short-summary`は英小文字とハイフンで簡潔に記述します。

| Category | 用途 | 例 |
|---|---|---|
| `feature/` | 利用者に見える機能追加 | `feature/12-book-form` |
| `fix/` | 不具合修正 | `fix/18-theme-focus-ring` |
| `docs/` | ドキュメントだけの変更 | `docs/23-repository-workflow` |
| `refactor/` | 振る舞いを変えない構造改善 | `refactor/27-book-normalizer` |
| `test/` | テストの追加・修正 | `test/31-book-card-stories` |
| `chore/` | 依存更新や保守作業 | `chore/35-update-next` |
| `ci/` | CI/CDの変更 | `ci/42-add-quality-checks` |

Codexや自動化による作業でも`agent/`は使いません。誰が作業したかではなく、何を変更するかを名前にします。

緊急修正も通常は`fix/`を使います。運用上必要になるまでは`hotfix/`、`release/`、`develop`を増やしません。

## コミット

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/ja/v1.0.0/)に準拠します。

```txt
<type>[optional scope][!]: <description>
```

主に使用するtype:

| Type | 用途 |
|---|---|
| `feat` | 機能追加 |
| `fix` | 不具合修正 |
| `docs` | ドキュメントだけの変更 |
| `refactor` | 振る舞いを変えない構造改善 |
| `test` | テストの追加・修正 |
| `chore` | 保守作業 |
| `build` | ビルドや依存関係の変更 |
| `ci` | CI/CDの変更 |
| `perf` | 性能改善 |
| `revert` | 既存コミットの取り消し |

例:

```txt
feat(book-form): add ISBN lookup
fix(book-card): preserve the full cover image
docs(workflow): define branch and commit rules
refactor(books): separate normalization from queries
```

- typeは小文字にする
- scopeは任意だが、対象が明確になる場合は付ける
- descriptionは変更内容を命令形で簡潔に書く
- 破壊的変更は`!`または`BREAKING CHANGE:`フッターで示す
- 1コミットには、説明可能な1つの変更単位だけを含める

## Pull Request

通常のPRとStacked PRの最下層は`main`をbaseにします。Stacked PRの上層だけは、直下のPRのbranchをbaseにします。タイトルもConventional Commits形式を推奨します。

PR本文には最低限、以下を記載します。

- 変更内容
- 変更理由
- 凍結Linear IssueのID/URL
- 影響範囲
- 確認方法と結果
- UI変更がある場合は対象画面と表示条件
- 未対応事項や既知の制約

実在するGitHub Issueが明示的に割り当てられ、Linearと同期されている場合に限り、PR本文へそのIssueのclose directiveを記載できます。GitHub Issueがない場合は`Closes #`を作成・推測しません。

`Closes #<issue>`は、実在する同期GitHub Issueが明示的に割り当てられた場合だけ、その番号へ置き換えて使用します。

### Stacked Pull Request

Stacked PRは、2つ以上の依存順を持つ変更を、小さく独立してレビュー可能なPRへ分ける必要がある場合だけ任意で使用します。各layerはcodeを含み、単独の成果としてレビュー・検証・bottom-up mergeできるcoherent outcomeでなければなりません。通常の1 PRで十分な変更へ機械的に適用しません。

| 判断対象 | Stack Libraryでの扱い |
|---|---|
| 適用できる変更 | 2つ以上のcode-bearing outcomeがあり、上層が下層へ依存し、各outcomeを独立してレビュー・検証・mergeできる変更 |
| layerの作業単位 | 各layerに別のLinear Issue、coherent outcome、branch、PR、parent Codex chat（parent task）を割り当てる |
| layerにしないもの | 同じoutcome内のrequirements、専門職、Wave、review、fix、deliveryなどの工程分割 |
| 実装に伴う文書更新 | 対応するcode layerへ同梱し、docs-only layerを作らない |
| 独立した文書変更 | Stacked PRを使わない通常のdocs-only Issue、branch、PRとして扱える |
| base branch | 最下層は`main`、上層は直下layerのbranch |
| PR状態 | stack構築中は各PRをDraftに保ち、layerごとに検証とreviewが完了したものだけ個別にReadyへ変更する |
| merge | stack全体または複数layerの一括mergeを禁止する。常に最下層の1 PRだけを承認・mergeし、残りもbottom-upで1 PRずつ進める |
| authorization | PRごとにReady-only時のDraftからReadyへのauthorization、merge authorization、`merge_method`、authorized/frozen `expected_head_sha`を記録する。対象PR/revisionへの明示的merge approvalはDraftからReadyへの遷移を包含でき、下層の承認を上層へ流用しない |

GitHub自体はstack全体または途中までの一括mergeを提供しますが、このrepositoryでは使用しません。上位PRをmergeして下位layerも同時に取り込む操作や、中間PRをmergeして複数の下位layerを取り込む操作は、個別PRのmerge authorizationを迂回するためです。

下層PRのmerge後、GitHubは残る上層branchをservice側で自動的にrebaseし、次のPRのbaseをretargetすることがあります。このservice動作は、local rebase、amend、force-push、その他のhistory rewriteを許可しません。自動更新後は次の順序で残るPRを再評価します。

1. GitHub serviceから対象PRの新しいbase、head SHA、stack位置、CI/check状態を取得する。
2. 新しいheadで、以前のvalidation、review、writer handoff、Ready-onlyまたはmerge-inclusive Ready authorization、merge authorization、`merge_method`、`expected_head_sha`が引き続き有効かを判定する。
3. rebase・retargetまたは差分変化で無効になった証拠だけを再実行または再取得する。
4. Ready-only authorization、またはReady遷移を包含するmerge authorizationが新しいheadへ束縛されていない場合は、再承認されるまでmergeしない。

GitHub Stacked PRはpublic previewであり、仕様変更の可能性があります。運用時は[GitHub Docs: About stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs)と[GitHub Changelog: Stacked pull requests are now in public preview](https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/)を確認します。AI sessionとの対応例は[GitHub Blog: Stacked sessions and pull requests in the GitHub Copilot app](https://github.blog/ai-and-ml/github-copilot/stacked-sessions-and-pull-requests-in-the-github-copilot-app/)を参考情報とし、Stack Libraryのparent Codex chat規則を優先します。

### Vercel Preview DeploymentとAgent Code Review

Vercel Preview DeploymentとVercel Agent Code Reviewは別の処理です。Preview Deploymentはbuildとpreview環境を扱い、Agent Code ReviewはPR差分をAIで監査します。Ignored Build Stepなどでdeployment buildをskipまたはcancelする設定を、Agent reviewの停止条件として扱いません。

| 対象 | 運用 |
|---|---|
| 自動Agent review | Vercel Agentの設定でautomatic reviewを無効にすることを推奨する |
| code-bearing Draft PR | stackを含め、Agent reviewを要求しない |
| code-bearing Ready PR | 追加のAI監査が必要な場合だけ、PR commentの`@vercel run a review`でon-demand reviewを起動する |
| docs-only PR | Agent reviewを要求しない。文書の差分、リンク、用語、構造、他文書との整合を確認する |
| Preview Deployment | Agent reviewとは独立して、projectのdeployment policyに従う |

自動reviewを無効にしても、repositoryのcode review、test、CI/check、branch protection、merge authorizationは省略しません。Vercel Agent Code Reviewの設定とtriggerは[Vercel Docs: Code Review](https://vercel.com/docs/agent/pr-review)を正本とし、on-demand reviewは[Vercel Changelog: On-demand Vercel Agent code reviews](https://vercel.com/changelog/on-demand-vercel-agent-code-reviews)、Ignored Build Stepは[Vercel Project Settings](https://vercel.com/docs/project-configuration/project-settings#ignored-build-step)を参照します。

### Merge authorizationと方法

PR作成、Ready-only時のDraftからReadyへの変更、merge authorization、development leadが記録したmerge_methodは記録します。対象PR/revisionへの明示的merge approvalがある場合はDraftからReadyへの遷移を同じapprovalに包含します。PRの存在、Ready状態、repository設定、GitHub UI、過去の履歴からmerge承認や方法を推測しません。

| Userの明示的な承認 | `development_lead`の記録 | `release_manager`がMCP merge mutationへ渡す方法 |
|---|---|---|
| 「マージ」など、方法を限定しないmerge承認 | `merge_method=merge` | `merge`（GitHub merge commit） |
| Squashを指定したmerge承認 | `merge_method=squash` | `squash` |
| Rebaseを指定したmerge承認 | `merge_method=rebase` | `rebase`（GitHub Rebase merge） |
| 承認なし、方法が曖昧、または承認と記録が不一致 | 記録不可または要訂正 | 実行せず`BLOCKED` |

`release_manager`は承認・記録された値だけを使用し、MCP merge mutationのmerge method parameterと、別途authorizationへ束縛された`expected_head_sha`を省略しません。方法指定のない承認を`merge_method=merge`へ正規化するのは`development_lead`であり、`release_manager`による推測ではありません。

既存履歴は保持し、amend、local rebase、force-push、その他のhistory rewriteを行いません。表中のRebaseはGitHubがPRを統合する名前付き方法であり、既存のlocal/remote履歴を書き換える許可ではありません。

### GitとGitHub serviceの操作境界

local repositoryとGitHub serviceの操作を区別します。

| 対象 | 標準手段 | 例 |
|---|---|---|
| local repositoryとGit transport | local `git` | status、diff、branch、stage、commit、push、local/remote ref alignment |
| GitHub service | callableなGitHub MCP-backed tool | Issue、PR、review、check、release、mergeのread/mutation |

GitHub MCPで必要なGitHub service操作がcallableなら、GitHub CLI（`gh`）の認証確認や`gh auth login`を作業の前提にしません。`git push`はlocal Gitのpublication操作であり、GitHub MCP invocationやGitHub serviceのread-back evidenceではありません。

必要な特定操作に対応するcallableなGitHub MCP-backed toolがtool search後もなく、その操作が契約上MCP必須でない場合に限り、`gh`を使用できます。その場合はMCP gap、tool search、操作の必要性、exact `gh` operationと結果をhandoffへ記録します。required MCP operationがunavailable、undiscoverable、denied、または失敗した場合、`gh`、browser、direct APIへfallbackせず`BLOCKED`とします。`gh`の結果をMCP invocation、MCP evidence、MCP read-backとして扱いません。

## 検証

検証は変更量ではなく、失敗した場合の影響範囲で選びます。途中の高速フィードバックと、PR完成前の最終ゲートを分離します。

### 証拠の同一性（frozen evidence）

検証、review、Ready、mergeの判断は、対象revisionに束縛した証拠だけを使用します。frozen diffには少なくとも次を記録します。

- `BASE_REVISION`（40文字のcommit SHA）と、`DIFF_SOURCE=working-tree|index`
- repository-relativeなexact path manifest（決定的なソート順）、各fileのSHA-256とstatus（追加・削除を含む）
- Git versionと、改行・属性・diffに関係する設定（`core.autocrlf`、`core.eol`、`core.safecrlf`、`core.filemode`、`core.quotePath`等）

manifestのpathはGitが受け付けるrepository-relative path（NULを含まない）をUTF-8でNUL-delimited serializationとして保存します。各recordをpathのUTF-8 byte sequenceの昇順（byteが同じ場合だけ同一path）で並べてからNULをseparatorとして連結します。NULはGit pathに現れないため、改行を含むpathも曖昧になりません。空白、tab、改行、非ASCII、glob文字、先頭`:`は文字列として保持し、shellのglobや文字列splitを使いません。各NUL-delimited recordをdecodeしてdistinctなargv itemとしてGitへ渡し、`--literal-pathspecs`をGit global optionとしてsubcommandより前に指定します。manifest pathはliteral Git pathspecであり、pathspec patternやmagicとして解釈しません。`BASE`と`SORTED_PATHS`は説明上のplaceholderであり、literal tokenではありません。通常のwriterのsourceはworking tree、publication時のsourceはindexです。

```bash
# working-tree: argv = ["git", "-c", "color.ui=false", "-c", "core.quotePath=true", "--literal-pathspecs", "diff", "--binary", "--no-ext-diff", "--no-textconv", "--full-index", "--no-renames", "--diff-algorithm=myers", "--no-indent-heuristic", "--unified=3", "--src-prefix=a/", "--dst-prefix=b/", BASE, "--", ...SORTED_PATHS]
# index:         argv = ["git", "-c", "color.ui=false", "-c", "core.quotePath=true", "--literal-pathspecs", "diff", "--cached", "--binary", "--no-ext-diff", "--no-textconv", "--full-index", "--no-renames", "--diff-algorithm=myers", "--no-indent-heuristic", "--unified=3", "--src-prefix=a/", "--dst-prefix=b/", BASE, "--", ...SORTED_PATHS]
```

stdoutはOSの一時ファイルへraw bytesのまま保存し、text decode/re-encodeせず、そのbyte列をSHA-256化します。renameはold/new pathをmanifestへ含め、`--no-renames`ではdelete/addとして表現します。mode変更、binary、削除もraw patchへ含めます。file hashとcommit SHAはdiff hashを補完しますが、置き換えません。

working-tree sourceでは、tracked patchだけではuntrackedな追加ファイルを表現できないため、次の`WORKTREE_IDENTITY/v1`をcanonical identityとします。writer reviewはindexを変更せず、publicationのindex identityとは別にこのworking-tree identityを計算します。

1. exact path manifestをrepository-relative UTF-8 pathのbyte sequence順にdistinct化し、NUL-delimitedでserializationします。manifest自体をcombined streamへlength-framedで含め、ディレクトリを指定して再帰的に展開したり、manifestにないpathを暗黙に追加したりしません。空のmanifestは拒否し、Git invocationを開始しません。これにより`git diff BASE --`が全treeを対象にする曖昧な呼び出しへ変化しません。
2. tracked portionは、上記manifestをそのままdistinctなargv itemとして渡す既存の`git diff BASE -- ...SORTED_PATHS`のraw stdoutです。`BASE`、source、flags、manifestが変わればidentityは別物です。
3. untracked portionは、`git --literal-pathspecs ls-files --others --exclude-standard -z -- ...SORTED_PATHS`の結果とmanifestのexact-equality intersectionだけを対象にします。`--literal-pathspecs`はsubcommandより前のGit global optionであり、manifest pathをpathspec patternやmagicとして扱いません。ignored file、scope外untracked file、発見結果に含まれないpathは除外し、ディレクトリやspecial fileが対象になった場合は失敗します。結果をpath byte順に並べ、各pathを`lstat`します。regular fileは`O_NOFOLLOW`または同等のdescriptor-safe no-follow保証を持つ方法でopenし、開いたdescriptorを`fstat`してからraw bytesを読みます。symlinkはfollowせず、`lstat`/`readlink`/再`lstat`でlink-target bytesを読みます。必要なno-follow保証やmetadataをOSが提供できない場合はfail closedとし、そのfilesystem制約をenvironment assumptionsへ記録します。typeは`regular`または`symlink`、modeはGit-compatibleな`100644`、`100755`、`120000`のいずれかへ正規化します。
4. combined streamは単純な文字列連結を避け、次のbinary framingを使います。ASCII magic/version `STACKLIB-WORKTREE-IDENTITY/v1\0`、u64 big-endianのmanifest byte length、manifest bytes、u64 big-endianのtracked patch byte length、tracked patch bytes、u64 big-endianのuntracked record countを順に置きます。各untracked recordは、u64 length + path bytes、1 byteのtype tag（`r`または`s`）、6 ASCII bytesの固定mode（`100644`、`100755`、`120000`のいずれか）、u64 big-endianのunsigned raw byte size、32 bytesのraw content/link-target SHA-256 digestの順です。countが0の場合もcount fieldを保持します。stream全体をraw bytesのままSHA-256化します。
5. 各untracked pathについて、discover前後および`lstat`/descriptor-safe open/`fstat`/read（symlinkは`readlink`）前後でpath、type、mode、size、mtime、inode（取得可能な場合）を比較します。変化、消失、型変更、読み取り不能、eligibility driftがあれば`CONCURRENT_FILE_CHANGE`としてfail closedし、混在したsnapshotを受け入れずfreezeを再実行します。regular fileではopen前後の`lstat`と開いたdescriptorの`fstat`が同じregular objectを示すこと、symlinkでは前後の`lstat`が同じlink objectを示すことを必須とします。regular fileの読み取りでもsymlinkをfollowせず、OS・filesystemがinode等を提供しない場合は提供可能な項目だけでなくno-followや必要なmode情報を保証できるかも確認し、保証できなければfail closedとします。

このidentityはtracked modification、deletion、rename、mode変更、binary変更、emptyを含むnew file、複数new file、改行や非ASCIIを含むGit-valid pathを同じstreamでbindできます。path順変更では結果が変わらず、同じsnapshotの再計算は同一hashになります。ignored fileとscope外untracked fileはmanifest intersectionに入らないため対象外です。regular fileのmodeは、`core.filemode=true`かつ実行bitを信頼して取得・設定できる場合だけ`100755`、それ以外は`100644`とし、必要なconfigまたはmetadataを取得できない場合はfail closedとします。symlinkは常に`120000`です。これらのconfigとfilesystem能力はcross-host identity inputです。Gitのindexはwriter review中に変更しません。publicationでは新規fileがstage済みとなり、既存の`git diff --cached BASE` canonical identityに追加fileが含まれるため、index contractの変更は不要です。working-tree identityのtracked patch SHAは診断用に任意で記録できますが、untracked recordを含むcombined hashがreview identityです。

最低限、Git version、`core.autocrlf`、`core.eol`、`core.safecrlf`、`core.filemode`、`core.quotePath`、対象pathに効く`.gitattributes`、clean/smudge filter、`working-tree-encoding`、diff driver、sparse-checkout stateも記録します。固定flagsはcolor、textconv、external diff、algorithm等を中立化します。別担当が同じworktreeで独立再計算するのが通常で、BASE、source、path set、file bytes、上記設定または環境が変わったら証拠を無効化します。cross-hostで再計算できるのはこれらの入力が一致する場合だけで、そうでなければcanonical raw patchを引き継ぎます。diff hashの普遍的なportabilityを仮定しません。

### 検証コマンドによる汚染と証拠のfreshness

ファイル、index、branch/HEAD、cache、generatorを変更し得るコマンドの前後で、OS一時領域へ次をsnapshotし、command logとともに比較します。

- branch/HEAD
- stagedおよびworking-treeのraw diff hashとpath set
- `git status --porcelain=v2 --untracked-files=all`
- relevant ignored-output rootsと、既存dirty/product fileの正確なhash

差分は`CLEAN`、`ALLOWED_IGNORED_DELTA`、`EXPECTED_TRACKED_SIDE_EFFECT`、`UNTRACKED_CONTAMINATION`、`TRACKED_CONTAMINATION`、`INDEX_CONTAMINATION`、`UNKNOWN`に分類します。test_engineerはtracked/index/non-ignored artifactを自分でcleanしません。development_leadがoriginal writerまたは指定writerへexact cleanupを返します。既知のdeterministic generator side effectは`PASS_PENDING_RECONCILIATION`とし、writerがfrozen stateへ復元するかintentional outputとして凍結した後、影響範囲を判定して確定します。評価入力や結果を変え得るartifactだけを再実行し、文書化済みの同じdeltaを再生成するだけなら機械的に再実行しません。宣言済みで入力に影響しないignored cacheは残せます。

証拠は、`identity`（raw diff/file hash）、`subject`、`input revision`、`dependency manifest`、`environment assumptions`、`result`、`observed-at`、`invalidators`を持つcompact recordとして引き継ぎます。base/head、path/bytes、依存・設定、環境、remote review/check/base/mergeability、FigmaまたはIssueの対象が変わった場合だけ、影響するevidenceをtargeted revalidationします。新しいremote stateを判断するauditではreview、checks、base、mergeabilityを再取得し、immutableなreview/test evidenceは入力が不変なら再利用できます。skill/docsのcross-document reviewでは、直接consumerとdependent agent metadata（参照されるTOMLを含む）をmanifestへ列挙し、PR #75型の不整合を見落とさないようにします。

このfreshness契約はpublication、Ready-only時のDraftからReady、mergeのauthorizationを与えたり省略したりしません。明示的merge approvalがReady遷移を包含する場合も、各mutation直前に対象PRのstate、draft、base/head、expected SHA、checks、mergeabilityを再取得し、authorizationへ束縛された値と一致しない場合は停止します。

| 区分 | 主な変更 | 作業中の必須確認 | PR完成前の追加確認 |
|---|---|---|---|
| A: 軽微 | 文書、文言、命名、Story階層、挙動を変えない移動 | 差分、参照切れ、リンク、用語・見出し構造 | コードを含まなければbuild不要 |
| B: 局所 | Primitive、単一コンポーネント、局所CSS、Story | `npm run lint`、`npx tsc --noEmit`、対象Storyまたは対象Figmaノード | コードを含むPRとして`npm run build`を一度実行 |
| C: 画面・基盤 | ページ、主要レイアウト、ルーティング、データモデル、microCMS、依存・設定 | `npm run lint`、`npm run build`、影響する統合状態 | 最終差分で影響画面とアクセシビリティを再確認 |

区分AでもTypeScriptのimportやファイル配置を変更した場合は、参照切れを検出するため`npx tsc --noEmit`を実行します。

`next build`はTypeScript検査を含みます。同じ差分に対して`npx tsc --noEmit`と`npm run build`を連続して実行せず、前者は作業中、後者はPR完成前または区分Cの確認に使います。

コードを含むPRは、Ready化またはマージ前の最終差分に対して以下を一度実行します。

```bash
npm run lint
npm run build
```

### UI確認の選び方

画面・ページ領域・レスポンシブレイアウトを変更した場合は、影響するDesktop / Mobile・Light / Darkを確認します。

独立したPrimitiveや単一コンポーネントでは、対象Storyと対象Figmaノードを確認します。theme・viewportに依存しないことをCSS、Auto Layout、semantic variable bindingなどの構造で確認できる場合、同じ表示を機械的に4通り取得しません。

変更の性質に応じて、以下から影響する項目だけを選びます。

- Light / Dark
- Desktop / Mobile
- コンテナ幅が狭い状態
- キーボード操作
- `:focus-visible`
- 色以外でも理解できる状態表現
- 読み込み中、0件、取得失敗

approved exact Figma targetが割り当てられた変更だけは、そのtargetをvisual authorityとして扱い、複数の関連変更を最後の関連変更後、PR完成前に`figma_design_qa`で一括監査します。割り当てがないFigmaはevidenceに限り、visual authorityとはみなしません。画面全体、主要レイアウト、高リスクなアクセシビリティ変更、または明示的に指定された監査は変更時点で実施します。監査後に対象へ影響する変更がなければ再監査しません。

Storybook導入後は、再利用コンポーネントの変更に対応するStoryと必要なinteraction testを含めます。テーマはglobal、画面幅はviewportまたはcontainerで検証し、見た目の違いだけをComponent propsへ増やしません。

Storybookのローカル確認には開発サーバーを使います。

```bash
npm run storybook
```

Storybookは公開・配布せず、静的ビルド用スクリプトや生成物を標準検証へ含めません。

Storyは`Foundations / Components / Patterns`の責務に沿って配置します。microCMSへ直接接続せず、`Book`型に準拠したfixtureで通常、欠損、長文などの状態を再現します。

### 検証結果の再利用

同じ論理タスク内の成功結果は、次の条件をすべて満たす場合に再利用できます。

- 検証対象のファイルとその依存先を変更していない
- lint、TypeScript、Next.js、Storybook、テストの設定を変更していない
- `package.json`やlockfileを変更していない
- 検証後にmerge、rebase、依存更新を行っていない
- 実行環境や必要な環境変数が変わっていない

条件を満たさなくなった場合も、すべてをやり直さず、影響する検証だけを再実行します。`git diff --check`、同じスクリーンショット取得、同じlintなどを、根拠なく途中で反復しません。

ドキュメントだけの変更では、リンク、用語、見出し構造、他文書との矛盾を確認します。class命名やagent契約を含む場合は、class命名監査、名前空間・状態表現・legacy移行境界、関連TOMLの整合も確認します。コードへ影響しない場合、`npm run lint`と`npm run build`は必須ではありません。docs/config-only変更はRisk Aとし、TOML parse、30 canonical specialist roster、親MCPの接続設定、親MCPのtool数やallowlistを固定要件にしていないこと、全30 custom agentのmicroCMS disabled override、createのprompt approval、secret literal不在、diff scope、links、用語整合を優先します。これらの静的チェックは、Codex実行時のeffective tool inventory、host secret non-visibility、実際のmutation approval/read-backを証明しません。live MCP操作はこの検証では実施せず、アプリlint/build、UI/Figma確認も対象外です。

## ドキュメントの責務

| 文書 | 責務 |
|---|---|
| `README.md` | プロダクト概要、現在の状態、セットアップ、主要な入口 |
| `AGENTS.md` | エージェントが必ず守るプロジェクト固有の作業契約 |
| `docs/DEVELOPMENT.md` | ブランチ、コミット、PR、検証の共通ルール |
| `docs/ARCHITECTURE.md` | 技術構成、責務分離、コンポーネント設計 |
| `docs/CODING_GUIDELINE.md` | class名、CSS、状態表現などコードの書き方 |
| `docs/CONTENT_MODEL.md` | microCMSスキーマとTypeScript型 |
| `docs/ROUTING.md` | URL、画面責務、ナビゲーション |

方針を変更した場合は、実装と同じPRで該当文書を更新します。

## Repository writerの所有権

tracked fileの内容は、team packetでexact pathを割り当てられた次のwriterだけが編集します。

| Writer | 標準所有範囲 |
|---|---|
| `skill_writer` | `.agents/skills/**` |
| `documentation_writer` | `README.md`、`AGENTS.md`、`docs/**`、`.codex/agents/**`、Issue/PR template |
| `component_implementer` | `src/components/**`、`stories/**`、局所style、component test |
| `application_implementer` | `src/app/**`、画面統合test。ただしcolocated Server Action moduleを除く |
| `data_implementer` | `src/lib/**`、`src/types/**`、`src/actions/**`、`microcms/**`、data fixture/test。`src/app/**/actions.ts`などはexact pathを明示した場合だけ含む |

`.storybook/**`、root設定、共有style、test infrastructureには暗黙のownerを置かず、開発リードが1名を明示します。`package.json`とlockfileは同じwriterがatomic bundleとして扱います。複数領域は原則としてdata、component、application、skill/documentationの依存順でhandoffします。

同じfileの同時編集は禁止します。再割り当て時はownership ledgerへ旧owner、新owner、引き継ぎrevisionを記録し、最後のownerがfile全体のdiffとreview修正を引き受けます。互いに素なexact pathであっても並行writeは許容せず、同じ正のworktree内で順次handoffします。writerはstageやcommitを行わず、次をhandoffします。

- `SOURCE_WRITER`
- input Issue revisionとinput contract revision
- base HEADとexact path list
- 各fileのSHA-256とfrozen diff revision
- 変更していない禁止面、検証結果、既知のrisk
- 実際のdownstream contractと無効化条件
- findingを返す`FINDING_RETURN_WRITER`

Git index/historyとpush、およびGitHub上のDraft PR metadataは、publication authorizationを受けた`release_manager`だけが変更します。前者はlocal `git`、後者は上記のGitHub service規則に従います。
