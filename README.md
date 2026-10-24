# Stack Library

**再構築中です。本棚はサンプルデータで表示・検索・絞り込みを確認できます。microCMS接続・書籍登録・詳細画面は未実装です。**

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

[localhost:3000](http://localhost:3000/)で本棚のサンプルを表示します。書影を選ぶと書名・著者・ISBNを確認できます。書籍詳細ページへの接続は後続です。追加・金額の操作は準備中として無効化しています。

### Storybook

```sh
pnpm storybook
```

[localhost:6006](http://localhost:6006/)のBookshelf配下で、BookCover（書影）→BookTile（選べる書影）→BookShelf（分野の棚）→BookshelfScreen（画面）の順に確認できます。通常・空の本棚・検索0件・絞り込み済み・読込エラー・書影エラーを用意しています。Storybookはローカル用で、公開・静的配布はしません。

### 本棚の実装範囲（MEG-35）

モバイルの本棚は1行3冊を維持します。393px幅では書影104px、狭い画面では縦横比を保って縮小します。Mobile Many Books / Mobile Narrow Many Booksで、10冊が3・3・3・1冊に折り返すことを確認できます。

Figmaのモバイル本棚モック（16:38、58:7、58:57、32:130）と現行デスクトップ本棚（191:7253）を基に、装飾を詰めず簡素なグレースケールで実装しています。1000px未満は下部ナビ・104px書影、1000px以上は184pxの左ナビ・128px書影・左寄せの棚へ切り替えます。StorybookのMobile / Desktopでモックの393px / 1296px幅、Desktop Many Booksで折返しを確認できます。Defaultは表示領域の幅に追従します。

棚では書影だけを表示し、書名・著者はボタンの読み上げ名にも含めます。書影9冊はユーザー提供の[Design-Lab（108:24）](https://www.figma.com/design/1A0u8wkpuB25C3apfXIp6X/Design-Lab?node-id=108-24)から個別に取得しています。書名・著者は表紙から転記し、ISBNと書名の読みはopenBDの書誌と照合しました。画像は縦横比を維持して下揃えで全体表示します。分野・タグ・追加日は表示確認用で、実際の所蔵状態やmicroCMSの登録データを示すものではありません。多数冊のStoryだけは、折返し確認のため9冊を繰り返して10冊にしています。

タイトル・著者・ISBNの部分一致検索と、分野・タグの絞り込みを画面内で行います。同じ分類内の複数選択はOR、キーワード・分野・タグの間はANDです。空白区切りの検索語はすべて一致する本を表示します。デフォルトは各棚内・検索結果ともに書名順（読み）です。「検索」はキーワード・分野・技術タグを編集する表示へ切り替わり、「結果を見る」で一括適用します。「戻る」や「本棚」では未適用の入力を破棄し、確定済みの条件・結果を保ちます。結果の冊数は一箇所に表示します。「条件をクリア」だけがキーワードを含む条件を明示的に解除します。条件確認ダイアログは閉じる・Escapeで結果を維持します。追加・金額は「準備中」を見える形で表示します。

並び替え用の`titleReading`は、9冊について2026-10-24にopenBDの`TitleText.collationkey`から取得した読みを保存しています。NFKCで文字幅を揃え、空白を除き、カタカナをひらがなに揃えて日本語の照合順で比較します。数字は2→10の自然順、句読点は比較時に無視し、同じ読みなら書名→IDで順序を固定します。表示のたびに読みを推測・取得しません。外部API連携・辞書による読みの自動生成・CMS保存契約は今回の対象外です。StorybookのTitle Sorted Shelves / Title Sorted Searchで、入力順や追加日に依存しない書名順を確認できます。

書影の公開時の扱いは保留です。現在の画像について公開利用の許諾を確認済みとは扱わず、ローカルでの表示確認を進めます。9冊の実書影PNGは.gitignoreで除外し、公開GitリポジトリやPRには同梱しません。画像を持たないcloneでは「書影を表示できません」の代替表示になります。既存のローカル画像はそのまま保持します。書誌データ・検索・並び替え・Storybookの操作確認は画像がなくても利用できます。

書影URLは表示用型で必須です。画像取得に失敗した場合は「書影を表示できません」と示します。これは書影なし登録を許可する仕様ではありません。CMSの保存形式・API・アップロード処理は今回の表示用型とは分離して後続で実装します。

### 検証と本番ビルド

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

typecheckはNext.jsのroute型を生成してからTypeScriptを検査します。buildもTypeScriptを検査します。設定や依存関係を変えていなければ、同じ差分で両方を重複実行する必要はありません。

現在の本棚サンプルとStorybookは、APIキーやmicroCMSのデータなしで動作します。.env.localはGit管理外で保持し、秘密値をクライアントやStoryへ渡しません。

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

MVPの対象画面は `/`、`/books/[contentId]`、`/bank`、`/books/new` です。現在は `/` の本棚をサンプルで確認できます。他画面と保存処理はモックと確定事項から順次実装します。書影は必須でアプリからmicroCMSへ保存する方針、目次とISBNによる外部取得はMVP対象外です。

## 作業規約

[AGENTS.md](AGENTS.md)、[Development](docs/DEVELOPMENT.md)、[Agent Organization](docs/AGENT_ORGANIZATION.md)、[Coding Guideline](docs/CODING_GUIDELINE.md) を保持しています。これらは作業規約であり、撤去した実装の存続や再採用を要求するものではありません。旧資料への参照は履歴として扱い、現在の仕様には使いません。

## デプロイの停止

再構築中はvercel.jsonのgit.deploymentEnabledをfalseにし、Git連携による自動デプロイを停止します。旧デプロイのNEXT_NO_VERSIONは、Next.jsとpackage.jsonの撤去後も旧ビルド設定が動いたためです。アプリと検証手順が整った時点で、対象Issueの承認を受けて自動デプロイを再開します。既存の公開デプロイを削除する設定ではありません。
