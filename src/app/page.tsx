import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles["SL-ly_development"]}>
      <h1>Stack Library</h1>
      <p>開発環境を準備しました。</p>
      <p>本棚・検索・書籍登録の画面は、これから実装します。</p>
    </main>
  );
}
