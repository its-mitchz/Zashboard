import { svelte } from "@sveltejs/vite-plugin-svelte";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [svelte()],
  base: "./",
  build: {
    outDir: "dist"
  }
};

export default config;
