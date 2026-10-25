import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { CoverPicker } from "./CoverPicker";
import { makeSampleCover } from "./book-form.fixtures";
const meta = { title: "BookForm/CoverPicker", component: CoverPicker, args: { id: "cover-story", onChange: fn() }, decorators: [(Story) => <div style={{ maxWidth: 420, padding: 16, background: "var(--sl-color-background)", color: "var(--sl-color-text)" }}><Story /></div>] } satisfies Meta<typeof CoverPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const PreviewAndRemove: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.upload(canvas.getByLabelText("表紙画像（必須）"), await makeSampleCover());
  await waitFor(() => expect(canvas.getByText("選択済み（未保存）")).toBeVisible());
  await expect((canvas.getByLabelText("表紙画像（必須）") as HTMLInputElement).files?.[0]?.name).toBe("sample-cover.png");
  await expect(args.onChange).toHaveBeenLastCalledWith(expect.any(File));
  await userEvent.click(canvas.getByRole("button", { name: "画像を外す" }));
  await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  await expect(args.onChange).toHaveBeenLastCalledWith(undefined);
} };
export const InvalidFormat: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.setup({ applyAccept: false }).upload(canvas.getByLabelText("表紙画像（必須）"), new File(["text"], "sample.txt", { type: "text/plain" }));
  await expect(canvas.getByRole("alert")).toHaveTextContent("JPEG・PNG・WebPの画像を選択してください");
} };
export const DecodeFailure: Story = { play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.upload(canvas.getByLabelText("表紙画像（必須）"), new File(["broken"], "broken.png", { type: "image/png" }));
  await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent("画像を読み込めませんでした"));
  await expect(args.onChange).not.toHaveBeenCalledWith(expect.any(File));
} };
