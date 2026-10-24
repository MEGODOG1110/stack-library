import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { NoImage } from "./NoImage";
const meta = {
  title: "Bookshelf/NoImage", component: NoImage, args: { size: "shelf" },
  decorators: [(Story) => <div style={{ width: 104, height: 157 }}><Story /></div>],
} satisfies Meta<typeof NoImage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("img", { name: "NoImage（書影を表示できません）" })).toBeVisible();
  await expect(canvas.getByRole("img", { name: "NoImage（書影を表示できません）" }).querySelector("img")).toHaveAttribute("src", "/mockups/bookshelf/noimage/noimage.svg");
} };
export const Detail: Story = { args: { size: "detail" } };
