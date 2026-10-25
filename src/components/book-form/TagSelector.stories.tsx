import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { TagSelector } from "./TagSelector";
import { sampleFormTags } from "./book-form.fixtures";
const meta = { title: "BookForm/TagSelector", component: TagSelector, args: { options: sampleFormTags, selected: [], onChange: () => {} },
  render: function TagsStory(args) { const [selected, setSelected] = useState<string[]>([...args.selected]); return <TagSelector {...args} selected={selected} onChange={setSelected} />; },
} satisfies Meta<typeof TagSelector>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("checkbox", { name: "React" }));
  await userEvent.click(canvas.getByRole("checkbox", { name: "CSS" }));
  await expect(canvas.getByRole("checkbox", { name: "React" })).toBeChecked();
  await expect(canvas.getByRole("checkbox", { name: "CSS" })).toBeChecked();
} };
