# DEVELOPMENT.md

Stack Libraryの開発ワークフローです。人間、Codex、その他の自動化を区別せず、変更の種類に基づいて同じルールを適用します。

## 基本方針

一般的な作業の許可・停止条件は[AGENTS.md](../AGENTS.md)を優先します。この文書は実施する作業に必要な手順を参照するためのものです。

- mainへ直接commitしません。1 branch・1目的を原則とします。
- 明確に依頼されたローカル修正はIssueやrole割り当てなしで進められます。
- 新機能、複数工程、複数人の作業は原則としてLinear Issueへ目的・範囲・完了条件を記録します。GitHub Issueは明示された場合だけmirrorにします。
- 他人や所有者不明の変更を無断でstash、破棄、上書き、commitしません。
- commit、push、PR、Ready、merge、公開はユーザーの承認範囲で行います。作業依頼だけから公開までの承認を推測しません。

## 作業開始

開始時にrepository root、worktree、branch、dirty diffを確認します。差分が独立していれば作業を続けられます。重なる場合は所有者と依頼の範囲を確認します。

ローカル修正のためにIssue作成、mainへの同期、branch切り替えを一律要求しません。新しいbranchが必要なら、既存差分を保護してbaseを確認してから作成します。最新mainが必要な作業では同期しますが、他作業を混ぜたり差分を上書きしたりしません。

## Codex chat lifecycleと引き継ぎ

同じ成果に向けた調査、実装、review、修正は同じparent chatで継続できます。工程や職能ごとに新しいchatを要求しません。別の成果へ移る場合も、ユーザーの希望と文脈量から判断します。chatの作成・archiveはユーザーの依頼に従います。

単独作業ではparent agentが実装・検証・承認済みの公開操作を担当できます。specialistを明示的に割り当てる場合だけ[Agent Organization](./AGENT_ORGANIZATION.md)のrole契約とownershipを適用します。同じtracked fileや外部targetへの並行writeは禁止します。

通常は現在のprimary worktreeを使います。追加worktreeはユーザーが明示的に依頼した場合だけ作成します。開始時とbranch変更前後に作業場所と差分を確認します。worktreeが複数存在するという理由だけで、独立したread-only調査を停止しません。

### New-chat handoff packet

引き継ぎでは次を必要な範囲で伝えます。存在しないIssueやcontractの作成を引き継ぎ条件にしません。

- 目的、対象、完了条件、未解決の判断
- branch、head、変更path、既存差分のowner
- 適用するIssue・仕様・Figma target（ある場合）
- 完了した検証、その入力、再利用条件
- 外部操作の承認範囲、既存PR、次の作業

明示的なspecialist間のhandoffや独立reviewで必要な場合は、ownership ledger、input revision、file hash、frozen diff identityなどを追加します。後述の詳細な証拠schemaは、この厳密な受け渡しを指定した作業にだけ適用します。通常のローカル修正では差分と検証結果の報告で十分です。

公開操作では対象と承認範囲を記録します。mergeには対象PR/revisionへの明示的な承認が必要です。同じPR/revisionのmerge承認は必要なReady遷移を含みます。Readyだけの変更はその操作への承認を確認します。承認済み操作について再承認を要求しません。

`expected_head_sha`はmerge直前に確認した対象headを承認範囲へ束縛します。headが変わり承認済み差分と異なる場合は影響を確認し、範囲外なら再確認します。方法指定のない「マージ」は`merge_method=merge`、明示的なSquash／Rebase指定は該当methodとして記録します。実行するagentはmethodとexpected headをMCP merge操作に渡します。

## ブランチ命名

新しいbranchは`codex/<linear-id>-<short-summary>`、Issueがなければ`codex/<short-summary>`を使います。例は`codex/meg-43-update-next`、`codex/relax-agent-workflow`です。既存branchの改名は要求しません。mainへの直接commitは禁止です。

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
- 対象Linear IssueのID/URL（ある場合）
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
| 独立した文書変更 | Stacked PRを使わない通常のdocs-only変更として扱える。Issueは必要な場合だけ作る |
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

| Userの明示的な承認 | `development_lead`の記録 | 公開担当agentがMCP merge mutationへ渡す方法 |
|---|---|---|
| 「マージ」など、方法を限定しないmerge承認 | `merge_method=merge` | `merge`（GitHub merge commit） |
| Squashを指定したmerge承認 | `merge_method=squash` | `squash` |
| Rebaseを指定したmerge承認 | `merge_method=rebase` | `rebase`（GitHub Rebase merge） |
| 承認なし、方法が曖昧、または承認と記録が不一致 | 記録不可または要訂正 | 実行せず`BLOCKED` |

公開担当agentは承認・記録された値だけを使用し、MCP merge mutationのmerge method parameterと、別途authorizationへ束縛された`expected_head_sha`を省略しません。方法指定のない承認を`merge_method=merge`へ正規化するのは`development_lead`であり、公開担当agentによる推測ではありません。

既存履歴は保持します。amend、local rebase、force-pushなどのhistory rewriteは明示的な承認なしで行いません。表中のRebaseはGitHubがPRを統合する名前付き方法であり、既存のlocal/remote履歴を書き換える許可ではありません。

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

以下の詳細schemaは、明示的なspecialistへの委任、独立review、監査でfrozen evidenceが指定された場合に適用します。通常の単独作業にhash計算やmanifest作成を一律要求しません。通常は変更path、差分、検証コマンドと結果を記録します。

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

以下のsnapshot・分類schemaも厳密な証拠管理を指定した作業が対象です。通常作業では検証前後の差分を確認し、予期しない生成物や既存変更を無断で削除しません。

ファイル、index、branch/HEAD、cache、generatorを変更し得るコマンドの前後で、OS一時領域へ次をsnapshotし、command logとともに比較します。

- branch/HEAD
- stagedおよびworking-treeのraw diff hashとpath set
- `git status --porcelain=v2 --untracked-files=all`
- relevant ignored-output rootsと、既存dirty/product fileの正確なhash

差分は`CLEAN`、`ALLOWED_IGNORED_DELTA`、`EXPECTED_TRACKED_SIDE_EFFECT`、`UNTRACKED_CONTAMINATION`、`TRACKED_CONTAMINATION`、`INDEX_CONTAMINATION`、`UNKNOWN`に分類します。test_engineerはtracked/index/non-ignored artifactを自分でcleanしません。development_leadがoriginal writerまたは指定writerへexact cleanupを返します。既知のdeterministic generator side effectは`PASS_PENDING_RECONCILIATION`とし、writerがfrozen stateへ復元するかintentional outputとして凍結した後、影響範囲を判定して確定します。評価入力や結果を変え得るartifactだけを再実行し、文書化済みの同じdeltaを再生成するだけなら機械的に再実行しません。宣言済みで入力に影響しないignored cacheは残せます。

証拠は、`identity`（raw diff/file hash）、`subject`、`input revision`、`dependency manifest`、`environment assumptions`、`result`、`observed-at`、`invalidators`を持つcompact recordとして引き継ぎます。base/head、path/bytes、依存・設定、環境、remote review/check/base/mergeability、FigmaまたはIssueの対象が変わった場合だけ、影響するevidenceをtargeted revalidationします。新しいremote stateを判断するauditではreview、checks、base、mergeabilityを再取得し、immutableなreview/test evidenceは入力が不変なら再利用できます。skill/docsのcross-document reviewでは、直接consumerとdependent agent metadata（参照されるTOMLを含む）をmanifestへ列挙し、PR #75型の不整合を見落とさないようにします。

このfreshness契約はpublication、Ready-only時のDraftからReady、mergeのauthorizationを与えたり省略したりしません。明示的merge approvalがReady遷移を包含する場合も、各mutation直前に対象PRのstate、draft、base/head、expected SHA、checks、mergeabilityを再取得し、authorizationへ束縛された値と一致しない場合は停止します。

### リスク別の検証

この表は通常作業にも適用します。文書・agent設定だけの変更は区分Aとし、設定変更がアプリの実行やbuildへ影響する場合は区分Cとして扱います。

| 区分 | 主な変更 | 作業中の必須確認 | PR完成前の追加確認 |
|---|---|---|---|
| A: 軽微 | 文書、文言、命名、Story階層、挙動を変えない移動 | 差分、参照切れ、リンク、用語・見出し構造 | コードを含まなければbuild不要 |
| B: 局所 | Primitive、単一コンポーネント、局所CSS、Story | `pnpm lint`、`pnpm exec tsc --noEmit`、対象Story。Figmaが正本なら対象ノードも確認 | 影響範囲やCI要件に応じてbuildを追加 |
| C: 画面・基盤 | ページ、主要レイアウト、ルーティング、データモデル、microCMS、依存、アプリ実行・buildへ影響する設定 | `pnpm lint`、`pnpm build`、影響する統合状態 | 最終差分で影響画面とアクセシビリティを再確認 |

区分AでもTypeScriptのimportやファイル配置を変更した場合は、参照切れを検出するため`pnpm exec tsc --noEmit`を実行します。

`next build`はTypeScript検査を含みます。同じ差分に対して`pnpm exec tsc --noEmit`と`pnpm build`を連続して実行せず、前者は作業中、後者はPR完成前または区分Cの確認に使います。

全体buildや広範囲のテストは、影響範囲、失敗の兆候、適用されるCI・branch protection要件に応じて実行します。局所変更に全体buildを一律要求しません。必要なcheckを未実行のまま成功扱いにせず、完了報告に制約を記載します。

### UI確認の選び方

画面・ページ領域・レスポンシブレイアウトを変更した場合は、影響するDesktop / Mobile・Light / Darkを確認します。

独立したPrimitiveや単一コンポーネントでは対象Storyを確認します。Figmaとの一致が完了条件の場合だけ対象ノードも確認します。theme・viewportに依存しないことをCSS、Auto Layout、semantic variable bindingなどの構造で確認できる場合、同じ表示を機械的に4通り取得しません。

変更の性質に応じて、以下から影響する項目だけを選びます。

- Light / Dark
- Desktop / Mobile
- コンテナ幅が狭い状態
- キーボード操作
- `:focus-visible`
- 色以外でも理解できる状態表現
- 読み込み中、0件、取得失敗

approved exact Figma targetが割り当てられた変更だけは、そのtargetをvisual authorityとして扱い、複数の関連変更を最後の関連変更後、PR完成前に一括確認します。独立監査が必要な場合だけ`figma_design_qa`を割り当てます。割り当てがないFigmaはevidenceに限り、visual authorityとはみなしません。画面全体、主要レイアウト、高リスクなアクセシビリティ変更、または明示的に指定された監査は変更時点で実施します。監査後に対象へ影響する変更がなければ再監査しません。

Storybook導入後は、再利用コンポーネントの変更に対応するStoryと必要なinteraction testを含めます。テーマはglobal、画面幅はviewportまたはcontainerで検証し、見た目の違いだけをComponent propsへ増やしません。

Storybookのローカル確認には開発サーバーを使います。

```bash
pnpm storybook
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

ドキュメントだけの変更では、リンク、用語、見出し構造、他文書との矛盾を確認します。class命名やagent契約を含む場合は、class命名監査、名前空間・状態表現・legacy移行境界、関連TOMLの整合も確認します。コードへ影響しない場合、`pnpm lint`と`pnpm build`は必須ではありません。docs/config-only変更はRisk Aとします。agentやMCP設定を変更した場合だけ、TOML parse、30 canonical specialist roster、親MCPの接続設定、親MCPのtool数やallowlistを固定要件にしていないこと、全30 custom agentのmicroCMS disabled override、createのprompt approval、secret literal不在、diff scope、links、用語整合を優先します。これらの静的チェックは、Codex実行時のeffective tool inventory、host secret non-visibility、実際のmutation approval/read-backを証明しません。live MCP操作はこの検証では実施せず、アプリlint/build、UI/Figma確認も対象外です。

## ドキュメントの責務

| 文書 | 責務 |
|---|---|
| `README.md` | プロダクト概要、現在の状態、セットアップ、主要な入口 |
| `AGENTS.md` | エージェントが必ず守るプロジェクト固有の作業契約 |
| `docs/DEVELOPMENT.md` | ブランチ、コミット、PR、検証の共通ルール |
| `docs/CODING_GUIDELINE.md` | class名、CSS、状態表現などコードの書き方 |

方針を変更した場合は、実装と同じPRで該当文書を更新します。

## Repository writerの所有権

通常の単独作業では依頼を受けたagentが必要な関連ファイルを編集できます。以下の所有権と詳細handoffは、specialistへ明示的に委任した作業に適用します。担当範囲の追加・変更は親agentが調整し、他担当の変更を上書きしません。

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

Git index/historyとpush、およびGitHub上のDraft PR metadataは、承認範囲内で公開担当agentが変更します。単独作業ではparent agent、specialistへ委任した作業ではrelease_managerが担当できます。local repositoryとGit transportにはlocal `git`、GitHub上の対象には上記のGitHub service規則を使います。

再構築中のarchitecture、content model、routingの仕様はREADMEから対象Linear Issueを確認します。旧実装の資料は撤去済みで、Git履歴から仕様を復活させません。

## 運用方針で参照した公開事例

以下はルール設計の参考であり、このrepositoryへ各事例の契約全体を適用しません。

| 事例 | 判断 | 採用する点・採用しない点 |
|---|---|---|
| [Excalidraw](https://github.com/excalidraw/excalidraw/blob/master/AGENTS.md) | Adapt | 常設ルールをプロジェクト固有の注意点へ絞る。短さだけを目標にしない |
| [uv](https://github.com/astral-sh/uv/blob/main/AGENTS.md) | Adapt | 必須・禁止と推奨を分け、対象検証を優先する。Rust固有の指示は転用しない |
| [Zed](https://github.com/zed-industries/zed/blob/main/AGENTS.md) | Adapt | 新ルールは自明でなく、繰り返し起き、具体的なものに限定する。READMEへの確認行追加は採用しない |
| [TanStack Query](https://github.com/TanStack/query/blob/main/AGENTS.md) | Adapt | 共通の開発ルールを参照し、AI専用の重複契約を減らす |
| [Next.js](https://github.com/vercel/next.js/blob/canary/AGENTS.md) | Adapt | 変更内容に応じて検証を分岐し、深い手順は必要な作業だけで読む |
| [AGENTS.md公開サイト](https://github.com/agentsmd/agents.md/blob/main/AGENTS.md) | Adapt | 操作と理由を具体的に示す。agent session中のbuild禁止は転用しない |
