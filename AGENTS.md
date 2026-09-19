# AGENTS.md

## Project identity

Stack Library は、技術書の蔵書を探し、確認し、登録する日本語ファーストの個人用ライブラリアプリです。一般的な読書レビューではなく、Technical Archive × Developer Observatory を目指します。

MVP は /（Book List）、/books/[contentId]（Book Detail）、/bank（Library Bank）、/books/new（Book Form）の4画面です。topics、notes、knowledge map、学習ルート、ログイン、AI推薦、外部サービス連携はMVP対象外です。Next.js App Router、TypeScript、microCMSを使い、APIキーはサーバー側だけで扱います。

UIは日本語ファースト、静かな暗色ベース、細い罫線、精密なメタデータ、読みやすい本文を基本とします。Booklog、Notion、一般的なSaaS、派手なSF、和風・古書店風には寄せません。見出し階層、明確なフォーカス、キーボード操作、テキストを含む状態表示、色に依存しない情報伝達を守ります。

## Decision and completion boundaries

read-onlyの質問・説明・報告はIssueなしで進められます。repository、Issue、Figma、Git、PR、外部サービスを変更する場合は、Issue、owner、exact scope、必要なauthorizationを確定してから開始します。依頼されたローカル変更は、割り当て範囲内で実装し、対象検証を行い、変更起因の失敗を元writerへ返すところまで継続します。

破壊的操作、未承認の外部mutation、未解決のproduct choiceまたは仕様矛盾、required authority/tool/evidenceの不足、dirty diffやownership mismatch、manifest外の変更、unsafe stateでは停止します。詳細なIssue・handoff・validationは Development が正本です。

## Deterministic task router

常にこのファイルを不変条件の基準として読み、担当するIssue・contract・handoff・evidenceと、主張に直接関係する資料だけを読みます。既読文書はrevisionや対象範囲が変わらない限り再読しません。agent TOMLは担当roleの契約だけを読みます。

| Task surface | Source of truth |
|---|---|
| product identity, MVP, setup, current routes | [README.md](README.md) |
| Git, branch, PR, release, handoff, validation | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| component, software boundary, Storybook mapping | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| role activation, authority, ownership, waves | [docs/AGENT_ORGANIZATION.md](docs/AGENT_ORGANIZATION.md) |
| CSS, class, naming, state, shared style | [docs/CODING_GUIDELINE.md](docs/CODING_GUIDELINE.md) |
| pages, URLs, static generation | [docs/ROUTING.md](docs/ROUTING.md) |
| microCMS, types, queries, fixtures, Server Actions | [docs/CONTENT_MODEL.md](docs/CONTENT_MODEL.md) |
| Figma/design source | applicable Figma skill, exact node, and role TOML |
| assigned role behavior | that role's .codex/agents/**/*.toml |
| external mutation, secret, trust boundary | this contract plus Development authorization/evidence rules |

## Repository and Git safety

作業場所は指定されたprimary repositoryの正のworktree一つだけです。git rev-parse --show-toplevelとgit worktree list --porcelainで、正のworktree一件を開始時とbranch変更前後に確認します。追加worktree、parallel write、agent/ branchは禁止です。

ユーザーの未完了または所有者不明のdirty diffをstash、reset、checkout、削除、上書き、無断commitしません。変更時はGitHub Issueを起点に最新mainを確認し、Issue番号付きbranchを使い、mainへ直接commitしません。local Gitはrepository stateとhistoryを扱い、GitHub serviceのIssue/PR/review/check/release/mergeはcallableなGitHub MCP-backed toolでexact targetへ扱います。publication authorizationは別に必要です。DraftからReadyへの独立承認はReady-only変更では必要ですが、同一PR/revisionへの明示的merge approvalは必要なReady遷移を包含します。merge methodとexpected_head_shaは別途凍結します。詳細とPR運用は Development が正本です。

tracked fileの内容はteam packetのexact pathを割り当てられたwriterだけが編集します。Issue specificationはauthorized product_owner、Figma nodeはassigned figma_designer、Git index/history・push・PR metadataはpublication authorization後のrelease_managerだけが変更します。reviewer、tester、debuggerはtracked fileを変更しません。

## Figma and design verification

Figmaが視覚仕様の正本なら、Issue文だけからUIを推論せず、対象frame/nodeとIssueの矛盾を確認します。implementation-parityでは変更後のfresh final application renderとfresh Figma node/structure evidenceを比較します。Figma-library-onlyではfresh Figma specimen/structure evidenceを確認し、application renderは要求しません。

対象theme、viewport、state、測定、render、read-backの詳細はfigma_design_qa TOML、Architecture、Developmentに委譲します。未確認項目や矛盾があれば完了扱いにせず停止します。

## Agent organization and concurrency

runtimeの最大値にかかわらず、同時稼働は親development_leadと最大3名のassigned specialistsです。完了したspecialistはslotを解放し、順次handoffで再利用します。職能はActivation Gateを満たす場合だけ起動し、同じtracked pathまたはexternal targetのwriterを並行起動しません。30 roleの一覧、Wave、handoff、exclusive authority、ownership ledgerは Agent Organization と各role TOMLが正本です。

## External services, secrets, and MCP evidence

秘密値をshell、model context、repository、Issue、ログ、handoffへ出力・記録しません。app runtimeとdevelopment MCPを分離します。公式microCMS remote MCPへ接続できるのは親development_leadだけで、credentialはhost/user environment variableから供給します。live mutationはbooks APIのcreateだけを、exact target、payload digest、expected state、明示的なone-shot user authorizationが揃った時に一回だけ実行します。update、delete、draft、status、reservation、media、Management、member、bulk、unknown toolは禁止です。timeout/unknown response後のretry、CLI・browser・direct HTTP・local MCP fallback、subagent委譲はしません。create後は同じserviceのMCP read-backがexpected stateとMATCHした場合だけverifiedです。

GitHub/Figmaなどのlive operationは割り当てられたownerがcallableなMCP-backed toolでexact targetを扱います。実際のtool identifier、provenance/server、target、operation、permission result、result/errorを記録し、availability、invocation、access、read、mutation_requested、mutation_verifiedの6状態を付けます。呼ばなかった場合もinvocation=NOT_INVOKEDのno-call entryを残します。required MCPがunavailable、undiscoverable、denied、失敗の場合はnon-MCPへfallbackせずBLOCKEDです。live mutationは同じserviceのMCP read-backでexpected/observed stateがMATCHした場合だけ完了です。詳細なschemaと例はDevelopmentとAgent Organizationへ委譲します。

## Validation

検証は変更リスクに応じたtargeted validationとし、成功済み検証は入力が変わらない限り再利用します。docs/config-only変更ではMarkdown link/heading、routing、TOML parse、roster、microCMS override、secret-literal heuristic、git diff --checkを確認し、app lint/buildやlive service callを要求しません。コード、画面、Figmaの検証行列は Development と該当role TOMLが正本です。

この契約と詳細文書またはfrozen contractが衝突した場合は独自に折衷せず、作業を止めてdevelopment_leadへ返します。
