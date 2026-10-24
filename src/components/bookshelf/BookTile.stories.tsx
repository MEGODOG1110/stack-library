import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BookTile } from "./BookTile";
import { shelfBooks } from "./bookshelf.fixtures";
const meta = { title: "Bookshelf/BookTile", component: BookTile, args: { book: shelfBooks[0], onSelect: fn() } } satisfies Meta<typeof BookTile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongTitle: Story = { args: { book: shelfBooks[3] } };
