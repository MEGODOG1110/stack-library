# Agent Organization

Stack Libraryの開発組織は、外部の親エージェント`development_lead`と、`.codex/config.toml`へ明示登録した30 canonical specialistsで構成します。専門職は常設の判断能力であり、30職能を同時に起動するものではありません。runtimeの最大値にかかわらず、同時稼働は親`development_lead`とassigned specialists最大3名です。Waveまたは担当の完了ごとにslotを解放し、順次handoffで再利用します。

`.codex/agents/<group>/`の8グループは、人間が責務、上流入力、下流handoffを理解するための組織図です。ファイルシステムの階層自体は、指揮命令、起動順、権限、承認、継承を強制しません。実際の登録は`.codex/config.toml`、実行制御は`development_lead`のteam packet、各職能の責務はTOML内の`ORGANIZATION CONTRACT`を正本とします。

## Parent chat and internal specialists

組織の実行単位は、`1 GitHub Issue / 1 coherent outcome / 1 parent Codex chat`です。`development_lead`であるparent chatが、同じIssue、branch、outcomeをrequirements、implementation、review、fix、delivery、mergeまで保持します。既存30 canonical roleはbounded internal subagentであり、職能ごとのuser-visible chatではありません。全30 custom agent TOMLはmicroCMS serverを明示的に無効化します。live microCMS MCP操作はsubagentへ委譲せず、親の`development_lead`だけが公式リモートMCPへ直接接続します。詳細は[AGENTS.md](../AGENTS.md)を正本とします。

別Issueまたは別outcomeは新しいparent chatを使います。forkはshared contextからgenuine alternativeが分岐する場合だけに限定し、role、Wave、reviewの分割には使いません。軽量なread-only question、説明、state check、reportはIssueなしで開始できますが、mutation前にIssue、outcome、branch、ownershipを確定します。merge後はparent chatをcompleteかつarchive candidateとし、通常のfollow-up changeは新しいIssueとparent chatへ分けます。

複数のparent chatによるtracked fileへのparallel writeは禁止します。同じIssueまたは別Issueにかかわらず、正のworktreeを一つだけ使い、parent chat間はhandoffして順次作業します。同じbranchまたは同じpathを複数chatで編集してはいけません。read-onlyのreviewや検証を並行する場合も、追加worktreeを作成せず、tracked fileを変更しないことを条件とします。

新しいparent chatは、root `AGENTS.md`と`.codex/config.toml`をdiscoverできるよう、同じlocal projectを開き、primary repositoryのproject rootから開始します。引き継ぎにはIssue URL/revision、branch/base/head、dirty diff/owner、scope/non-goals、allowed/forbidden surfacesとownership ledger、frozen contracts、validation revisionsとinvalidation、Figma targets、publication、DraftからReady、mergeの各authorization、`merge_method`、authorized/frozen `expected_head_sha`、既存Draft PR、downstream handoff/stop conditionを含むpacketを使います。`expected_head_sha`はbranch/head観測値ではなくmerge mutation authorizationへ束縛するexact SHAであり、未割り当て時は`absent`です。packetの完全なschemaと確認手順は[Development](./DEVELOPMENT.md#new-chat-handoff-packet)を参照してください。

## Group map

| Group | Purpose | Members |
|---|---|---|
| `apex` | 現在の製品戦略、世界文脈、将来選択肢、技術成熟度、設計哲学を独立した最高視点で監査する | `principal_product_strategist`, `global_context_intelligence_lead`, `innovation_futures_portfolio_lead`, `technology_readiness_lead`, `design_philosophy_steward` |
| `governance` | 優先順位とIssue仕様、独立した製品整合監査、WIPとhandoffを統治する | `scrum_master`, `product_owner`, `product_integrity_reviewer` |
| `discovery` | 要件、利用者と情報設計、書誌同一性、典拠語彙を実装前の検証可能な契約へ変換する | `requirements_analyst`, `ux_researcher`, `bibliographic_identity_librarian`, `authority_control_librarian` |
| `architecture` | デザインシステムとソフトウェアの境界、再利用構造、writer routingを凍結する | `design_system_architect`, `software_architect` |
| `design` | Figma視覚仕様、独立批評、回復性実験設計を実装前に凍結する | `figma_designer`, `design_critic`, `adaptive_resilience_experimenter` |
| `build` | team packetで割り当てられたexact pathだけをtracked repositoryへ実装する | `skill_writer`, `documentation_writer`, `component_implementer`, `application_implementer`, `data_implementer` |
| `assurance` | 凍結差分、検証、原因、視覚一致、証拠品質、ヒューマンエラー、security/privacy riskを独立監査する | `code_reviewer`, `test_engineer`, `debugger`, `figma_design_qa`, `epistemic_red_team_analyst`, `human_factors_error_specialist`, `security_privacy_risk_steward` |
| `delivery` | 承認済み差分だけをstage、commit、pushしてDraft PRへ反映し、別途承認・記録された方法だけでmergeする | `release_manager` |

## Five independent apex lenses

5つの`apex`職能は対等な独立視点です。常設の承認会議ではなく、互いの代役でもありません。該当するActivation Gateを満たす職能だけを起動し、異なる視点の結論を多数決で平均化しません。衝突は根拠とともに`development_lead`へ返し、製品価値に関わる未解決選択は`user`へエスカレーションします。

| Lens | Question |
|---|---|
| `principal_product_strategist` | 現在、誰のどの問題をどの成果へ変える製品なのか |
| `global_context_intelligence_lead` | 文化、言語、法域、規制、エコシステムが変わっても前提は成立するか |
| `innovation_futures_portfolio_lead` | 複数の将来に対して、どの選択肢を探索、保持、確約、廃止するか |
| `technology_readiness_lead` | 技術能力は対象環境でどこまで実証され、いつ採用または撤退すべきか |
| `design_philosophy_steward` | 製品の価値、倫理、美学、identityのうち何を不変条件として守るか |

## Role contracts

各職能は、TOML内で`GROUP`、`PURPOSE/AUTHORITY`、`ACTIVATION_GATE`、`UPSTREAM_INPUTS`、`DOWNSTREAM_HANDOFFS`、`STOP/RETURN`を1回ずつ宣言します。次表は組織全体から見た要約です。詳細な読み取り範囲、停止条件、出力schema、MCP evidenceは各TOMLが正本です。

### Apex

| Role | Authority and activation | Contract / return |
|---|---|---|
| `principal_product_strategist` | 新方向、価値提案、成功指標、投資選択で現在のcustomer/problem/outcomeとproduct thesisを定義する。Issueやbacklogは編集しない | `STRATEGY_BRIEF`; user/value conflictは`DECISION_REQUIRED`; routine deliveryは`NOT_REQUIRED` |
| `global_context_intelligence_lead` | global user、locale/script/format、cross-border data/vendor、transferability claimを文化・言語・法域・規制・ecosystemから監査する。翻訳者や法律顧問ではない | `GLOBAL_CONTEXT_CONTRACT`; jurisdiction/evidence不足は`DECISION_REQUIRED`; Japan-only不変なら`NOT_REQUIRED` |
| `innovation_futures_portfolio_lead` | 12か月超、post-MVP、不可逆なplatform/data/vendor bet、weak signalを複数scenarioとoptionで扱う。backlogを所有しない | `FORESIGHT_OPTION_PORTFOLIO`; `EXPLORE/HOLD/COMMIT/RETIRE`とkill/scale signpost; 短期可逆taskは`NOT_REQUIRED` |
| `technology_readiness_lead` | 新AI/framework/database/API/vendor、migration、prototypeのproduction claimを実証環境と成熟度で評価する。実装architectではない | `TECHNOLOGY_READINESS_CONTRACT`; `OBSERVE/INCUBATE/PILOT/ADOPT/CONTAIN/RETIRE`; established technology不変なら`NOT_REQUIRED` |
| `design_philosophy_steward` | product/visual language、principle conflict、identityを変え得るAI/global/technology選択で価値階層と不変条件を定義する。layout/token/Figmaは所有しない | `DESIGN_PHILOSOPHY_CHARTER`; user/value conflictは`DECISION_REQUIRED`; compliant routine changeは`NOT_REQUIRED` |

### Governance

| Role | Authority and activation | Contract / return |
|---|---|---|
| `scrum_master` | multi-Wave、blocker、scope drift、handoff gapでWIPと親＋3枠の交代を整える。priorityや技術判断は所有しない | `SLOT_PLAN`と`NEXT_TRANSITION`; 交代が明確になったら終了 |
| `product_owner` | 明示されたIssue authorization内でtitle、body、scope、Acceptance Criteria、priority、decision history、labelを単独編集する | read-back一致を含むfrozen Issue revision; 未決product choiceは`DECISION_REQUIRED` |
| `product_integrity_reviewer` | major scope freeze、新screen/model、高影響判断をMVP、product rules、日本語ファースト、cross-feature整合から独立監査する | `APPROVED/ACTION_REQUIRED/DECISION_REQUIRED/NOT_REQUIRED`; source revision変更で停止 |

### Discovery

| Role | Authority and activation | Contract / return |
|---|---|---|
| `requirements_analyst` | frozen IssueをAcceptance Matrix、decision、specialist briefへ変換する。Issueは編集しない | revision-bound Acceptance Matrix; source conflictは`DECISION_REQUIRED` |
| `ux_researcher` | user task、一次 evidence、情報優先度、Desktop/Mobile差をDesign Briefへ変換する。Figmaやcodeは編集しない | evidence limitsとfrozen Design Brief |
| `bibliographic_identity_librarian` | ISBN、dedupe、edition、translation、paper/e-book、multiple copyでWork/Instance/Item境界とmerge/splitを定義する | `BIBLIOGRAPHIC_IDENTITY_CONTRACT`; identity不変なら`NOT_REQUIRED` |
| `authority_control_librarian` | authors、publishers、technicalAreas、search/facet、synonym、knowledge mapでstable ID、labels、relations、redirectを定義する | `AUTHORITY_VOCABULARY_CONTRACT`; vocabulary不変なら`NOT_REQUIRED` |

### Architecture

| Role | Authority and activation | Contract / return |
|---|---|---|
| `design_system_architect` | Component、Variant、Token、responsive behavior、再利用構造をFigma/React/Storybook間の契約へ変換する | revisioned Component Contract |
| `software_architect` | material tradeoff、cross-layer change、API/data flow、migration、test seam、dependency order、writer routingを比較して凍結する | Technical Planとexact-path writer routing |

### Design

| Role | Authority and activation | Contract / return |
|---|---|---|
| `figma_designer` | approved briefとexact node assignmentがある場合だけFigmaを編集する | fresh screenshot/structure、MCP read-back一致、frozen Design Contract |
| `design_critic` | judgment-bearing Figma proposalを実装前にproduct meaning、bias、accessibility、tradeoffから独立批評する | `APPROVED/ACTION_REQUIRED/DECISION_REQUIRED` |
| `adaptive_resilience_experimenter` | critical dependency、unproven recovery、migration、high-risk launchに対してsteady state、blast radius、abortを持つ可逆実験を設計する。実行やproduction mutationを承認しない | `RESILIENCE_EXPERIMENT_CONTRACT`; safety/authority不足は`BLOCKED`; routine changeは`NOT_REQUIRED` |

### Build

| Role | Exact-path authority | Primary downstream |
|---|---|---|
| `skill_writer` | `.agents/skills/**`のteam packet指定path | `code_reviewer`, `test_engineer` |
| `documentation_writer` | `README.md`, `AGENTS.md`, `docs/**`, `.codex/agents/**`, Issue/PR templateのteam packet指定path | `code_reviewer`, `test_engineer` |
| `component_implementer` | `src/components/**`, `stories/**`, 局所style/testのteam packet指定path | `application_implementer`, `code_reviewer`, `test_engineer`, `figma_design_qa` |
| `application_implementer` | `src/app/**`とscreen integration testのteam packet指定path。Server Action moduleは標準範囲外 | `code_reviewer`, `test_engineer`, `figma_design_qa` |
| `data_implementer` | `src/lib/**`, `src/types/**`, `src/actions/**`, `microcms/**`, data fixture/testのteam packet指定path | `component_implementer`, `application_implementer`, `code_reviewer`, `test_engineer` |

### Assurance

| Role | Authority and activation | Contract / return |
|---|---|---|
| `code_reviewer` | frozen writer diffをcorrectness、architecture、accessibility、security、regressionから独立reviewする | findingをoriginal writerへ返し、`QA_HANDOFF`を`test_engineer`へ渡す |
| `test_engineer` | risk-basedな最小verificationを計画・実行する。tracked fileは編集しない | exact input-bound result; stable unknown failureは`debugger`へhandoff |
| `debugger` | `test_engineer`停止後、stable reproductionのroot causeを特定する。fixは実装しない | smallest correctionをoriginal writerへ返す |
| `figma_design_qa` | implementation-parityではfresh final application renderとfresh Figma node/structureを、Figma-library-onlyではfresh specimen/structureだけをvisual、dimension、theme、viewport、accessibilityから独立監査する | Blocker/Majorが残れば`ACTION_REQUIRED`、解消時だけ`PASS` |
| `epistemic_red_team_analyst` | high-impactかつ不完全・相関source・single hypothesis・unexplained disagreementの判断を証拠品質から監査する | `EPISTEMIC_AUDIT`; well-evidenced low-impact decisionは`NOT_REQUIRED` |
| `human_factors_error_specialist` | destructive/multistep/mode/interruption/mobile/repeated user-error surfaceをslip、mistake、error chain、recoveryから監査する | `HUMAN_ERROR_AND_RECOVERY_CONTRACT`; material surfaceなしは`NOT_REQUIRED` |
| `security_privacy_risk_steward` | Server Action/API/external service/secret/auth/personal data/write/dependency/trust-boundary changeを監査する | `SECURITY_PRIVACY_RISK_CONTRACT`; Blocker riskは`BLOCKED`; boundary不変なら`NOT_REQUIRED` |

### Delivery

| Role | Authority and activation | Contract / return |
|---|---|---|
| `release_manager` | publication authorization後、承認済みpathのGit index/history、push、PR metadataだけを変更する。working treeとIssueは編集しない。mergeは明示的なuser承認、`development_lead`が記録した`merge_method=merge|squash|rebase`、authorized/frozen `expected_head_sha`が揃う場合だけ、その方法とSHAを明示して実行する | commit/push/PR/merge read-backを含むhandoff。方法またはSHAを推測せず、missing、ambiguous、mismatchまたはparameter省略は`BLOCKED` |

## Activation and Wave overlay

グループはWaveの固定順ではありません。`development_lead`はIssue、Acceptance Matrix、変更面、risk、各`ACTIVATION_GATE`から必要な職能だけを選びます。同一targetのownerを並列起動せず、完了した専門職を停止して枠を次へ渡します。

1. Product Intake: 必要な場合だけ`principal_product_strategist`、`design_philosophy_steward`、`product_owner`を起動し、`requirements_analyst`が凍結IssueをAcceptance Matrixへ変換する。高影響時は`product_integrity_reviewer`を追加する。
2. Discovery: 該当gateに応じて`ux_researcher`、`global_context_intelligence_lead`、`bibliographic_identity_librarian`、`authority_control_librarian`、`technology_readiness_lead`、`innovation_futures_portfolio_lead`を起動する。
3. Architecture / Design: `design_system_architect`、`software_architect`、`figma_designer`、`design_critic`を依存順で交代する。回復性riskがあれば`adaptive_resilience_experimenter`、human-error surfaceがあれば`human_factors_error_specialist`を起動する。
4. Build: exact path ownership ledgerに従って5 writerを依存順に、正のworktree内で順次起動する。disjoint pathであってもtracked fileへのparallel writeは行わない。
5. Review / Debug / Fix: writer凍結後に`code_reviewer`と`test_engineer`、必要な場合だけ`figma_design_qa`、`security_privacy_risk_steward`、`epistemic_red_team_analyst`を、同じ正のworktreeでtracked fileを変更しないread-only作業として起動する。原因不明FAILでは`test_engineer`を止めて`debugger`へ交代し、fixは元writerへ戻す。
6. Delivery / Merge: publication authorization後だけ`release_manager`を起動する。PR作成、DraftからReadyへの変更、merge authorization、merge-method authorizationは独立して扱う。方法を限定しない明示的な「マージ」承認は`development_lead`が`merge_method=merge`と記録し、SquashまたはRebaseはuserがその方法を別途指定した場合だけ記録する。`development_lead`は観測上のheadとは別にmerge authorizationへ`expected_head_sha`を束縛し、`release_manager`は記録された方法とSHAをMCP merge mutationへ明示的に渡す。

`NOT_REQUIRED`は、登録職能が不要になったことではなく、そのtaskがActivation Gate外であり起動不要であることを表します。

## Handoff graph

```text
user
  |
development_lead
  |-- activation-gated apex lenses
  |     `--> governance / discovery contracts
  |-- governance --> discovery --> architecture --> design
  |                                      |            |
  |                                      `------> build writers
  |                                                  |
  |                                            assurance
  |                                                  |
  `--------------------------------------------> delivery
```

この図は代表的な依存方向であり、権限の継承を表しません。すべての起動、exact path、external target、publication、stop conditionはteam packetで確定します。canonical role referenceはsnake_caseを使い、組織外nodeは`development_lead`と`user`だけです。

## Exclusive authority

- Issue title、body、scope、Acceptance Criteria、priority、decision history、labelのmutationは、明示的にauthorizedされた`product_owner`だけが行います。
- Figma mutationは、exact file/nodeを割り当てられた`figma_designer`だけが行います。
- tracked repository fileの内容は、ownership ledgerでexact pathを割り当てられた5 writerだけが編集します。
- Git index/history、push、PR metadataは、publication authorization後の`release_manager`だけが変更します。status、diff、branch、stage、commit、push、local/remote ref alignmentにはlocal `git`を使い、PRなどGitHub service上の対象にはcallableなGitHub MCP-backed toolを使います。mergeには別のuser承認、`development_lead`が記録した`merge_method`、authorized/frozen `expected_head_sha`が必要です。`release_manager`は設定、UI、履歴から方法やSHAを推測せず、既存履歴をamend、local rebase、force-pushその他の方法で書き換えません。GitHub Rebase mergeは名前付きmerge方法であり、history rewriteの許可ではありません。`release_manager`はworking-tree fileやIssueを編集しません。
- 既存30 canonical roleのうち新設された12職能はすべてread-only advisory roleであり、repository、Issue、Figma、Git、PR、permission、external serviceのmutation authorityを持ちません。live microCMS MCP操作はこの組織外の親`development_lead`がAGENTS.mdの規則に従って直接実行します。

## MCP evidence

live GitHub/Figma accessのavailability、invocation、access、read、mutation request、mutation verificationは[AGENTS.md](../AGENTS.md)のshared `MCP_EVIDENCE` semanticsを正本とします。plugin、skill、schema、tool capabilityの存在だけをinvocation evidenceにせず、実際に呼んだfully qualified tool identifier、provenance/server、exact target、operation、permission result、result/errorを記録します。

local `git`とGitHub service operationは分離します。GitHub MCPで対象操作がcallableなら、`gh auth`の状態はその操作の開始条件ではありません。`gh`は、tool search後も対応するcallableなMCP toolがなく、その特定操作が契約上MCP必須ではない場合だけ使用でき、MCP gap、tool search、必要性、exact operation、結果をhandoffへ残します。`gh`の結果はMCP evidenceやread-backになりません。

required MCP accessがunavailable、undiscoverable、denied、または失敗した場合は、CLI、browser、direct API、別のnon-MCP手段へfallbackしません。no-call entryは`invocation=NOT_INVOKED`、`access=UNKNOWN`、`read=NOT_REQUESTED`、`mutation_requested=NO`、`mutation_verified=NOT_REQUESTED`を含めます。live mutationの完了には、同じserviceのMCP-backed read-backと`comparison result=MATCH`が必要です。
