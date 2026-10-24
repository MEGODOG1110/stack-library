import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { BookMetadata } from "./BookMetadata";
const meta = { title: "BookDetail/BookMetadata", component: BookMetadata, args: { items: [{ label: "登録価格（税込）", value: "￥3,520" }, { label: "読書状況", value: "積読" }] } } satisfies Meta<typeof BookMetadata>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ZeroAndMissing: Story = { args: { items: [{ label: "登録価格（税込）", value: 0 }, { label: "読書状況" }] }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("0", { exact: true })).toBeVisible();
  await expect(canvas.getByText("未登録")).toBeVisible();
} };
