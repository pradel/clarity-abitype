import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/clarity-abitype/",
  title: "clarity-abitype",
  description: "Strict TypeScript types for Clarity ABIs.",
  themeConfig: {
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/" },
          { text: "stacks.js Usage", link: "/stacks-js-guide" },
          { text: "Clarinet SDK Usage", link: "/clarinet-guide" },
        ],
      },
      {
        text: "Examples",
        items: [
          {
            text: "Clarinet Counter",
            link: "https://github.com/pradel/clarity-abitype/tree/main/examples/clarinet-counter",
            target: "_blank",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/pradel/clarity-abitype",
      },
    ],
  },
});
