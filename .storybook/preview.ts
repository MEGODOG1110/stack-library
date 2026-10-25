import type { Preview } from "@storybook/nextjs-vite";
import { createElement } from "react";
import "../src/app/globals.css";

const preview: Preview = {
  initialGlobals: { theme: "system" },
  globalTypes: {
    theme: {
      description: "画面の配色",
      toolbar: {
        icon: "circlehollow",
        dynamicTitle: true,
        items: [
          { value: "system", title: "OS設定に追従" },
          { value: "light", title: "ライト" },
          { value: "dark", title: "ダーク" },
        ],
      },
    },
  },
  decorators: [(Story, context) => createElement("div", {
    className: "SL-ly_theme-preview",
    "data-sl-theme": context.globals.theme,
    style: { colorScheme: context.globals.theme === "light" ? "light" : context.globals.theme === "dark" ? "dark" : "light dark" },
  }, createElement(Story))],
  parameters: {
    nextjs: { appDirectory: true },
    layout: "centered",
    viewport: { options: {
      mobileMock: { name: "Mobile mock (393px)", styles: { width: "393px", height: "852px" }, type: "mobile" },
      mobileNarrow: { name: "Mobile narrow (320px)", styles: { width: "320px", height: "852px" }, type: "mobile" },
      desktopMock: { name: "Desktop mock (1296px)", styles: { width: "1296px", height: "852px" }, type: "desktop" },
    } },
  },
};

export default preview;
