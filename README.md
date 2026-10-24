# Stack Library

**再構築中です。Next.jsとStorybookの開発基盤は構築済みです。本棚・検索・書籍登録は未実装です。**

Stack Libraryは、積読の技術書を覚えきれず、書店・ネット通販で同じ本を買ってしまうことを防ぐ、日本語ファーストの個人用蔵書管理Webアプリです。購入前に表紙・タイトルから所蔵を確認でき、自宅の蔵書を少ない手間で登録できることを目指します。

## 採用技術

| 役割 | 技術 | 用途 |
|---|---|---|
| 画面・アプリ基盤 | React 19 / Next.js 16 App Router | 画面とサーバー処理 |
| 言語 | TypeScript 5.9（strict） | アプリ・設定の型検査 |
| 実行環境 | Node.js 24 | ローカルとサーバーの基準 |
| パッケージ管理 | pnpm 10.34.7 | 依存関係とlockfileの管理 |
| UI開発 | Storybook 10 / Next.js Vite framework | 部品と状態のローカル確認 |
| スタイル | CSS Modules / 共通CSS変数 | モックに沿った画面と部品のスタイル |
| 公開先 | Vercel | 後続のプレビュー・本番実行環境 |
| 書籍・書影の保存 | microCMS | 後続の書籍データ・書影登録 |

実際の依存バージョンはpackage.jsonとpnpm-lock.yamlで固定します。microCMSへの接続とアップロード、Vercelへの公開はまだ行いません。

## 開発環境

Node.jsの基準バージョンは[.node-version](.node-version)、pnpmは[package.json](package.json)のpackageManagerで固定しています。Node.jsとpnpmを準備してから、リポジトリ直下で実行してください。

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
```

### アプリ

```sh
pnpm dev
```

[localhost:3000](http://localhost:3000/)で開発環境の確認ページを表示します。製品画面の完成を示すページではありません。

### Storybook

```sh
pnpm storybook
```

[localhost:6006](http://localhost:6006/)でDevelopment / Environment Checkを開きます。共通CSSの読み込みとボタンのクリックによるReactの更新を確認できます。製品用コンポーネントは実装に合わせて追加します。Storybookはローカル用で、公開・静的配布はしません。

### 検証と本番ビルド

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

typecheckはNext.jsのroute型を生成してからTypeScriptを検査します。buildもTypeScriptを検査します。設定や依存関係を変えていなければ、同じ差分で両方を重複実行する必要はありません。

現在の起動確認ページとStorybookは、APIキーやmicroCMSのデータなしで動作します。.env.localはGit管理外で保持し、秘密値をクライアントやStoryへ渡しません。

Next.jsのagentRulesはfalseにし、開発サーバーがプロジェクトのAGENTS.mdを自動変更しないようにしています。ESLintはNext.jsのReact関連プラグインが宣言する互換範囲に合わせて9系を使用しています。

## 現在の正本

仕様・進捗・決定事項の正本は [Linear — Stack Library MVP Rebuild](https://linear.app/megu-workspace/project/stack-library-mvp-rebuild-7e962c27e3a8) です。作業開始時に対象Issueの最新内容を確認してください。

- [MEG-27：Resetと再構築の入口](https://linear.app/megu-workspace/issue/MEG-27)
- [MEG-32：旧資料の撤去と文書更新](https://linear.app/megu-workspace/issue/MEG-32)
- [MEG-34：Figma起点のMVPデータ契約再設計](https://linear.app/megu-workspace/issue/MEG-34)

現在の利用者指示を優先し、Linearの確定仕様と、対象Issueから指定された承認済みFigmaを参照します。旧コード、旧README、過去の設計資料、Git履歴は現在の仕様ではありません。過去の資産を採用する場合は、対象Issueで必要性と採否を明示してください。履歴を自動的に仕様の補完に使わないでください。

## 2026-10-24のリセット

利用者の指示により、従来の段階的リセット計画に対して、旧実装と旧仕様資料を作業ツリーから撤去しました。

- 旧アプリ、データ取得処理、型、ローカルmicroCMSスキーマ、画像、Story、CSSを撤去
- Next.js・Storybook・テスト・依存関係の旧設定、lockfile、生成物を撤去
- 旧Design、Traceability、Wireframe、監査資料、Architecture、Content Model、Routingを撤去
- Git履歴、作業規約、エージェント設定、秘密設定は保持
- 追加worktreeは変更がないことを確認して削除し、primary repository一件に整理
- 旧実装と既存の未コミット変更は再利用しない。利用者の確認によりバックアップ・復元確認は不要

これは新MVPの実装完了やPhase 5全受入条件の達成を意味しません。リセット完了はPR #84とLinearに記録済みです。旧画面の実装済み情報を新MVPの進捗として扱わないでください。

## 次の工程

MEG-34の確定事項からデータ契約と最小構成を定義し、必要な資産だけを新規実装します。既存の型・スキーマの再採用は前提にしません。登録は手入力をMVPとし、外部書誌検索・カメラ読取・編集削除は対象外です。最新の詳細はLinearで確認してください。

MVPの対象画面は `/`、`/books/[contentId]`、`/bank`、`/books/new` です。今回の開発環境には `/` の起動確認ページだけを置き、製品画面はモックと確定事項から実装します。書影は必須でアプリからmicroCMSへ保存する方針、目次とISBNによる外部取得はMVP対象外です。

## 作業規約

[AGENTS.md](AGENTS.md)、[Development](docs/DEVELOPMENT.md)、[Agent Organization](docs/AGENT_ORGANIZATION.md)、[Coding Guideline](docs/CODING_GUIDELINE.md) を保持しています。これらは作業規約であり、撤去した実装の存続や再採用を要求するものではありません。旧資料への参照は履歴として扱い、現在の仕様には使いません。

## デプロイの停止

再構築中はvercel.jsonのgit.deploymentEnabledをfalseにし、Git連携による自動デプロイを停止します。旧デプロイのNEXT_NO_VERSIONは、Next.jsとpackage.jsonの撤去後も旧ビルド設定が動いたためです。アプリと検証手順が整った時点で、対象Issueの承認を受けて自動デプロイを再開します。既存の公開デプロイを削除する設定ではありません。
