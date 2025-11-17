import type { DashboardConfig } from "../types/dashboard";

const API_BASE = "api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data && typeof data === "object" && "error" in data && data.error) {
        msg = String(data.error);
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  return res;
}

export async function getDashboard(): Promise<DashboardConfig> {
  const res = await request("/dashboard");
  return res.json();
}

export async function saveDashboard(config: DashboardConfig) {
  const res = await request("/dashboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });
  return res.json();
}
