import { ArrowRight, FlaskConical, MonitorCog, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "../../shared/components/Button";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";

type DashboardPageProps = {
  onNavigate: (path: string) => void;
};

type DashboardWorkflow = {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  badge: string;
};

const workflows: DashboardWorkflow[] = [
  {
    title: "Example Command",
    description: "Call a harmless Tauri command through a typed feature API wrapper.",
    path: "/example",
    icon: FlaskConical,
    badge: "Tauri",
  },
  {
    title: "Appearance",
    description: "Switch between system, light, and dark modes with local persistence.",
    path: "/settings/application",
    icon: MonitorCog,
    badge: "Settings",
  },
  {
    title: "Diagnostics",
    description: "Read app identity and local macOS diagnostics from the Rust backend.",
    path: "/settings/diagnostics",
    icon: Settings,
    badge: "Read-only",
  },
];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div>
      <PageHeader
        actions={
          <Button onClick={() => onNavigate("/settings/application")}>
            <MonitorCog size={15} />
            App Settings
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.path}
            workflow={workflow}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  onNavigate,
}: {
  workflow: DashboardWorkflow;
  onNavigate: (path: string) => void;
}) {
  const Icon = workflow.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(workflow.path)}
      className="group rounded-lg border border-app-border bg-app-panel p-5 text-left shadow-sm transition hover:border-app-accent hover:bg-app-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-app-border bg-app-accent-soft text-app-accent">
          <Icon size={19} />
        </span>
        <StatusBadge label={workflow.badge} tone="neutral" />
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-normal text-app-ink">
        {workflow.title}
      </h3>
      <p className="mt-2 min-h-16 text-sm leading-6 text-app-muted">
        {workflow.description}
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-app-accent">
        Open panel
        <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
