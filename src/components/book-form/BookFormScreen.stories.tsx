import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BookFormScreen } from "./BookFormScreen";
import { sampleFormTags } from "./book-form.fixtures";
const meta = { title: "BookForm/BookFormScreen", component: BookFormScreen, args: { tags: sampleFormTags, onExit: fn() }, parameters: { layout: "fullscreen", viewport: { options: {
  mobileMock: { name: "Mobile mock (393px)", styles: { width: "393px", height: "852px" }, type: "mobile" },
  desktopMock: { name: "Desktop mock (1296px)", styles: { width: "1296px", height: "852px" }, type: "desktop" },
} } } } satisfies Meta<typeof BookFormScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Light: Story = { globals: { theme: "light" } };
export const Dark: Story = { globals: { theme: "dark" } };
export const Mobile: Story = { globals: { viewport: { value: "mobileMock", isRotated: false } } };
export const Desktop: Story = { globals: { viewport: { value: "desktopMock", isRotated: false } } };
export const LeaveConfirmation: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "書名（必須）" }), "入力途中の本");
  await userEvent.click(canvas.getByRole("link", { name: "本棚に戻る" }));
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.click(canvas.getByRole("button", { name: "入力を続ける" }));
  await expect(canvas.getByRole("textbox", { name: "書名（必須）" })).toHaveValue("入力途中の本");
  await expect(args.onExit).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole("link", { name: "本棚に戻る" }));
  await userEvent.click(canvas.getByRole("button", { name: "破棄して戻る" }));
  await expect(args.onExit).toHaveBeenCalledWith("/");
} };
