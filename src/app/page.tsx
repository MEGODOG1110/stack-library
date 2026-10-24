import styles from "./page.module.css";
import { BookshelfScreen } from "@/components/bookshelf/BookshelfScreen";
import { shelfAreas, shelfBooks, shelfTags } from "@/components/bookshelf/bookshelf.fixtures";

export default function HomePage() {
  return (
    <main>
      <p className={styles["SL-el_sample-notice"]}>表示確認用サンプル・データ保存なし</p>
      <BookshelfScreen books={shelfBooks} areas={shelfAreas} tags={shelfTags} />
    </main>
  );
}
