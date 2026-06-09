export type SidebarResizeMode = "fixed" | "resizable";

export type SidebarConfig = {
  resizeMode: SidebarResizeMode;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
};

export const sidebarConfig: SidebarConfig = {
  resizeMode: "fixed",
  defaultWidth: 288,
  minWidth: 224,
  maxWidth: 420,
};

export function clampSidebarWidth(
  width: number,
  config: SidebarConfig = sidebarConfig,
): number {
  if (!Number.isFinite(width)) {
    return config.defaultWidth;
  }

  return Math.min(config.maxWidth, Math.max(config.minWidth, Math.round(width)));
}
