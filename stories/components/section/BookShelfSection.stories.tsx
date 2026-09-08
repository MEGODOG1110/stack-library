import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookShelfSection } from "@/components/section/BookShelfSection";
import { libraryBooks, makeBook } from "../../fixtures/books";

const shelfBooks = Array.from({ length: 9 }, (_, index) => {
  const book = libraryBooks[index % libraryBooks.length];
  const coverNumber = String(index + 1).padStart(2, "0");

  return makeBook({
    ...book,
    contentId: `storybook-shelf-${coverNumber}`,
    coverImageUrl: `/assets/covers/book-${coverNumber}.jpg`,
    title: `${book.title} ${index + 1}`,
  });
});

const meta = {
  title: "Components/Section/BookShelfSection",
  component: BookShelfSection,
  args: {
    books: shelfBooks,
  },
  decorators: [
    (Story) => (
      <div className="storybook-canvas">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "本棚の見出し、冊数、フラットなレール、書影・書名・著者を含む蔵書一覧の表示責務を持つPatternです。詳細な書誌情報と読書状態は遷移先へ委譲します。",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookShelfSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongJapaneseTitles: Story = {
  args: {
    books: [
      makeBook({
        contentId: "storybook-shelf-long-title",
        title:
          "長期運用される大規模フロントエンドのためのコンポーネント設計とアクセシビリティ検証",
        authors: ["技術標本研究会"],
        coverImageUrl: "/assets/covers/book-10.jpg",
      }),
      makeBook({
        contentId: "storybook-shelf-second-book",
        title: "分散システムの境界を読み解く実践設計",
        authors: ["設計観測室"],
        coverImageUrl: "/assets/covers/book-11.jpg",
      }),
    ],
  },
};

export const Narrow320: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
