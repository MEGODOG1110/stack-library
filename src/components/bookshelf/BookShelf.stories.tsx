import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BookShelf } from "./BookShelf";
import { shelfBooks } from "./bookshelf.fixtures";
import { compareBooksByTitle } from "./BookshelfScreen";
const meta = { title: "Bookshelf/BookShelf", component: BookShelf, args: { label: "フロントエンド棚", books: shelfBooks.filter((book) => book.areaIds.includes("frontend")).sort(compareBooksByTitle), onSelect: fn() } } satisfies Meta<typeof BookShelf>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
