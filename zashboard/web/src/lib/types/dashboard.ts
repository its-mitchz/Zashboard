export type DashboardObjectType = "button";

export interface DashboardObjectBase {
  id: string;
  type: DashboardObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardButtonObject extends DashboardObjectBase {
  type: "button";
  entity: string;
  name: string;
  state?: string;
  icon?: string;
  color?: string;
  service?: string;
  showInfo: boolean;
}

export type DashboardObject = DashboardButtonObject;

export interface DashboardRoom {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  objects: DashboardObject[];
}

export interface DashboardSidebar {
  title: string;
  subtitle?: string;
  logo?: string;
}

export interface DashboardConfig {
  sidebar: DashboardSidebar;
  rooms: DashboardRoom[];
}

export interface EditingObjectState {
  roomId: string;
  object: DashboardObject;
  isNew?: boolean;
}
