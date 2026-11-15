# AGENTS.md

## Project identity

Stack Libraryは技術書の蔵書を探し、確認し、登録する日本語ファーストの個人用ライブラリアプリです。Technical Archive × Developer Observatoryを目指します。

MVPの基本画面は`/`（Book List）、`/books/[contentId]`（Book Detail）、`/bank`（Library Bank）、`/books/new`（Book Form）です。現在のURLや採用済み機能は[README.md](README.md)と対象Issueを確認します。topics、notes、knowledge map、学習ルート、汎用ログイン、AI推薦は新たに追加しません。本人限定登録や書誌補完といった採用済みの認証・外部連携をこの対象外指定から削除しないでください。

Next.js App Router、TypeScript、microCMSを使い、APIキーはサーバー側だけで扱います。UIは日本語ファースト、静かな暗色を基調とし、採用済みのLight / Darkにも対応します。細い罫線、精密なメタデータ、読みやすい本文を基本とし、Booklog、Notion、一般的なSaaS、派手なSF、和風・古書店風に寄せません。見出し階層、明確なフォーカス、キーボード操作、テキストを含む状態表示、色に依存しない情報伝達を守ります。

## Working approach

ユーザーの依頼を起点に調査・実装・対象検証・結果報告まで進めます。作業の規模とリスクに応じて手順を選びます。

- 質問、調査、説明にはIssueを要求しません。
- 明確に依頼されたローカル修正はIssueやroleの事前割り当てがなくても進められます。
- 修正に必要な関連ファイルも対象にできます。無関係な整理や機能追加は混ぜません。
- 小さく元に戻せる実装上の判断は既存の設計に沿って進めます。結果に影響する仮定は報告します。
- 新機能、複数工程にまたがる変更、複数人の作業は原則としてIssueに目的・対象・完了条件をまとめます。Issue作成自体が外部変更なら、その承認範囲も確認します。
- すでに得た承認を繰り返し求めません。

次の場合は影響する操作を止めてユーザーに確認します。独立した調査や検証は続けられます。

- ユーザーの意図や承認済み仕様を変える必要がある
- 他人の変更との衝突を解消できない
- データ削除、履歴の書き換えなど、取り返しのつきにくい操作が必要になる
- 必要な権限や接続がなく、結果を確認できない
- 公開、送信、外部サービスへの書き込みが既存の承認範囲を超える

確認時は不足している判断と推奨案を具体的に示します。

## Sources of truth

判断の優先順位は現在のユーザー指示 → 対象の凍結Linear Issue → 承認済みRough → 記録済みReference decisions → 承認済みWireframeです。対象に適用される資料だけを使います。旧実装、旧仕様、旧Figma、Git履歴は調査の参考にできますが、明示的な採用判断なしに現在の仕様として扱いません。

対象仕様が矛盾する場合は独自に折衷せず、矛盾する箇所と影響を示して確認します。このファイルと詳細文書・role TOMLで一般的な作業の許可や停止条件が衝突する場合はこのファイルを優先します。明示的な個別担当の制約はその担当に適用します。

| 必要な情報 | 参照先 |
|---|---|
| プロダクト、MVP、セットアップ、現在のルート | [README.md](README.md) |
| Git、PR、公開、handoff、検証手順 | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| 複数agentの役割、担当範囲、受け渡し | [docs/AGENT_ORGANIZATION.md](docs/AGENT_ORGANIZATION.md) |
| CSS、命名、状態、共通スタイル | [docs/CODING_GUIDELINE.md](docs/CODING_GUIDELINE.md) |
| 個別の機能・データ仕様 | READMEから対象のLinear Issue・契約へ進む |
| Figmaを使う作業 | applicable skillと対象node |
| 明示的に割り当てられたroleの契約 | 対象の`.codex/agents/**/*.toml` |

必要な資料だけを読みます。関連資料の一括読込や、revision・対象が変わっていない文書の再読は原則不要です。

## Repository and Git

指定されたprimary repositoryで作業します。開始時に`git rev-parse --show-toplevel`、`git worktree list --porcelain`、branch、dirty diffを確認します。

- ユーザーや所有者不明の変更を無断でstash、reset、削除、上書き、commitしません。
- dirty diffがあっても今回の対象と独立していれば続けられます。重なる場合は変更内容と所有者を確認し、今回の依頼に属すると確認できれば続けます。
- 原則として現在のworktreeを使います。追加worktreeは明示的に依頼された場合だけ作成します。branch変更の前後は作業場所と差分を再確認します。
- 新しいbranchが必要な場合は`codex/`を使い、IssueがあればLinear IDを含めます。mainへ直接commitしません。
- 調査やローカル修正のために不要なbranch変更やmainへの同期を行いません。
- commit、push、PR作成、Readyへの変更、merge、公開はユーザーの依頼または既存の明示的な承認範囲で行います。
- GitHub上のPR、review、check、release、mergeは利用可能なGitHub MCP-backed toolで扱います。

merge前には対象PR、head、merge方法を確認します。詳細な公開手順はDevelopmentを参照します。

## Design and implementation

既存の仕様・デザイン・コンポーネントを優先し、依頼に必要な範囲で変更します。

- 既存UIの不具合修正、アクセシビリティ改善、文言調整、挙動を変えない整理にWireframe承認を一律要求しません。
- 新しい画面構成や主要操作など、プロダクトの判断が必要な変更は実装前に案を示します。具体案が承認済みなら再確認は不要です。
- 新しい装飾やtokenは必要性を説明できる場合に限定します。
- Figmaは対象作業の正本として指定された場合だけ規範にします。該当nodeを読み、Issueとの矛盾を確認します。
- Figmaとの一致が完了条件の場合は対象theme・viewport・stateのfresh evidenceで比較します。implementation-parityでは変更後のapplication renderとFigma node/structure、Figma-library-onlyではspecimen/structureを確認します。

未確認の一致条件を確認済みとして扱いません。状態値は0、missing、unknown、unavailable、error、not-applicableを必要に応じて区別します。

## Agents and ownership

単独で完結する作業にroleの切り替えやteam packetは必須ではありません。依頼を受けたagentが実装と検証を担当できます。

複数agentを使う場合は親development_leadと最大3名のspecialistsまでとし、目的・編集対象・完了条件を明確にします。同じtracked fileや外部targetへの並行writeは禁止します。

- 明示的な担当割り当てがある場合はそのownershipを守ります。範囲変更は親agentが調整します。
- reviewer、tester、debuggerとして割り当てられたagentはtracked fileを編集せず、結果をwriterへ返します。
- role TOMLのexact-path、frozen contract、handoff schemaなどは、そのroleを明示的に使う作業に適用します。通常の単独作業へ拡張しません。
- subagentを起動するかは現在のユーザー指示と実行環境の制約に従います。roleの登録だけを起動理由にしません。

## External services and secrets

秘密値をshell出力、チャット、repository、Issue、ログ、handoffへ出しません。app runtimeとdevelopment MCPを分離します。

外部サービスの読み取りは依頼に必要な範囲で行えます。書き込みはユーザーが承認した対象・操作・内容に限定し、同じサービスのMCP read-backで結果を確認します。

- 既存の承認が十分なら再確認しません。
- 結果が不明な書き込みを重複実行のおそれがある状態でretryしません。
- 必須MCPが使えない場合は該当操作をBLOCKEDとします。未承認の別経路へ切り替えません。
- 通常のread-only調査では重要な出典と取得できなかった情報を報告します。呼ばなかったtoolのno-call entryは不要です。
- 外部変更ではservice、target、operation、承認範囲、実行tool、実行結果、read-backのexpected/observed stateと一致結果を記録します。結果不明や不一致はverifiedにしません。
- 外部事例を仕様へ採用する際はAdopt／Adapt／Rejectと理由を残します。

### 詳細なMCP evidenceを要求する作業

Issueや明示的なrole契約で`MCP_EVIDENCE`が要求された場合だけ詳細schemaを使います。fully qualified tool identifier、provenance/server、target、operation、permission result、result/errorと、availability、invocation、access、read、mutation_requested、mutation_verifiedの6状態を記録します。toolの存在をinvocationの証拠にしません。no-call時は`invocation=NOT_INVOKED`、`access=UNKNOWN`、`read=NOT_REQUESTED`、`mutation_requested=NO`、`mutation_verified=NOT_REQUESTED`とします。mutationの検証には同じserviceのread-back tool、target、revisionまたは取得時刻、expected/observed state、`comparison result=MATCH`が必要です。

### microCMSのlive変更

- 公式remote MCPを扱うのは親development_leadだけです。credentialはhost/user environment variableから供給します。
- live変更はbooks APIのcreateだけです。exact target、payload digest、expected state、明示的なone-shot user authorizationを揃え、一回だけ実行します。
- update、delete、draft、status、reservation、media、Management、member、bulk、unknown toolは禁止します。
- timeoutや結果不明の後はretryしません。CLI、browser、direct HTTP、local MCPへのfallbackやsubagent委譲もしません。
- 同じserviceのMCP read-backがexpected stateと一致した場合だけverifiedとします。

## Validation and completion

検証は変更内容と影響範囲に応じて選びます。

- docs/config-onlyではリンク、構文、参照先、関連設定の整合性、`git diff --check`を確認します。app lint/buildやlive service callは原則不要です。
- コード変更では対象の型検査、lint、テストを必要に応じて実行します。
- 画面や操作の変更では影響する表示・状態・操作を確認します。
- 全体buildや広範囲のテストは影響範囲、失敗の兆候、適用されるCI要件に応じて追加します。
- 成功した検証は入力が変わらなければ再利用します。
- 変更起因の失敗は修正します。別writerが担当している場合は再現条件と証拠を返します。

完了報告には変更内容、実行した検証、残る制約を簡潔に記載します。実行していない検証や未確認の外部操作を成功扱いにしません。

## Maintaining these instructions

新ルールは「繰り返し起きる」「コードや既存資料だけでは分かりにくい」「具体的な行動として書ける」を基準に追加します。自動チェックや局所的な資料で解決できるなら、そちらを優先します。一度だけの失敗を理由に全作業へ承認手順を追加しません。特定機能やroleだけのルールは対象の資料に置きます。
