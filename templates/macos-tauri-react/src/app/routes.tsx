import type { ReactNode } from "react";
import { FlaskConical, LayoutDashboard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ContentPage } from "../features/examples/ContentPage";
import { ContentLoadingPage } from "../features/examples/ContentLoadingPage";
import { DataTablePage } from "../features/examples/DataTablePage";
import { FormsPage } from "../features/examples/FormsPage";
import { InteractionsPage } from "../features/examples/InteractionsPage";
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
  aliases?: string[];
  title: string;
  breadcrumbs: BreadcrumbItem[];
  render: (navigate: (path: string) => void) => ReactNode;
};

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

export const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Examples",
    icon: FlaskConical,
    children: [
      { label: "Content Loading", path: "/examples/loading" },
      { label: "Data Tables", path: "/examples/data-table" },
      { label: "Forms", path: "/examples/forms" },
      { label: "Interactions", path: "/examples/interactions" },
      { label: "Content", path: "/examples/content" },
    ],
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
    breadcrumbs: [{ label: "Dashboard" }],
    render: (navigate) => <DashboardPage onNavigate={navigate} />,
  },
  {
    path: "/examples/loading",
    aliases: ["/example"],
    title: "Content Loading",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Content Loading" },
    ],
    render: () => <ContentLoadingPage />,
  },
  {
    path: "/examples/data-table",
    title: "Data Tables",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Data Tables" },
    ],
    render: () => <DataTablePage />,
  },
  {
    path: "/examples/forms",
    title: "Forms",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Forms" },
    ],
    render: (navigate) => <FormsPage onNavigate={navigate} />,
  },
  {
    path: "/examples/forms/new",
    title: "Create Form",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Forms", path: "/examples/forms" },
      { label: "Create Form" },
    ],
    render: (navigate) => <FormsPage view="create" onNavigate={navigate} />,
  },
  {
    path: "/examples/forms/edit",
    title: "Edit Form",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Forms", path: "/examples/forms" },
      { label: "Edit Form" },
    ],
    render: (navigate) => <FormsPage view="edit" onNavigate={navigate} />,
  },
  {
    path: "/examples/interactions",
    title: "Interactions",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Interactions" },
    ],
    render: () => <InteractionsPage />,
  },
  {
    path: "/examples/content",
    title: "Content",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Examples", path: "/examples/loading" },
      { label: "Content" },
    ],
    render: () => <ContentPage />,
  },
  {
    path: "/settings/application",
    title: "Application Settings",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Settings", path: "/settings/application" },
      { label: "Application" },
    ],
    render: () => <SettingsPage activeSection="application" />,
  },
  {
    path: "/settings/about",
    title: "About",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Settings", path: "/settings/application" },
      { label: "About" },
    ],
    render: () => <SettingsPage activeSection="about" />,
  },
  {
    path: "/settings/diagnostics",
    title: "Diagnostics",
    breadcrumbs: [
      { label: "Dashboard", path: "/" },
      { label: "Settings", path: "/settings/application" },
      { label: "Diagnostics" },
    ],
    render: () => <SettingsPage activeSection="diagnostics" />,
  },
];

export function getRoute(path: string): AppRoute {
  return (
    routes.find((route) => route.path === path || route.aliases?.includes(path)) ??
    routes[0]
  );
}
