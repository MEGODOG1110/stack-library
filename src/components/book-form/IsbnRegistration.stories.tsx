import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { IsbnRegistration } from "./IsbnRegistration";
import { sampleFormTags, makeSampleCover } from "./book-form.fixtures";
import type { IsbnLookup } from "./isbn-registration.types";
import { liveIsbnLookup } from "@/lib/books/isbn-lookup.client";

const candidate = { title: "サンプル技術書", authors: ["サンプル著者"], isbn: "9784815636623", coverSrc: "/mockups/bookshelf/cover.svg" };
const found: IsbnLookup = async () => ({ status: "found", book: candidate });
const meta = { title: "BookForm/IsbnRegistration", component: IsbnRegistration, args: { tags: sampleFormTags, lookup: found, register: fn(async () => ({ contentId: "sample" })), ownedBooks: [], onExit: fn() }, parameters: { layout: "fullscreen" } } satisfies Meta<typeof IsbnRegistration>;
export default meta;
type Story = StoryObj<typeof meta>;
async function lookup(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "ISBN" }), candidate.isbn);
  await userEvent.click(canvas.getByRole("button", { name: "本の情報を取得" }));
  await expect(await canvas.findByRole("heading", { name: "この本で間違いありませんか？" })).toBeVisible();
  return canvas;
}
export const Mobile: Story = { globals: { viewport: { value: "mobileMock" } } };
export const Desktop: Story = { globals: { viewport: { value: "desktopMock" } } };
export const LiveLookup: Story = { args: { lookup: liveIsbnLookup, register: undefined, notice: "Google Books・openBDから書誌情報と書影を取得します。例: 9784815636623。localhost:3000の起動が必要です。保存は未接続です。" } };
export const PreviewAndRegister: Story = { play: async ({ canvasElement, args }) => {
  const canvas = await lookup(canvasElement);
  await expect(args.register).not.toHaveBeenCalled();
  const button = canvas.getByRole("button", { name: "登録する（サンプル）" });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
  await expect(await canvas.findByRole("heading", { name: "登録完了（サンプル）" })).toBeVisible();
  await expect(args.register).toHaveBeenCalledTimes(1);
} };
export const RegisteredIsbnLink: Story = { args: { sampleRegistration: false, notice: "遷移確認用の模擬登録です。実際には保存しません。" }, play: async ({ canvasElement }) => {
  const canvas = await lookup(canvasElement);
  const button = canvas.getByRole("button", { name: /^登録する$/ });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
  await expect(await canvas.findByRole("link", { name: "登録した本を見る" })).toHaveAttribute("href", `/books/${candidate.isbn}`);
} };
export const AlreadyOwned: Story = { args: { ownedBooks: [{ id: "owned", title: candidate.title, isbn: candidate.isbn }] }, play: async ({ canvasElement, args }) => {
  const canvas = await lookup(canvasElement);
  await expect(canvas.getByRole("link", { name: "登録済みの書籍を見る" })).toHaveAttribute("href", `/books/${candidate.isbn}`);
  await expect(canvas.getByRole("button", { name: "登録する（サンプル）" })).toBeDisabled();
  await expect(args.register).not.toHaveBeenCalled();
} };
export const ManualFallback: Story = { args: { lookup: async () => ({ status: "not-found" }) }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "ISBN" }), candidate.isbn);
  await userEvent.click(canvas.getByRole("button", { name: "本の情報を取得" }));
  await expect(await canvas.findByRole("status")).toHaveTextContent("見つかりませんでした");
  await userEvent.click(canvas.getByRole("button", { name: "情報を取得できない場合は手入力" }));
  await expect(canvas.getByRole("textbox", { name: "ISBN" })).toHaveValue(candidate.isbn);
  await userEvent.type(canvas.getByRole("textbox", { name: "書名（必須）" }), candidate.title);
  await userEvent.type(canvas.getByRole("textbox", { name: "著者（必須）" }), candidate.authors[0]);
  await userEvent.upload(canvas.getByLabelText("表紙画像（必須）"), await makeSampleCover());
  await waitFor(() => expect(canvas.getByText("選択済み（未保存）")).toBeVisible());
  await userEvent.click(canvas.getByRole("button", { name: "プレビューへ" }));
  await expect(await canvas.findByRole("heading", { name: candidate.title })).toBeVisible();
  await userEvent.click(canvas.getByRole("button", { name: "不足情報の入力・修正" }));
  await waitFor(() => expect(canvas.getByText("選択済み（未保存）")).toBeVisible());
  await userEvent.click(canvas.getByRole("button", { name: "プレビューへ" }));
  await waitFor(() => expect(canvas.getByRole("button", { name: "登録する（サンプル）" })).toBeEnabled());
} };
export const LookupError: Story = { args: { lookup: async () => { throw new Error("sample failure"); } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "ISBN" }), candidate.isbn);
  await userEvent.click(canvas.getByRole("button", { name: "本の情報を取得" }));
  await expect(await canvas.findByRole("alert")).toHaveTextContent("情報を取得できませんでした");
  await expect(canvas.getByRole("textbox", { name: "ISBN" })).toHaveValue(candidate.isbn);
} };
export const SaveFailure: Story = { args: { register: fn(async () => { throw new Error("sample failure"); }) }, play: async ({ canvasElement }) => {
  const canvas = await lookup(canvasElement);
  const button = canvas.getByRole("button", { name: "登録する（サンプル）" });
  await waitFor(() => expect(button).toBeEnabled());
  await userEvent.click(button);
  await expect(await canvas.findByRole("alert")).toHaveTextContent("内容を保持しています");
  await expect(canvas.getByRole("heading", { name: candidate.title })).toBeVisible();
} };
export const MissingCover: Story = { args: { lookup: async () => ({ status: "found", book: { ...candidate, coverSrc: undefined } }) }, play: async ({ canvasElement }) => {
  const canvas = await lookup(canvasElement);
  await expect(canvas.getByRole("alert")).toHaveTextContent("表紙画像：取得できませんでした");
  await expect(canvas.getByRole("button", { name: "登録する（サンプル）" })).toBeDisabled();
} };
export const TitleConfirmation: Story = { args: { ownedBooks: [{ id: "same-title", title: candidate.title }] }, play: async ({ canvasElement }) => {
  const canvas = await lookup(canvasElement);
  const button = canvas.getByRole("button", { name: "登録する（サンプル）" });
  await expect(button).toBeDisabled();
  await userEvent.click(canvas.getByRole("checkbox"));
  await waitFor(() => expect(button).toBeEnabled());
} };
export const InvalidIsbn: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "ISBN" }), "123");
  await userEvent.click(canvas.getByRole("button", { name: "本の情報を取得" }));
  await expect(canvas.getByText("ISBNは正しい13桁の番号を入力してください")).toBeVisible();
} };
export const PrintPriceAutofill: Story = { args: { lookup: async () => ({ status: "found", book: { ...candidate, registeredPrice: 2860, priceNote: "税込定価補完の表示確認用サンプルです。" } }) }, play: async ({ canvasElement }) => {
  const canvas = await lookup(canvasElement);
  await expect(canvas.getByText("2860円")).toBeVisible();
  await userEvent.click(canvas.getByRole("button", { name: "不足情報の入力・修正" }));
  await expect(canvas.getByRole("textbox", { name: "税込価格" })).toHaveValue("2860");
} };
export const CancelStaleLookup: Story = { args: { lookup: async () => { await new Promise((resolve) => setTimeout(resolve, 500)); return { status: "found", book: candidate }; } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole("textbox", { name: "ISBN" }), candidate.isbn);
  await userEvent.click(canvas.getByRole("button", { name: "本の情報を取得" }));
  await userEvent.click(await canvas.findByRole("button", { name: "取得を中止" }));
  await new Promise((resolve) => setTimeout(resolve, 600));
  await expect(canvas.getByRole("textbox", { name: "ISBN" })).toHaveValue(candidate.isbn);
  await expect(canvas.queryByRole("heading", { name: "この本で間違いありませんか？" })).not.toBeInTheDocument();
} };
