const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const app = express();
const port = process.env.PORT || 8099;

// Data directory for YAML dashboard config
const DATA_DIR = process.env.DATA_DIR || "/data";
const DASHBOARD_PATH = path.join(DATA_DIR, "dashboard.yaml");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function defaultDashboardConfig() {
  return {
    views: [
      {
        id: "home",
        title: "Home",
        icon: "mdi:home",
        sections: [
          {
            id: "home-favorites",
            title: "Favorites",
            layout: "grid",
            cards: []
          }
        ]
      },
      {
        id: "lights",
        title: "Lights",
        icon: "mdi:lightbulb",
        sections: [
          {
            id: "lights-favorites",
            title: "Favorite lights",
            layout: "grid",
            cards: []
          },
          {
            id: "lights-all",
            title: "All lights",
            layout: "grid",
            auto_domain: "light"
          }
        ]
      },
      {
        id: "settings",
        title: "Settings",
        icon: "mdi:cog",
        sections: []
      }
    ]
  };
}

function createDefaultDashboardYaml() {
  const config = defaultDashboardConfig();
  try {
    const yamlStr = yaml.dump(config, { noRefs: true });
    fs.writeFileSync(DASHBOARD_PATH, yamlStr, "utf8");
    console.log("Created default dashboard.yaml at", DASHBOARD_PATH);
  } catch (err) {
    console.error("Failed to write default dashboard.yaml:", err.message);
  }
  return config;
}

function loadDashboardYaml() {
  try {
    if (!fs.existsSync(DASHBOARD_PATH)) {
      console.log("dashboard.yaml not found, creating default.");
      return createDefaultDashboardYaml();
    }
    const file = fs.readFileSync(DASHBOARD_PATH, "utf8");
    const data = yaml.load(file);
    if (!data || typeof data !== "object") {
      throw new Error("dashboard.yaml did not contain an object");
    }
    if (!Array.isArray(data.views)) {
      data.views = defaultDashboardConfig().views;
    }
    return data;
  } catch (err) {
    console.error("Failed to load dashboard.yaml:", err.message);
    return defaultDashboardConfig();
  }
}

function saveDashboardYaml(config) {
  try {
    const yamlStr = yaml.dump(config, { noRefs: true });
    fs.writeFileSync(DASHBOARD_PATH, yamlStr, "utf8");
    return true;
  } catch (err) {
    console.error("Failed to save dashboard.yaml:", err.message);
    return false;
  }
}

app.use(bodyParser.json());

// Dashboard YAML endpoints
app.get("/api/dashboard", (req, res) => {
  const cfg = loadDashboardYaml();
  res.json(cfg);
});

app.post("/api/dashboard", (req, res) => {
  const cfg = req.body;
  if (!cfg || typeof cfg !== "object" || !Array.isArray(cfg.views)) {
    return res.status(400).json({ error: "Invalid dashboard payload" });
  }
  const ok = saveDashboardYaml(cfg);
  if (!ok) {
    return res.status(500).json({ error: "Failed to save dashboard.yaml" });
  }
  res.json({ success: true });
});

// Serve built Svelte frontend
const staticDir = path.join(__dirname, "web", "dist");
app.use(express.static(staticDir));

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Svelte Lights Dashboard listening on port ${port}`);
});
