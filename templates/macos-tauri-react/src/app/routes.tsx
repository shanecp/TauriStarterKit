import type { ReactNode } from "react";
import { FlaskConical, LayoutDashboard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ExamplePage } from "../features/example/ExamplePage";
import { SettingsPage } from "../features/settings/SettingsPage";

export type SidebarItem = {
  label: string;
  path?: string;
  icon?: LucideIcon;
  children?: Array<{
    label: string;
    path: string;
  }>;
};

export type AppRoute = {
  path: string;
  title: string;
  subtitle: string;
  render: (navigate: (path: string) => void) => ReactNode;
};

export const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Example",
    path: "/example",
    icon: FlaskConical,
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Application", path: "/settings/application" },
      { label: "About", path: "/settings/about" },
      { label: "Diagnostics", path: "/settings/diagnostics" },
    ],
  },
];

export const routes: AppRoute[] = [
  {
    path: "/",
    title: "Dashboard",
    subtitle: "Starter overview for app shell, settings, and safe commands.",
    render: (navigate) => <DashboardPage onNavigate={navigate} />,
  },
  {
    path: "/example",
    title: "Example",
    subtitle: "Safe Tauri command pattern with loading, refresh, and error states.",
    render: () => <ExamplePage />,
  },
  {
    path: "/settings/application",
    title: "Application Settings",
    subtitle: "Appearance preferences for this app.",
    render: () => <SettingsPage activeSection="application" />,
  },
  {
    path: "/settings/about",
    title: "About",
    subtitle: "Application identity and build environment.",
    render: () => <SettingsPage activeSection="about" />,
  },
  {
    path: "/settings/diagnostics",
    title: "Diagnostics",
    subtitle: "Local macOS environment details.",
    render: () => <SettingsPage activeSection="diagnostics" />,
  },
];

export function getRoute(path: string): AppRoute {
  return routes.find((route) => route.path === path) ?? routes[0];
}
