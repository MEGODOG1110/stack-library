import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormField } from "./FormField";
const meta = { title: "BookForm/FormField", component: FormField, args: { id: "field-story", name: "title", label: "書名", value: "", onChange: () => {}, required: true },
  decorators: [(Story) => <div style={{ width: "min(360px, 100%)", padding: 16, background: "#fff", color: "#111827" }}><Story /></div>],
  render: function FieldStory(args) { const [value, setValue] = useState(args.value); return <FormField {...args} value={value} onChange={setValue} />; },
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Error: Story = { args: { error: "書名を入力してください" } };
export const Authors: Story = { args: { label: "著者", multiline: true, hint: "複数名は改行して入力できます。" } };
