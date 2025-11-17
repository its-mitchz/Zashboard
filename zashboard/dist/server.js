"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8099;
const DATA_DIR = process.env.DATA_DIR || "/data";
const DASHBOARD_PATH = path_1.default.join(DATA_DIR, "dashboard.yaml");
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
function defaultDashboardConfig() {
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
function normalizeObject(obj, index) {
    var _a, _b, _c, _d, _e;
    return {
        id: obj.id || `object-${index + 1}`,
        type: "button",
        entity: obj.entity || "",
        name: obj.name || "Button",
        state: obj.state,
        icon: obj.icon,
        color: obj.color || "#ffde16",
        service: obj.service || "",
        showInfo: (_a = obj.showInfo) !== null && _a !== void 0 ? _a : true,
        x: (_b = obj.x) !== null && _b !== void 0 ? _b : 40,
        y: (_c = obj.y) !== null && _c !== void 0 ? _c : 40,
        width: (_d = obj.width) !== null && _d !== void 0 ? _d : 180,
        height: (_e = obj.height) !== null && _e !== void 0 ? _e : 120
    };
}
function normalizeRoom(room, index) {
    const rawObjects = Array.isArray(room.objects) ? room.objects : [];
    return {
        id: room.id || `room-${index + 1}`,
        title: room.title || `Room ${index + 1}`,
        icon: room.icon,
        description: room.description,
        objects: rawObjects.map((obj, objIndex) => normalizeObject(obj, objIndex))
    };
}
function normalizeConfig(data) {
    var _a, _b, _c;
    if (!data || typeof data !== "object")
        return null;
    const input = data;
    if (!Array.isArray(input.rooms)) {
        return null;
    }
    return {
        sidebar: {
            title: ((_a = input.sidebar) === null || _a === void 0 ? void 0 : _a.title) || "Zashboard",
            subtitle: (_b = input.sidebar) === null || _b === void 0 ? void 0 : _b.subtitle,
            logo: ((_c = input.sidebar) === null || _c === void 0 ? void 0 : _c.logo) || "Z"
        },
        rooms: input.rooms.map((room, index) => normalizeRoom(room, index))
    };
}
function createDefaultDashboardYaml() {
    const config = defaultDashboardConfig();
    try {
        const yamlStr = js_yaml_1.default.dump(config, { noRefs: true });
        fs_1.default.writeFileSync(DASHBOARD_PATH, yamlStr, "utf8");
        console.log("Created default dashboard.yaml at", DASHBOARD_PATH);
    }
    catch (err) {
        console.error("Failed to write default dashboard.yaml:", err.message);
    }
    return config;
}
function loadDashboardYaml() {
    try {
        if (!fs_1.default.existsSync(DASHBOARD_PATH)) {
            console.log("dashboard.yaml not found, creating default.");
            return createDefaultDashboardYaml();
        }
        const file = fs_1.default.readFileSync(DASHBOARD_PATH, "utf8");
        const data = js_yaml_1.default.load(file);
        const normalized = normalizeConfig(data);
        return normalized !== null && normalized !== void 0 ? normalized : defaultDashboardConfig();
    }
    catch (err) {
        console.error("Failed to load dashboard.yaml:", err.message);
        return defaultDashboardConfig();
    }
}
function saveDashboardYaml(config) {
    try {
        const yamlStr = js_yaml_1.default.dump(config, { noRefs: true });
        fs_1.default.writeFileSync(DASHBOARD_PATH, yamlStr, "utf8");
        return true;
    }
    catch (err) {
        console.error("Failed to save dashboard.yaml:", err.message);
        return false;
    }
}
app.use(body_parser_1.default.json());
app.get("/api/dashboard", (_req, res) => {
    const cfg = loadDashboardYaml();
    res.json(cfg);
});
app.post("/api/dashboard", (req, res) => {
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
const staticDir = path_1.default.resolve(__dirname, "../web/dist");
app.use(express_1.default.static(staticDir));
app.get(/.*/, (_req, res) => {
    res.sendFile(path_1.default.join(staticDir, "index.html"));
});
app.listen(port, () => {
    console.log(`Zashboard server listening on port ${port}`);
});
