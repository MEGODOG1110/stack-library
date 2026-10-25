import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { BookshelfScreen, compareBooksByTitle } from "./BookshelfScreen";
import { shelfAreas, shelfBooks, shelfTags } from "./bookshelf.fixtures";
const meta = {
  title: "Bookshelf/BookshelfScreen",
  component: BookshelfScreen,
  parameters: {
    layout: "fullscreen",
    viewport: { options: {
      mobileMock: { name: "Mobile mock (393px)", styles: { width: "393px", height: "852px" }, type: "mobile" },
      mobileNarrow: { name: "Mobile narrow (320px)", styles: { width: "320px", height: "852px" }, type: "mobile" },
      desktopMock: { name: "Desktop mock (1296px)", styles: { width: "1296px", height: "852px" }, type: "desktop" },
    } },
  },
  args: { books: shelfBooks, areas: shelfAreas, tags: shelfTags },
} satisfies Meta<typeof BookshelfScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Light: Story = { globals: { theme: "light" } };
export const Dark: Story = { globals: { theme: "dark" } };
export const TitleSortedShelves: Story = {
  args: { books: [...shelfBooks].reverse() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expectedShelves = [
      { label: "フロントエンド棚", ids: ["react", "css-design", "ui-ideas"] },
      { label: "デザイン棚", ids: ["web-design", "figma-design-system"] },
      { label: "AI・開発支援棚", ids: ["ai-dialogue", "ai-documents", "codex", "figma-mcp"] },
    ];
    for (const shelf of expectedShelves) {
      const section = canvas.getByRole("heading", { name: shelf.label }).closest("section")!;
      await expect(within(section).getAllByRole("button").map((button) => button.getAttribute("aria-label")?.split(" / ")[0]))
        .toEqual(shelf.ids.map((id) => shelfBooks.find((book) => book.id === id)!.title));
    }
  },
};
export const TitleSortedSearch: Story = {
  args: { books: [...shelfBooks].reverse(), initialFilters: { areaIds: shelfAreas.map((area) => area.id), tagIds: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expectedIds = ["ai-dialogue", "ai-documents", "codex", "react", "css-design", "ui-ideas", "figma-mcp", "web-design", "figma-design-system"];
    await expect(canvas.getAllByRole("button", { name: /書籍を確認/ }).map((button) => button.getAttribute("aria-label")?.split(" / ")[0]))
      .toEqual(expectedIds.map((id) => shelfBooks.find((book) => book.id === id)!.title));
    await expect(canvas.getByRole("status")).toHaveTextContent("9冊");
    const sameTitle = { ...shelfBooks[0], title: "同じ書名", titleReading: "かな２版", id: "a" };
    await expect(compareBooksByTitle(sameTitle, { ...sameTitle, titleReading: "カナ2版" })).toBe(0);
    await expect(compareBooksByTitle(sameTitle, { ...sameTitle, id: "z" })).toBeLessThan(0);
    await expect(compareBooksByTitle(sameTitle, { ...sameTitle, titleReading: "かな10版" })).toBeLessThan(0);
    await expect(shelfBooks.map((book) => book.id)).toEqual(["figma-design-system", "figma-mcp", "css-design", "codex", "web-design", "ai-dialogue", "ui-ideas", "ai-documents", "react"]);
  },
};
export const Mobile: Story = { globals: { viewport: { value: "mobileMock", isRotated: false } } };
export const Desktop: Story = { globals: { viewport: { value: "desktopMock", isRotated: false } } };
export const MobileSearch: Story = { args: { initialView: "search" }, globals: { viewport: { value: "mobileMock", isRotated: false } } };
export const DesktopSearch: Story = { args: { initialView: "search" }, globals: { viewport: { value: "desktopMock", isRotated: false } } };
export const NavigationPreservesConditions: Story = {
  args: { initialKeyword: "CSS", initialFilters: { areaIds: ["frontend"], tagIds: ["css"] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("2冊");
    await userEvent.click(canvas.getByRole("button", { name: "検索" }));
    const input = canvas.getByRole("searchbox", { name: "キーワード" });
    await expect(input).toHaveValue("CSS");
    await userEvent.clear(input);
    await userEvent.type(input, "未適用の入力");
    await userEvent.click(canvas.getByRole("button", { name: "本棚" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("2冊");
    await userEvent.click(canvas.getByRole("button", { name: "検索" }));
    await expect(canvas.getByRole("searchbox", { name: "キーワード" })).toHaveValue("CSS");
    await userEvent.click(canvas.getByRole("button", { name: "本棚に戻る" }));
  },
};
export const DesktopManyBooks: Story = {
  globals: { viewport: { value: "desktopMock", isRotated: false } },
  args: { books: Array.from({ length: 10 }, (_, index) => ({ ...shelfBooks[index % shelfBooks.length], id: `sample-many-${index}`, areaIds: ["frontend"] })) },
};
export const MobileManyBooks: Story = { ...DesktopManyBooks, globals: { viewport: { value: "mobileMock", isRotated: false } } };
export const MobileNarrowManyBooks: Story = { ...DesktopManyBooks, globals: { viewport: { value: "mobileNarrow", isRotated: false } } };
export const Empty: Story = { args: { books: [] } };
export const NoResults: Story = { args: { initialKeyword: "該当なし" } };
export const Filtered: Story = { args: { initialFilters: { areaIds: ["frontend", "design"], tagIds: ["css", "react"] } } };
export const LoadError: Story = { args: { error: "本棚を読み込めませんでした。" } };
