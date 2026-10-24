import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function EnvironmentCheck() {
  const [count, setCount] = useState(0);

  return (
    <section aria-label="開発環境の確認">
      <h1>Storybookの動作確認</h1>
      <p>アプリと共通のCSSを読み込んでいます。</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        クリックを確認
      </button>
      <p role="status">クリック回数: {count}</p>
    </section>
  );
}

const meta = {
  title: "Development/Environment Check",
  component: EnvironmentCheck,
} satisfies Meta<typeof EnvironmentCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
