import { writable } from "svelte/store";
import {
  createConnection,
  subscribeEntities,
  callService,
  ERR_HASS_HOST_REQUIRED,
  getAuth,
} from "home-assistant-js-websocket";

export const connection = writable(null);
export const states = writable({});
export const connectionStatus = writable("idle");
export const connectionError = writable(null);

function isIngress() {
  try {
    return window.location.pathname.includes("/api/hassio_ingress");
  } catch {
    return false;
  }
}

function isRemoteNabuCasa() {
  try {
    return window.location.hostname.endsWith(".ui.nabu.casa");
  } catch {
    return false;
  }
}

function findHassConnectionPromise() {
  // Walk up the window hierarchy and look for hassConnection
  const visited = new Set();
  let win = window;

  for (let i = 0; i < 10; i++) {
    if (!win || visited.has(win)) break;
    visited.add(win);

    try {
      if (win.hassConnection) {
        console.log("[Zashboard] Found hassConnection on window level", i);
        return win.hassConnection;
      }
    } catch (err) {
      // cross-origin; ignore and break
      console.warn("[Zashboard] Error probing window level", i, err);
      break;
    }

    if (!win.parent || win.parent === win) break;
    win = win.parent;
  }

  return null;
}

async function getConnectionFromHaAncestors() {
  const promise = findHassConnectionPromise();
  if (!promise) return null;

  try {
    const hc = await promise;
    // In newer HA, hassConnection resolves to { conn, auth }
    return hc.conn ?? hc;
  } catch (err) {
    console.warn("[Zashboard] hassConnection promise rejected:", err);
    return null;
  }
}

export async function initHaConnection() {
  if (typeof window === "undefined") return;

  connectionStatus.set("connecting");
  connectionError.set(null);

  const ingress = isIngress();
  const remote = isRemoteNabuCasa();

  try {
    // ─────────────────────────────────────────────────────────────
    // PRIMARY PATH: Add-on / Ingress / Nabu Casa
    // ─────────────────────────────────────────────────────────────
    if (ingress || remote) {
      console.log("[Zashboard] Running in ingress / remote UI mode");

      const conn = await getConnectionFromHaAncestors();
      if (!conn) {
        console.error(
          "[Zashboard] Could not access hassConnection from HA frontend; " +
            "cannot connect without starting our own auth flow (which we avoid in ingress)."
        );
        connectionStatus.set("error");
        connectionError.set(
          "Zashboard could not reuse the existing Home Assistant connection. " +
            "Try opening Home Assistant via your local/internal URL instead of Nabu Casa remote."
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

      return; // IMPORTANT: do not fall through to getAuth()
    }

    // ─────────────────────────────────────────────────────────────
    // DEV/STANDALONE PATH: ONLY outside ingress / Nabu Casa
    // ─────────────────────────────────────────────────────────────
    console.log("[Zashboard] Not in ingress/remote; using getAuth() dev flow");

    let auth;
    try {
      auth = await getAuth(); // uses current URL as redirectUri
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

export async function haCallService(domain, service, data) {
  let currentConn = null;
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
