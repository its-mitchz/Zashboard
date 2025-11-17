import { writable, type Writable } from "svelte/store";
import {
  callService,
  createConnection,
  ERR_HASS_HOST_REQUIRED,
  getAuth,
  subscribeEntities,
  type Connection,
  type HassEntities
} from "home-assistant-js-websocket";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export const connection: Writable<Connection | null> = writable(null);
export const states = writable<HassEntities>({});
export const connectionStatus = writable<ConnectionStatus>("idle");
export const connectionError = writable<string | null>(null);

function isIngress(): boolean {
  try {
    return window.location.pathname.includes("/api/hassio_ingress");
  } catch {
    return false;
  }
}

function isNabuCasa(): boolean {
  try {
    return window.location.hostname.endsWith(".ui.nabu.casa");
  } catch {
    return false;
  }
}

function findHassConnectionPromise():
  | Promise<{ conn?: Connection } | Connection>
  | null {
  const visited = new Set<Window>();
  let win: Window | null = window;

  for (let i = 0; i < 10; i++) {
    if (!win || visited.has(win)) break;
    visited.add(win);

    try {
      if ((win as any).hassConnection) {
        console.log("[Zashboard] Found hassConnection on window level", i);
        return (win as any).hassConnection;
      }
    } catch (err) {
      console.warn("[Zashboard] Error probing window level", i, err);
      break;
    }

    if (!win.parent || win.parent === win) break;
    win = win.parent;
  }

  return null;
}

async function getConnectionFromHaFrontend() {
  const promise = findHassConnectionPromise();
  if (!promise) return null;

  const hc = await promise;
  return (hc as { conn?: Connection }).conn ?? (hc as Connection);
}

export async function initHaConnection() {
  if (typeof window === "undefined") return;

  connectionStatus.set("connecting");
  connectionError.set(null);

  const ingress = isIngress();
  const remote = isNabuCasa();

  try {
    if (ingress || remote) {
      console.log("[Zashboard] Running in ingress / remote UI mode");

      const conn = await getConnectionFromHaFrontend();
      if (!conn) {
        connectionStatus.set("error");
        connectionError.set(
          "Zashboard couldn't access the existing Home Assistant connection. " +
            "Make sure you're opening Zashboard from inside the Home Assistant UI."
        );
        return;
      }

      connection.set(conn);
      connectionStatus.set("connected");

      subscribeEntities(conn, (entities) => {
        states.set(entities || {});
      });

      conn.addEventListener?.("disconnected", () => {
        connectionStatus.set("disconnected");
      });

      return;
    }

    console.log("[Zashboard] Not in ingress/remote; using getAuth() dev flow");

    let auth;
    try {
      auth = await getAuth();
    } catch (err) {
      if (err === ERR_HASS_HOST_REQUIRED) {
        const url = new URL(window.location.href);
        const hassUrl = `${url.protocol}//${url.host}`;
        auth = await getAuth({ hassUrl });
      } else {
        console.error("[Zashboard] getAuth error", err);
        connectionStatus.set("error");
        connectionError.set("Failed to get Home Assistant auth");
        return;
      }
    }

    const devConn = await createConnection({ auth });
    connection.set(devConn);
    connectionStatus.set("connected");

    subscribeEntities(devConn, (entities) => {
      states.set(entities || {});
    });

    devConn.addEventListener?.("disconnected", () => {
      connectionStatus.set("disconnected");
    });
  } catch (err) {
    console.error("[Zashboard] Failed to initialize HA websocket", err);
    connectionStatus.set("error");
    connectionError.set("Failed to connect to Home Assistant websocket");
  }
}

export async function haCallService(
  domain: string,
  service: string,
  data: Record<string, unknown>
) {
  let currentConn: Connection | null = null;
  const unsub = connection.subscribe((c) => (currentConn = c));
  unsub();

  if (!currentConn) {
    console.warn(
      "[Zashboard] No HA connection yet, cannot call service",
      domain,
      service
    );
    return;
  }

  return callService(currentConn, domain, service, data);
}
