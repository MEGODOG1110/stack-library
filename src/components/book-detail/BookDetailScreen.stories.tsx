import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BookDetailScreen } from "./BookDetailScreen";
import { detailBooks, specimenBook } from "./book-detail.fixtures";
const meta = {
  title: "BookDetail/BookDetailScreen", component: BookDetailScreen,
  parameters: { layout: "fullscreen", viewport: { options: {
    mobileMock: { name: "Mobile mock (393px)", styles: { width: "393px", height: "852px" }, type: "mobile" },
    mobileNarrow: { name: "Mobile narrow (320px)", styles: { width: "320px", height: "852px" }, type: "mobile" },
    desktopMock: { name: "Desktop mock (1296px)", styles: { width: "1296px", height: "852px" }, type: "desktop" },
  } } },
  args: { book: detailBooks[0] },
} satisfies Meta<typeof BookDetailScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobileMock", isRotated: false } } };
export const Desktop: Story = { globals: { viewport: { value: "desktopMock", isRotated: false } } };
export const WithOptionalInformation: Story = { args: { book: specimenBook } };
export const MissingOptionalInformation: Story = { args: { book: { ...specimenBook, isbn: undefined, publisher: undefined, editionPublicationText: undefined, registeredPrice: undefined, readingStatus: undefined, summary: undefined, tags: [] } } };
export const ZeroPrice: Story = { args: { book: { ...specimenBook, registeredPrice: 0 } }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("￥0", { exact: true })).toBeVisible();
  await expect(canvas.getByRole("button", { name: "読書状況の変更（準備中）" })).toBeDisabled();
  await expect(canvas.queryByRole("heading", { name: "目次" })).not.toBeInTheDocument();
} };
export const Reading: Story = { args: { book: { ...specimenBook, readingStatus: "reading" } } };
export const Read: Story = { args: { book: { ...specimenBook, readingStatus: "read" } } };
export const CoverError: Story = { args: { book: { ...specimenBook, coverSrc: "/missing-detail-cover.png" } } };
export const LongContent: Story = { args: { book: { ...specimenBook, title: "購入前に所蔵を確認するための長い書名・複数著者と長文の表示確認サンプル", summary: "概要の改行と長文の表示確認。\n".repeat(80) } }, globals: { viewport: { value: "desktopMock", isRotated: false } } };
const back = fn();
export const BackInteraction: Story = { args: { book: specimenBook, backControl: <button onClick={back} aria-label="戻る">戻る</button> }, play: async ({ canvasElement }) => {
  await userEvent.click(within(canvasElement).getByRole("button", { name: "戻る" }));
  await expect(back).toHaveBeenCalledOnce();
} };
