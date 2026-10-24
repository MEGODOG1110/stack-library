import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["./**/*.stories.@(ts|tsx)"],
  framework: "@storybook/nextjs-vite",
  core: { disableTelemetry: true },
  previewHead: (head) => `${head}<link rel="icon" href="data:,">`,
};

export default config;
