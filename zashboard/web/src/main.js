import "./app.css";
import App from "./App.svelte";
import { initHaConnection } from "./lib/ha/connection";

initHaConnection();

const app = new App({
  target: document.getElementById("app")
});

export default app;
