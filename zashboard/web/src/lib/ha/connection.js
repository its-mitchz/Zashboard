import { writable } from "svelte/store";
import {
  getAuth,
  createConnection,
  subscribeEntities,
  callService,
  ERR_HASS_HOST_REQUIRED
} from "home-assistant-js-websocket";

export const connection = writable(null);
export const states = writable({});
export const connectionStatus = writable("idle");
export const connectionError = writable(null);

async function getConnectionFromHaParent() {
  // When running inside Home Assistant (panel / ingress), the main UI
  // exposes a hassConnection promise we can reuse so we don't trigger
  // a new auth redirect.
  try {
    // Try parent first (iframe inside HA)
    if (window.parent && window.parent !== window && window.parent.hassConnection) {
      const parentConn = await window.parent.hassConnection;
      return parentConn.conn ?? parentConn;
    }

    // Fallback: maybe we're embedded directly, not in an iframe
    if (window.hassConnection) {
      const hc = await window.hassConnection;
      return hc.conn ?? hc;
    }
  } catch (err) {
    console.warn("Failed to reuse hassConnection from parent:", err);
  }

  return null;
}

export async function initHaConnection() {
  if (typeof window === "undefined") return;

  connectionStatus.set("connecting");
  connectionError.set(null);

  try {
    // 1) Prefer using the existing HA connection (no redirects at all)
    let conn = await getConnectionFromHaParent();

    // 2) If that didn’t work (e.g. running dev mode via `npm run dev`),
    //    fall back to the standard home-assistant-js-websocket auth.
    if (!conn) {
      let auth;
      try {
        // This uses the current URL as client_id/redirect_uri
        auth = await getAuth();
      } catch (err) {
        if (err === ERR_HASS_HOST_REQUIRED) {
          // When hassUrl isn’t known, derive it from the current origin.
          const url = new URL(window.location.href);
          const hassUrl = `${url.protocol}//${url.host}`;
          auth = await getAuth({ hassUrl });
        } else {
          console.error("getAuth error", err);
          connectionStatus.set("error");
          connectionError.set("Failed to get Home Assistant auth");
          return;
        }
      }

      conn = await createConnection({ auth });
    }

    connection.set(conn);
    connectionStatus.set("connected");

    // Keep entities in a Svelte store
    subscribeEntities(conn, (entities) => {
      states.set(entities || {});
    });

    // Optional: track disconnect
    conn.addEventListener?.("disconnected", () => {
      connectionStatus.set("disconnected");
    });
  } catch (err) {
    console.error("Failed to initialize HA websocket", err);
    connectionStatus.set("error");
    connectionError.set("Failed to connect to Home Assistant websocket");
  }
}

export async function haCallService(domain, service, data) {
  let currentConn = null;
  const unsub = connection.subscribe((c) => (currentConn = c));
  unsub();

  if (!currentConn) {
    console.warn("No HA connection yet, cannot call service", domain, service);
    return;
  }

  return callService(currentConn, domain, service, data);
}
