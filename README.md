# Stack Library

**再構築中です。仕様・検証記録の正本はLinearです。本棚・検索・詳細はmicroCMSの実データを表示します。本番の書籍登録はGitHubの所有者アカウントに限定します（MEG-40）。**

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

実際の依存バージョンはpackage.jsonとpnpm-lock.yamlで固定します。公開先は[Stack Library](https://stack-library.vercel.app/)です。

### ホーム画面へ追加する（PWA / MEG-41）

[本番サイト](https://stack-library.vercel.app/)を端末のブラウザで開いて追加できます。

- iPhone・iPad：Safariの共有メニュー →「ホーム画面に追加」。表示される場合は「Webアプリとして開く」をオンにします。
- Android：Chromeのメニュー →「ホーム画面に追加」→「インストール」。
- PC：Chrome・Edgeのアドレスバーのインストールボタン、またはブラウザメニューから追加します。

追加後は提供いただいた本棚アイコンで起動し、アドレスバーのないアプリ用ウィンドウで本棚を開きます。ISBN補完・書籍登録には本人のGitHubログインとインターネット接続が必要です。PWA用のオフライン保存・登録の自動再送・push通知は追加していません。Service WorkerでAPIや認証情報をキャッシュしません。

`src/app/manifest.ts`で表示名・起動URL・単独表示を設定しています。アイコンの元データは`public/icons/stack-library.svg`です。PNGは同SVGを192px・512px・Apple用180px・favicon用32pxへ変換したものです。maskableとApple用は角まで暗色の背景を敷き、本のシンボルを安全領域内に保っています。新しい依存ライブラリや独自のインストールダイアログは追加していません。

### 本番の本人限定登録（MEG-40）

スマホで「追加」を開くとGitHubログインへ進み、所有者（GitHub ID `63797040`）のみISBN補完・書影アップロード・登録を利用できます。アカウント名やメールアドレスでは許可しません。本棚・検索・詳細の閲覧にはログイン不要です。Auth.js `next-auth@5.0.0-beta.32`を固定し、暗号化JWTセッションを7日保持します。GitHubのアクセストークンはブラウザへ渡さず、DBやユーザー登録機能は追加しません。「ログアウト」で端末のセッションを終了できます。

VercelのProductionに次を設定します。秘密値はリポジトリ・チャットへ記載しません。

| 環境変数 | 内容 |
|---|---|
| `AUTH_GITHUB_ID` | GitHub OAuth AppのClient ID |
| `AUTH_GITHUB_SECRET` | 同AppのClient secret |
| `AUTH_SECRET` | 暗号学的乱数で生成した32バイト以上のセッション秘密鍵 |
| `AUTH_URL` | `https://stack-library.vercel.app` |
| `GOOGLE_BOOKS_API_KEY` | Books API専用のサーバーキー。自宅IPの制限はVercelでは利用不可 |
| `MICROCMS_SERVICE_DOMAIN` | `stack-library` |
| `MICROCMS_API_KEY` | 既存のbooks GET/POST・post-media権限を持つキー |

GitHub OAuth AppのHomepage URLは本番URL、Authorization callback URLは `https://stack-library.vercel.app/api/auth/callback/github` です。Previewで本番OAuth Appを使い回しません。設定後は再デプロイが必要です。

登録ページに加えて、`/api/books/lookup`と`POST /api/books`もサーバーで本人を確認します。未認証は401、保存の異なるOriginは403、設定不足は登録を開放しません。localhostのdevelopmentとローカルStorybookは従来どおり利用可能で、productionモードにローカル例外はありません。セッション切れ後の再ログインは別タブで行うと入力を維持できます。

実サービスへの試験登録は書籍・書影を作成します。認証の検証と実登録の検証は分け、実登録は明示された1冊を確認して実行します。書影の公開時の扱いは引き続き保留です。

### 本番のGoogle Books接続（MEG-40）

Vercel Functionsは`vercel.json`の`regions: ["hnd1"]`で東京に固定します。2026-10-25の比較では、米国`iad1`からGoogle BooksへHTTP503/`backendFailed`が継続し、同じキー・検索条件を東京`hnd1`から実行するとHTTP200と書誌・書影の取得を確認しました。キーの空白・渡し方・公式ホストの変更だけでは解消しませんでした。Google内部の障害箇所を特定したという意味ではありません。

キーは[Google推奨のヘッダー](https://docs.cloud.google.com/docs/authentication/api-keys-use)でサーバーから渡し、URLには含めません。5xxだけは`www.googleapis.com`と[公式SDKの接続先](https://googleapis.dev/nodejs/googleapis/latest/books/classes/Books.html)`books.googleapis.com`の間で最大2回切り替えます。401/403/429の再送・無認証への切替はせず、全体20秒の上限を維持します。ISBN検索0件の場合はopenBDから書名を補い、Googleの候補と詳細のISBNが完全一致するものだけ採用します。書影や書誌を固定データで補いません。診断用の比較入口は調査後に除去しています。

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

[localhost:3000](http://localhost:3000/)で本棚のサンプルを表示します。書影を選ぶと書籍詳細ページ、「追加」で登録フォームへ進みます。金額画面は準備中です。

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

書影URLは表示用型で必須です。画像取得に失敗した場合は、ユーザー提供のnoimage.svg（グレー背景・開いた本のシンボル・NoImageラベル）を、そのまま縦横比を保って表示します。読み上げには書影を表示できない状態を伝え、書籍ボタンの書名・著者も保持します。BookCoverのImage Error / Detail Image ErrorとNoImageのStoryで確認できます。これは書影なし登録を許可する仕様ではありません。CMSの保存形式・API・アップロード処理は今回の表示用型とは分離して後続で実装します。

### 書籍詳細の実装範囲（MEG-36）

Figmaのモバイル18:466・デスクトップ191:7560を基に、書影・書誌情報→技術タグ・蔵書情報・概要を最小構成で表示します。目次は確定事項どおり対象外です。読書状況の変更・編集・削除は実装していません。登録価格0円と未登録を区別し、ISBN・タグ・概要などの欠損は未登録と表示します。出版社・版出版情報は値がある場合だけ表示し、推測で補完しません。

BookDetail配下のStorybookはBookMetadata（項目と値）・BookTags（表示専用タグ）→BookIdentity（書影と書誌）→BookDetailScreen（画面）の順で確認できます。既存BookCoverに詳細用サイズを追加しています。Mobile / Desktop、任意情報あり・欠損、0円、書影エラー、長文、戻る操作のStoryを用意しています。実在9冊に架空の出版情報・価格・概要を加えず、任意情報のStoryには明示した架空データを使います。読書状況の積読は既定値の表示確認用です。

1000px未満では書影約73×110pxと縦積み、1000px以上では184px左ナビ・146×220px書影・下段2列です。PCの長文は補足情報の領域だけスクロールでき、書誌情報を先に確認できます。モックのOS表示・端末枠・目次は取り込みません。配色や装飾の作り込みは後続です。

`/books/figma-design-system`など、9冊のIDで詳細を確認できます。不明なIDは「書籍が見つかりません」と表示します。本棚から選択した際の確定キーワード・分野・タグは戻り先URLに、スクロール位置・選択書籍は一時的なsessionStorageに保持します。「本棚に戻る」で元の条件へ戻り、直接開いた場合は本棚へ戻ります。storageが使えない環境でもURLの条件は維持しますが、スクロール・フォーカス復帰は省略します。実データの保存・外部API連携はありません。

### 登録画面の実装範囲（MEG-39）

`/books/new`はISBN入力→情報補完→プレビュー→登録の順に進む確認画面です（MEG-39）。手入力は取得できない場合や不足情報を補うために使います。補完は`/api/books/lookup`からGoogle Booksを検索し、未取得ならopenBDの書名で再検索する実取得です。ISBN完全一致を確認し、詳細のmedium画像を優先します。20秒タイムアウト、キャッシュなし。サーバー専用の`GOOGLE_BOOKS_API_KEY`を`.env.local`に設定してください。microCMSへのローカル登録経路は接続済みですが、実保存は未検証です。StorybookのLive Lookupも同じAPIへ接続し、localhost:3000の起動が必要です。他のStoryは再現可能なサンプル処理です。指定5冊で書誌と書影を実取得しました。3冊は高解像度、2冊は128px幅のみです。取得できない書影はNoImageと不足状態を表示します。取得した情報の公開・保存の利用条件を解決したとは扱いません。実登録画面の重複確認はmicroCMS側のISBNで行います。Storybookの9冊は表示確認用サンプルです。StorybookのBookForm/IsbnRegistrationでは、未所蔵のプレビュー・登録成功のサンプル、重複、取得失敗、手入力、書影不足、保存失敗を確認できます。既存フォームは補助手段として再利用しています。Figmaのモバイル16:297・必須エラー162:86、PC191:7465・191:7864を基に、FormField（ラベル・入力・説明・エラー）／TagSelector（複数選択）／CoverPicker（画像選択・プレビュー）→BookForm→BookFormScreenの順で構成しています。StorybookのBookForm配下で各部品とMobile / Desktopを確認できます。

書名・著者・表紙画像は必須です。著者は改行ごとに1名とし、編者・団体名も入力できます。ISBNは必須、出版社・分野・検索語・税込価格は任意です。ISBNは13桁のチェック桁を確認し、全角数字やハイフンを正規化します。価格0円と空欄を区別します。目次・読書状況の変更・バーコードはありません。ISBNによる外部補完を使用します。

画像はJPEG・PNG・WebP、5MB以下を選択でき、ブラウザーで読み込めた場合だけ入力確認に使えます。未選択・読込中・読込成功・失敗を区別します。ファイルの形式違い・読込失敗時も書名などの入力を保持します。画像の選び直し・解除・画面終了時に作成した一時URLを解放します。アプリからのアップロードも5MB以下です。

「入力内容を確認」は入力検証のみで、保存・アップロード・重複登録チェックを行いません。確認後も「保存はまだ行っていません」と表示します。新しい画面ではサンプルデータに対する同一ISBNの登録阻止・同名書籍の確認と続行を行います。Storybookの保存中・失敗・完了は模擬処理です。実登録画面はサーバー検証・画像アップロード・書籍保存・読戻しまで接続し、保存結果が不明な場合は再登録を停止します。実保存の一連の確認は未完了です。

モバイルは縦積み、1000px以上は184pxの左ナビと2列のフォームです。本文だけスクロールし、下端の確認ボタンと重ならない構成です。入力後にアプリ内の戻る・本棚・検索を選ぶと破棄確認を表示し、「入力を続ける」で内容と画像を保持します。更新・タブを閉じる際はブラウザー標準の確認を使います。ブラウザーの履歴戻る操作自体の独自な離脱制御は未実装です。

### 検証と本番ビルド

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

typecheckはNext.jsのroute型を生成してからTypeScriptを検査します。buildもTypeScriptを検査します。設定や依存関係を変えていなければ、同じ差分で両方を重複実行する必要はありません。

本棚・詳細の実画面にはmicroCMSの設定が必要です。通常のStorybookはAPIキーなしのfixtureで動作し、Live Lookupだけは起動中のアプリを経由して実取得します。.env.localはGit管理外で保持し、秘密値をクライアントやStoryへ渡しません。

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

MEG-34の確定事項からデータ契約と最小構成を定義し、必要な資産だけを新規実装します。既存の型・スキーマの再採用は前提にしません。登録はISBN補完を主導線とし、手入力は補助手段とします。外部書誌APIの接続は後続実装で、カメラ読取・編集削除は対象外です。最新の詳細はLinearで確認してください。

MVPの対象画面は `/`、`/books/{ISBN13}`、`/bank`、`/books/new` です。現在は `/` の本棚をサンプルで確認できます。他画面と保存処理はモックと確定事項から順次実装します。書影は必須です。ISBNによる外部補完は実装中、目次はMVP対象外です。microCMSへのローカル登録経路は接続済みですが、実保存は未検証です。

## 作業規約

[AGENTS.md](AGENTS.md)、[Development](docs/DEVELOPMENT.md)、[Agent Organization](docs/AGENT_ORGANIZATION.md)、[Coding Guideline](docs/CODING_GUIDELINE.md) を保持しています。これらは作業規約であり、撤去した実装の存続や再採用を要求するものではありません。旧資料への参照は履歴として扱い、現在の仕様には使いません。

## デプロイの停止

再構築中はvercel.jsonのgit.deploymentEnabledをfalseにし、Git連携による自動デプロイを停止します。旧デプロイのNEXT_NO_VERSIONは、Next.jsとpackage.jsonの撤去後も旧ビルド設定が動いたためです。アプリと検証手順が整った時点で、対象Issueの承認を受けて自動デプロイを再開します。既存の公開デプロイを削除する設定ではありません。

### MEG-39 登録項目の整理

必須は書名・著者1名以上・書影・ISBN。出版社・技術分野・検索語・税込価格は任意。版・出版年は登録フォームと通常プレビューから除外します。CMSの発売日・版は任意のまま残し、年月を日付に推測変換しません。読書状態は積読を自動設定する設計です。

提供スキーマに対する変更案は、coverを必須へ変更、titleReading（並び替え用の任意テキスト）の追加、technicalAreasとlevelの存在しないDEFAULT初期値を未設定へ変更です。CMS側の変更は未実施です。

### 書影・技術タグを含むローカル登録（MEG-39 v7）

現在は`/books/new`の登録ボタンから、画像アップロード→Content APIの書籍作成→読戻し確認へ接続しています。実CMS書込みは未検証です。

管理画面の設定:
- books → API設定 → APIスキーマ: 既存の`keywords`をテキストエリア・任意のまま使用。`cover`は画像・必須へ変更。
- サービス設定 → APIキー: `MICROCMS_API_KEY`のContent API権限はbooksのGET/POSTのみ。
- 既存APIキーでManagement API権限「メディアのアップロード」を有効化。API一覧・スキーマ取得・削除等は不要。
- 書影アップロードも既存の`MICROCMS_API_KEY`を使用します。別のキーや環境変数は不要です。値をチャット・Gitへ貼らない。
- 既存の`MICROCMS_SERVICE_DOMAIN`と`MICROCMS_API_KEY`を使用。追加の登録スイッチは不要です。

画像はJPEG/PNG/WebPで5MB以下。選択ファイルまたはGoogleの許可ホストのHTTPS書影のみ受け付けます。画像POSTはManagement API、書籍GET/POSTはContent API。登録済みサンプルではなくCMS側でISBN重複を確認します。分野は6分類の選択肢の値、検索語はkeywordsへ改行区切りで保存し、価格0も保持します。保存失敗でも入力を保持、成否不明時は同じ画面で再登録を停止します。画像成功後に書籍保存が失敗すると孤立メディアが残る可能性があり、自動削除しません。並行プロセス間の重複保証は未完成です。

MEG-40で本番はGitHub所有者のログイン後に登録可能とします。本棚・検索・詳細は保存先と同じmicroCMSを読み取ります。Storybookは誤書込みを避け、Live Lookupも実保存を接続しません。実登録はアプリの `/books/new` から明示操作してください。ログイン設定と検証範囲は上記「本番の本人限定登録」を参照してください。

### v8 設定制約の見直し

ローカル登録にMICROCMS_REGISTRATION_ENABLEDとMICROCMS_MEDIA_API_KEYは不要です。既存のMICROCMS_API_KEYをContent GET/POSTとpost-mediaで共用します。空のtechnicalTagsは送信しないため、タグ未選択ならタグフィールド追加を前提にしません。Google書影の許可ホスト間リダイレクトは3回まで追従し、異なるホスト・HTTP・非標準portは拒否します。任意文字列の空値と未設定をread-backで同一視し、価格0は保持します。

### CMS表示統合（MEG-39）

アプリの本棚・検索結果・書籍詳細はmicroCMS Content APIのbooksを取得します。100件単位で全件取得し、書名の読みがある場合はそれで、未登録なら書名そのもので並び替えます。読みの自動推定はしません。分野は確定した6分類、検索語の絞り込み選択肢は既存keywordsから構成します。CMSが空なら0冊、取得失敗はエラーと再試行を表示し、サンプルへ置き換えません。取得はno-storeでCMS編集を次回取得時に反映します。Storybookのみfixtureを使用します。

### v9 分類と検索語の確定

登録フォームは任意の6分類（複数選択）と任意の検索語（1行1語）。保存先は既存のtechnicalAreasとkeywordsのみ。technicalTags新設は不要で、読取・書込とも使用しません。分野内OR、検索語内OR、通常キーワード・分野・検索語の間AND。通常検索は書名・著者・ISBN・keywordsを対象にします。棚は同じ本を一回だけ表示します。

microCMS管理画面のbooks→API設定→APIスキーマ→technicalAreasで、以下の値を追加してください。型select、複数選択ON、必須OFF、初期値なし。
- Web・アプリ開発
- プログラミング・設計
- インフラ・運用
- データ・データベース
- AI
- デザイン

AI・デザインが既にあれば重複追加しません。旧値を先に削除しないでください。旧フロントエンド/バックエンド/モバイル→Web・アプリ開発、プログラミング言語/アーキテクチャ/テスト→プログラミング・設計、インフラ/DevOps/セキュリティ→インフラ・運用、データ/データベース→データ・データベース。既存recordを変更後に旧選択肢を削除します。アプリは移行中も旧値を6分類へ読み替えます。

keywordsは既存の任意テキストエリアを維持。technicalTagsを既に作成・入力した場合は、その内容をkeywordsへ移してから非表示/削除を判断してください。アプリによる自動データ移行やschema更新は行っていません。分野を選んだ新規保存は、新しい6分類の値をCMSへ追加してから試してください。分野未選択なら旧schemaでも保存できます。

### 紙の本の税込定価（MEG-39 v11）

openBDの入力ISBNに一致する円建て税抜定価（PriceType01/03）へ10％加算し、1円未満を切り捨てて自動補完します。税込02/04はそのままで二重課税しません。価格競合・外貨・明示電子形式は採用しません。紙onlyの利用者前提で、ProductForm未提供でも税抜定価を使用します。Googleの電子書籍価格は使用しません。

指定5冊の実アプリAPIで順に2860/2860/2640/3520/2640円を確認しました。算出方法をpreviewへ表示し、登録前に修正できます。Google取得失敗時もopenBDで取得した書誌/価格は返します。実CMSへの登録・既存価格の変更は行っていません。

### v12 ISBN必須と詳細URL

登録はISBN13必須。ハイフン・空白・全角数字を正規化し、checksumを検証します。取得できない場合の手入力でもISBNは必要です。詳細URLは`/books/{ISBN13}`、本棚からの選択・登録済み案内・登録後の「登録した本を見る」も統一。旧CMS IDのURLはISBN URLへredirectし、検索条件の戻り先を維持します。既存ハイフン付きISBNは読取・重複チェックで正規化、同じISBNの複数レコードは任意の一件を選ばずerrorにします。

CMS管理画面でもbooksのpublicationを必須ON、カスタムpublication内のisbnを必須ONにすると整合します。CMSのデータやschemaは今回変更していません。ISBN未設定の旧recordがある場合は先に補完してください。
