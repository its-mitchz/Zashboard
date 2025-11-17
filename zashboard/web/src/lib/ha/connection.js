import { writable } from "svelte/store";
import {
  createConnection,
  subscribeEntities,
  callService,
  ERR_HASS_HOST_REQUIRED,
  getAuth
} from "home-assistant-js-websocket";

export const connection = writable(null);
export const states = writable({});
export const connectionStatus = writable("idle");
export const connectionError = writable(null);

function inHomeAssistantIframe() {
  try {
    return window.parent && window.parent !== window;
  } catch {
    return false;
  }
}

async function getConnectionFromHa() {
  // Try to reuse Home Assistant's existing connection.
  // This is what we want for an add-on / panel.
  try {
    // If we're running in an ingress/panel iframe,
    // the parent should have hassConnection.
    if (inHomeAssistantIframe() && window.parent.hassConnection) {
      console.log("[Zashboard] Using parent.hassConnection");
      const hc = await window.parent.hassConnection;
      return hc.conn ?? hc;
    }

    // Fallback: maybe the HA frontend injected hassConnection on window
    if (window.hassConnection) {
      console.log("[Zashboard] Using window.hassConnection");
      const hc = await window.hassConnection;
      return hc.conn ?? hc;
    }
  } catch (err) {
    console.warn("[Zashboard] Failed to reuse hassConnection:", err);
  }

  return null;
}

export async function initHaConnection() {
  if (typeof window === "undefined") return;

  connectionStatus.set("connecting");
  connectionError.set(null);

  try {
    // ----- PRIMARY PATH: running as HA add-on / panel -----
    const reuseConn = await getConnectionFromHa();
    if (reuseConn) {
      connection.set(reuseConn);
      connectionStatus.set("connected");

      subscribeEntities(reuseConn, (entities) => {
        states.set(entities || {});
      });

      reuseConn.addEventListener?.("disconnected", () => {
        connectionStatus.set("disconnected");
      });

      return; // IMPORTANT: do not fall through to getAuth()
    }

    // ----- DEV/STANDALONE PATH: only used for npm run dev -----
    console.log("[Zashboard] No hassConnection found; using getAuth() dev flow");

    let auth;
    try {
      auth = await getAuth(); // uses current URL
    } catch (err) {
      if (err === ERR_HASS_HOST_REQUIRED) {
        // derive hassUrl from current origin
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
    console.warn("[Zashboard] No HA connection yet, cannot call service", domain, service);
    return;
  }

  return callService(currentConn, domain, service, data);
}
