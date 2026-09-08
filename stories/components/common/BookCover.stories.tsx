import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BookCover } from "@/components/common/BookCover";
import { BookShelf } from "@/components/layout/BookShelf";
import { makeBook } from "../../fixtures/books";

const meta = {
  title: "Components/Common/BookCover",
  component: BookCover,
  args: {
    book: makeBook({ coverImageUrl: undefined, title: "テスト書籍" }),
    variant: "detail",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: /テスト書籍/ }),
    ).toBeVisible();
  },
};

export const DecorativePlaceholder: Story = {
  args: {
    decorative: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};

export const ShelfDecorativePlaceholder: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <BookShelf>
        <BookCover
          book={makeBook({ coverImageUrl: undefined, title: "書影のない技術書" })}
          decorative
          variant="shelf"
        />
      </BookShelf>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("書影なし")).toBeVisible();
    await expect(canvas.queryByRole("img")).toBeNull();
  },
};
