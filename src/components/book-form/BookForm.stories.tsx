import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { BookForm } from "./BookForm";
import { makeSampleCover, sampleBookDraft, sampleFormTags } from "./book-form.fixtures";
const meta = { title: "BookForm/BookForm", component: BookForm, args: { tags: sampleFormTags, onCheck: fn() }, decorators: [(Story) => <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#fff", color: "#111827" }}><Story /></div>], parameters: { layout: "fullscreen" } } satisfies Meta<typeof BookForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const RequiredErrors: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
  await expect(canvas.getByRole("textbox", { name: "書名（必須）" })).toHaveFocus();
  await expect(canvas.getByText("著者を1名以上入力してください")).toBeVisible();
  await expect(canvas.getByText("表紙画像を選択し、プレビューを確認してください")).toBeInTheDocument();
} };
export const ValidWithZeroPrice: Story = { args: { initialValues: sampleBookDraft }, play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await userEvent.upload(canvas.getByLabelText("表紙画像（必須）"), await makeSampleCover());
  await waitFor(() => expect(canvas.getByText("選択済み（未保存）")).toBeVisible());
  await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
  await expect(args.onCheck).toHaveBeenCalledWith(expect.objectContaining({ registeredPrice: 0, authors: ["サンプル著者A", "サンプル著者B"], isbn: undefined }));
  await expect(canvas.getByText("入力内容を確認しました。保存はまだ行っていません。")).toBeVisible();
  await expect(canvas.queryByLabelText("目次")).not.toBeInTheDocument();
} };
export const InvalidOptionalFields: Story = { args: { initialValues: { ...sampleBookDraft, isbn: "123", price: "-1" } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "入力内容を確認" }));
  await expect(canvas.getByRole("textbox", { name: "ISBN" })).toHaveValue("123");
  await expect(canvas.getByText("ISBNは正しい13桁の番号を入力してください")).toBeVisible();
  await expect(canvas.getByText("税込価格は0以上の数値を入力してください")).toBeInTheDocument();
} };
