import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookTags } from "./BookTags";
import { specimenBook } from "./book-detail.fixtures";
const meta = { title: "BookDetail/BookTags", component: BookTags, args: { tags: specimenBook.tags } } satisfies Meta<typeof BookTags>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { tags: [] } };
export const LongLabels: Story = { args: { tags: [{ id: "long", label: "コンポーネント設計とアクセシビリティを考慮したインターフェース開発" }, ...specimenBook.tags] } };
