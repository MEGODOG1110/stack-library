import type { ReactNode } from "react";

type BookShelfProps = {
  children?: ReactNode;
};

export function BookShelf({ children }: BookShelfProps) {
  return (
    <div className="SL-ly_book-shelf">
      <div className="SL-ly_book-shelf__surface">{children}</div>
    </div>
  );
}
