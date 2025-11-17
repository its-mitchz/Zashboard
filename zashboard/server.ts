import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface DashboardButtonObject {
  id: string;
  type: "button";
  entity: string;
  name: string;
  state?: string;
  icon?: string;
  color?: string;
  service?: string;
  showInfo: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

type DashboardObject = DashboardButtonObject;

interface DashboardRoom {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  objects: DashboardObject[];
}

interface DashboardSidebar {
  title: string;
  subtitle?: string;
  logo?: string;
}

interface DashboardConfig {
  sidebar: DashboardSidebar;
  rooms: DashboardRoom[];
}

const app = express();
const port = process.env.PORT || 8099;

const DATA_DIR = process.env.DATA_DIR || "/data";
const DASHBOARD_PATH = path.join(DATA_DIR, "dashboard.yaml");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function defaultDashboardConfig(): DashboardConfig {
  return {
    sidebar: {
      title: "Zashboard",
      subtitle: "Fusion-inspired Home Assistant UI",
      logo: "Z"
    },
    rooms: [
      {
        id: "living-room",
        title: "Living room",
        icon: "mdi:sofa",
        description: "Favorite controls for the living room",
        objects: []
      },
      {
        id: "bedroom",
        title: "Bedroom",
        icon: "mdi:bed-queen",
        description: "Night lights and scenes",
        objects: []
      }
    ]
  };
}

function normalizeObject(obj: Partial<DashboardObject>, index: number): DashboardObject {
  return {
    id: obj.id || `object-${index + 1}`,
    type: "button",
    entity: obj.entity || "",
    name: obj.name || "Button",
    state: obj.state,
    icon: obj.icon,
    color: obj.color || "#ffde16",
    service: obj.service || "",
    showInfo: obj.showInfo ?? true,
    x: obj.x ?? 40,
    y: obj.y ?? 40,
    width: obj.width ?? 180,
    height: obj.height ?? 120
  };
}

function normalizeRoom(room: Partial<DashboardRoom>, index: number): DashboardRoom {
  const rawObjects = Array.isArray(room.objects) ? room.objects : [];
  return {
    id: room.id || `room-${index + 1}`,
    title: room.title || `Room ${index + 1}`,
    icon: room.icon,
    description: room.description,
    objects: rawObjects.map((obj, objIndex) => normalizeObject(obj, objIndex))
  };
}

function normalizeConfig(data: unknown): DashboardConfig | null {
  if (!data || typeof data !== "object") return null;
  const input = data as Partial<DashboardConfig>;

  if (!Array.isArray(input.rooms)) {
    return null;
  }

  return {
    sidebar: {
      title: input.sidebar?.title || "Zashboard",
      subtitle: input.sidebar?.subtitle,
      logo: input.sidebar?.logo || "Z"
    },
    rooms: input.rooms.map((room, index) => normalizeRoom(room, index))
  };
}

function createDefaultDashboardYaml(): DashboardConfig {
  const config = defaultDashboardConfig();
  try {
    const yamlStr = yaml.dump(config, { noRefs: true });
    fs.writeFileSync(DASHBOARD_PATH, yamlStr, "utf8");
    console.log("Created default dashboard.yaml at", DASHBOARD_PATH);
  } catch (err) {
    console.error("Failed to write default dashboard.yaml:", (err as Error).message);
  }
  return config;
}

function loadDashboardYaml(): DashboardConfig {
  try {
    if (!fs.existsSync(DASHBOARD_PATH)) {
      console.log("dashboard.yaml not found, creating default.");
      return createDefaultDashboardYaml();
    }
    const file = fs.readFileSync(DASHBOARD_PATH, "utf8");
    const data = yaml.load(file);
    const normalized = normalizeConfig(data);
    return normalized ?? defaultDashboardConfig();
  } catch (err) {
    console.error("Failed to load dashboard.yaml:", (err as Error).message);
    return defaultDashboardConfig();
  }
}

function saveDashboardYaml(config: DashboardConfig) {
  try {
    const yamlStr = yaml.dump(config, { noRefs: true });
    fs.writeFileSync(DASHBOARD_PATH, yamlStr, "utf8");
    return true;
  } catch (err) {
    console.error("Failed to save dashboard.yaml:", (err as Error).message);
    return false;
  }
}

app.use(bodyParser.json());

app.get("/api/dashboard", (_req: Request, res: Response) => {
  const cfg = loadDashboardYaml();
  res.json(cfg);
});

app.post("/api/dashboard", (req: Request, res: Response) => {
  const normalized = normalizeConfig(req.body);
  if (!normalized) {
    return res.status(400).json({ error: "Invalid dashboard payload" });
  }
  const ok = saveDashboardYaml(normalized);
  if (!ok) {
    return res.status(500).json({ error: "Failed to save dashboard.yaml" });
  }
  res.json({ success: true });
});

const staticDir = path.join(__dirname, "web", "dist");
app.use(express.static(staticDir));

app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Zashboard server listening on port ${port}`);
});
