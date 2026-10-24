# Stack Library

**再構築中です。旧実装はリセットしました。現在、実行できるアプリはありません。**

Stack Libraryは、技術書を探し、確認し、登録する日本語ファーストの個人用ライブラリアプリです。

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

これは新MVPの実装完了やPhase 5全受入条件の達成を意味しません。LinearのIssue状態は今回変更していません。旧画面の実装済み情報を新MVPの進捗として扱わないでください。

## 次の工程

MEG-34の確定事項からデータ契約と最小構成を定義し、必要な資産だけを新規実装します。既存の型・スキーマの再採用は前提にしません。登録は手入力をMVPとし、外部書誌検索・カメラ読取・編集削除は対象外です。最新の詳細はLinearで確認してください。

MVPの対象画面は `/`、`/books/[contentId]`、`/bank`、`/books/new` です。依存関係と起動手順は、再構築で構成が確定してから追加します。

## 作業規約

[AGENTS.md](AGENTS.md)、[Development](docs/DEVELOPMENT.md)、[Agent Organization](docs/AGENT_ORGANIZATION.md)、[Coding Guideline](docs/CODING_GUIDELINE.md) を保持しています。これらは作業規約であり、撤去した実装の存続や再採用を要求するものではありません。旧資料への参照は履歴として扱い、現在の仕様には使いません。
