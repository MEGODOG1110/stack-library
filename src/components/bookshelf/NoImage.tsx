import Image from "next/image";
import styles from "./NoImage.module.css";

/** 書影の読込失敗表示。画像なしでの蔵書登録を許可する状態ではない。 */
export function NoImage({ size = "shelf" }: { size?: "shelf" | "detail" }) {
  return <span className={styles["SL-el_no-image"]} data-size={size} role="img" aria-label="NoImage（書影を表示できません）">
    <Image src="/mockups/bookshelf/noimage/noimage.svg" width={104} height={157} alt="" unoptimized />
  </span>;
}
