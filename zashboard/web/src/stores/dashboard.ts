import { writable, derived, get } from "svelte/store";
import type {
  DashboardButtonObject,
  DashboardConfig,
  DashboardObject,
  DashboardObjectType,
  DashboardRoom,
  EditingObjectState
} from "../lib/types/dashboard";
import { getDashboard, saveDashboard } from "../lib/api/dashboard";

const defaultConfig = (): DashboardConfig => ({
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
      description: "Favorite controls for the main living space",
      objects: []
    },
    {
      id: "bedroom",
      title: "Bedroom",
      icon: "mdi:bed-queen",
      description: "Lights, blinds, and scenes",
      objects: []
    }
  ]
});

const dashboard = writable<DashboardConfig>(defaultConfig());
const editMode = writable(false);
const activeRoomId = writable<string | null>(null);
const editingObject = writable<EditingObjectState | null>(null);

const sidebar = derived(dashboard, ($dashboard) => $dashboard.sidebar);
const rooms = derived(dashboard, ($dashboard) => $dashboard.rooms);
const activeRoom = derived(
  [rooms, activeRoomId],
  ([$rooms, $roomId]) => $rooms.find((room) => room.id === $roomId) ?? null
);

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeConfig(config: DashboardConfig | null): DashboardConfig {
  if (!config || typeof config !== "object") return defaultConfig();

  const normalizedRooms = Array.isArray(config.rooms)
    ? config.rooms.map((room, index) => normalizeRoom(room, index))
    : defaultConfig().rooms;

  return {
    sidebar: {
      title: config.sidebar?.title || "Zashboard",
      subtitle: config.sidebar?.subtitle || "Fusion-inspired Home Assistant UI",
      logo: config.sidebar?.logo || "Z"
    },
    rooms: normalizedRooms
  };
}

function normalizeRoom(room: DashboardRoom, index: number): DashboardRoom {
  const objects = Array.isArray(room.objects)
    ? room.objects
        .map((obj) => normalizeObject(obj))
        .filter((obj): obj is DashboardObject => Boolean(obj))
    : [];

  return {
    id: room.id || `room-${index + 1}`,
    title: room.title || `Room ${index + 1}`,
    icon: room.icon,
    description: room.description,
    objects
  };
}

function normalizeObject(obj: DashboardObject): DashboardObject | null {
  if (!obj || typeof obj !== "object") return null;

  if (obj.type === "button") {
    const button: DashboardButtonObject = {
      id: obj.id || nextId("button"),
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
    return button;
  }

  return null;
}

function scheduleSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(async () => {
    const cfg = get(dashboard);
    try {
      await saveDashboard(cfg);
    } catch (error) {
      console.error("[Zashboard] Failed to save dashboard", error);
    }
  }, 300);
}

export async function loadDashboardState() {
  try {
    const config = await getDashboard();
    const normalized = normalizeConfig(config);
    dashboard.set(normalized);
    const firstRoom = normalized.rooms[0];
    activeRoomId.set(firstRoom ? firstRoom.id : null);
  } catch (error) {
    console.error("[Zashboard] Failed to load dashboard config", error);
    const fallback = defaultConfig();
    dashboard.set(fallback);
    activeRoomId.set(fallback.rooms[0]?.id ?? null);
  }
}

function updateRooms(mutator: (rooms: DashboardRoom[]) => DashboardRoom[]) {
  dashboard.update((current) => {
    const nextRooms = mutator(current.rooms);
    return {
      ...current,
      rooms: nextRooms
    };
  });
  scheduleSave();
}

export function setEditMode(value: boolean) {
  editMode.set(value);
}

export function toggleEditMode() {
  editMode.update((current) => !current);
}

export function setActiveRoom(id: string) {
  activeRoomId.set(id);
}

function findRoomIndex(roomsList: DashboardRoom[], roomId: string) {
  return roomsList.findIndex((room) => room.id === roomId);
}

export function updateObjectPosition(
  roomId: string,
  objectId: string,
  x: number,
  y: number
) {
  updateRooms((roomsList) => {
    const clone = roomsList.map((room) => ({ ...room, objects: [...room.objects] }));
    const roomIndex = findRoomIndex(clone, roomId);
    if (roomIndex === -1) return roomsList;

    const room = clone[roomIndex];
    const objIndex = room.objects.findIndex((obj) => obj.id === objectId);
    if (objIndex === -1) return roomsList;

    room.objects[objIndex] = {
      ...room.objects[objIndex],
      x,
      y
    };

    clone[roomIndex] = room;
    return clone;
  });
}

function createDefaultObject(type: DashboardObjectType): DashboardObject {
  if (type === "button") {
    const id = nextId("button");
    const defaultButton: DashboardButtonObject = {
      id,
      type: "button",
      entity: "",
      name: "New button",
      icon: "mdi:gesture-tap-button",
      color: "#ffde16",
      service: "",
      showInfo: true,
      x: 40,
      y: 40,
      width: 180,
      height: 120
    };
    return defaultButton;
  }

  throw new Error(`Unsupported object type: ${type as string}`);
}

export function startCreatingObject(roomId: string, type: DashboardObjectType) {
  const base = createDefaultObject(type);
  editingObject.set({ roomId, object: base, isNew: true });
}

export function startEditingObject(roomId: string, objectId: string) {
  const snapshot = get(dashboard);
  const room = snapshot.rooms.find((r) => r.id === roomId);
  if (!room) return;
  const obj = room.objects.find((o) => o.id === objectId);
  if (!obj) return;

  editingObject.set({
    roomId,
    object: { ...obj },
    isNew: false
  });
}

export function cancelEditingObject() {
  editingObject.set(null);
}

export function saveEditingObject(payload: EditingObjectState) {
  updateRooms((roomsList) => {
    const clone = roomsList.map((room) => ({ ...room, objects: [...room.objects] }));
    const roomIndex = findRoomIndex(clone, payload.roomId);
    if (roomIndex === -1) return roomsList;

    const room = clone[roomIndex];
    const newObject = {
      ...payload.object,
      id: payload.object.id || nextId("object")
    };

    if (payload.isNew) {
      room.objects = [...room.objects, newObject];
    } else {
      room.objects = room.objects.map((obj) =>
        obj.id === newObject.id ? newObject : obj
      );
    }

    clone[roomIndex] = room;
    return clone;
  });

  editingObject.set(null);
}

export function removeObject(roomId: string, objectId: string) {
  updateRooms((roomsList) => {
    const clone = roomsList.map((room) => ({ ...room, objects: [...room.objects] }));
    const roomIndex = findRoomIndex(clone, roomId);
    if (roomIndex === -1) return roomsList;

    const room = clone[roomIndex];
    room.objects = room.objects.filter((obj) => obj.id !== objectId);
    clone[roomIndex] = room;
    return clone;
  });

  const editing = get(editingObject);
  if (editing && editing.object.id === objectId && editing.roomId === roomId) {
    editingObject.set(null);
  }
}

export { dashboard, editMode, rooms, activeRoom, activeRoomId, sidebar, editingObject };
