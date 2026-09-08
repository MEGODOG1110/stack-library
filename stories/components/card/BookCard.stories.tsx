import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { BookCard } from "@/components/card/BookCard";
import { baseBook, makeBook } from "../../fixtures/books";

const meta = {
  title: "Components/Card/BookCard",
  component: BookCard,
  args: {
    book: baseBook,
  },
  decorators: [
    (Story) => (
      <div className="storybook-canvas storybook-canvas--component">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "蔵書一覧の1冊を、書影・書名・著者を含む詳細への単一リンクとして示すCompositeです。書誌情報や読書状態は詳細画面へ委譲します。",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoverUnavailable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("link", { name: "CSS設計完全ガイド" });

    await expect(card).toHaveAccessibleName("CSS設計完全ガイド");
    await expect(card).toHaveAccessibleDescription("Stack Library編集部");
    await expect(card).toHaveAttribute("href", "/books/storybook-css-design");
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};

export const CoverAvailable: Story = {
  args: {
    book: makeBook({
      coverImageUrl: "/assets/covers/book-01.jpg",
      title: "Clean Code",
    }),
  },
};

export const Hover: Story = {
  args: {
    book: makeBook({
      coverImageUrl: "/assets/covers/book-01.jpg",
      title: "百年の孤独（新潮文庫）",
      authors: ["G・ガルシア＝マルケス"],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("link", {
      name: "百年の孤独（新潮文庫）",
    });
    const beforeHover = card.getBoundingClientRect();

    await userEvent.hover(card);
    const afterHover = card.getBoundingClientRect();

    await expect(afterHover.width).toBe(beforeHover.width);
    await expect(afterHover.height).toBe(beforeHover.height);
    await userEvent.unhover(card);
  },
};

export const Focus: Story = {
  args: {
    book: makeBook({
      contentId: "storybook-focus",
      title: "フォーカス状態を確認する技術書",
      authors: ["アクセシビリティ研究会"],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("link", {
      name: "フォーカス状態を確認する技術書",
    });

    card.focus();

    await expect(card).toHaveFocus();
  },
};

export const LongJapaneseTitle: Story = {
  args: {
    book: makeBook({
      contentId: "storybook-long-title",
      title:
        "長期運用される大規模フロントエンドのためのコンポーネント設計とアクセシビリティ検証",
      authors: ["非常に長い著者名を持つ技術標本研究会", "共同執筆者"],
      coverImageUrl: "/assets/covers/book-02.jpg",
    }),
  },
};
