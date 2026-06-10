import { Monitor, Moon, RefreshCw, RotateCcw, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { APP_META } from "../../shared/appMeta";
import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { ErrorState } from "../../shared/components/ErrorState";
import { OnPageLoadingIndicator } from "../../shared/components/OnPageLoadingIndicator";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";
import {
  EDITOR_APP_OPTIONS,
  getStoredEditorAppName,
  resetEditorAppName,
  saveEditorAppName,
} from "../../shared/file-opening";
import { useAsyncResource } from "../../shared/hooks/useAsyncResource";
import {
  getStoredDefaultPaginationSize,
  PAGINATION_SIZE_OPTIONS,
  saveDefaultPaginationSize,
  type PaginationSize,
} from "../../shared/settings/applicationSettings";
import { useTheme } from "../../shared/theme/ThemeProvider";
import { themePalettes, type ThemePalette } from "../../shared/theme/theme";
import { getDiagnostics } from "./settings.api";
import type { DiagnosticsResponse } from "./settings.types";

type SettingsPageProps = {
  activeSection: "application" | "about" | "diagnostics";
};

export function SettingsPage({ activeSection }: SettingsPageProps) {
  const needsDiagnostics = activeSection !== "application";
  const showRefresh = activeSection === "diagnostics";
  const loadDiagnostics = useCallback(() => getDiagnostics(), []);
  const {
    data: diagnostics,
    error,
    isInitialLoading,
    isRefreshing,
    refresh,
  } = useAsyncResource({
    load: loadDiagnostics,
    autoLoad: needsDiagnostics,
  });

  const content =
    activeSection === "application" ? (
      <>
        <ApplicationPreferencesCard />
        <AppearanceCard />
        <PreferredEditorCard />
      </>
    ) : diagnostics && activeSection === "diagnostics" ? (
      <DiagnosticsCard diagnostics={diagnostics} />
    ) : diagnostics ? (
      <AboutCard diagnostics={diagnostics} />
    ) : null;

  return (
    <div>
      <PageHeader
        actions={showRefresh ? (
          <Button
            onClick={refresh}
            disabled={isInitialLoading || isRefreshing}
            loading={isRefreshing}
            loadingLabel="Refreshing diagnostics"
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
        ) : null}
      />
      <div className="grid gap-5">
        {needsDiagnostics && isInitialLoading ? (
          <OnPageLoadingIndicator label="Loading diagnostics" />
        ) : null}
        {needsDiagnostics && error ? <ErrorState message={error} /> : null}
        {content}
      </div>
    </div>
  );
}

function AppearanceCard() {
  const { mode, palette, effectiveTheme, setMode, setPalette } = useTheme();
  const useSystemTheme = mode === "system";

  function toggleSystemTheme(enabled: boolean) {
    setMode(enabled ? "system" : effectiveTheme);
  }

  return (
    <Card>
      <CardHeader
        title="Appearance"
        description="Choose a fixed theme or follow the macOS system appearance."
        actions={
          <StatusBadge
            label={`Current: ${effectiveTheme}`}
            tone={effectiveTheme === "dark" ? "info" : "neutral"}
          />
        }
      />
      <CardBody>
        <div className="grid gap-4">
          <label className="flex items-center justify-between gap-4 rounded-md border border-app-border bg-app-subtle px-4 py-3">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-app-border bg-app-panel text-app-accent">
                <Monitor size={18} />
              </span>
              <span>
                <span className="block text-sm font-medium text-app-ink">
                  Use system theme
                </span>
                <span className="block text-sm text-app-muted">
                  Current: {effectiveTheme}
                </span>
              </span>
            </span>
            <input
              type="checkbox"
              checked={useSystemTheme}
              onChange={(event) => toggleSystemTheme(event.target.checked)}
              className="h-5 w-5 accent-app-accent"
            />
          </label>

          {!useSystemTheme ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <ThemeOption
                  icon={Sun}
                  label="Light"
                  description="Use the light interface."
                  selected={mode === "light"}
                  onSelect={() => setMode("light")}
                />
                <ThemeOption
                  icon={Moon}
                  label="Dark"
                  description="Use the dark interface."
                  selected={mode === "dark"}
                  onSelect={() => setMode("dark")}
                />
              </div>
              <label className="grid gap-2 text-sm font-medium text-app-ink">
                Theme
                <select
                  value={palette}
                  onChange={(event) =>
                    setPalette(event.target.value as ThemePalette)
                  }
                  className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition placeholder:text-app-muted focus:border-app-accent"
                >
                  {themePalettes.map((themePalette) => (
                    <option key={themePalette} value={themePalette}>
                      {themePaletteLabel(themePalette)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

function ApplicationPreferencesCard() {
  const [paginationSize, setPaginationSize] = useState(
    getStoredDefaultPaginationSize,
  );

  function selectPaginationSize(nextSize: PaginationSize) {
    setPaginationSize(saveDefaultPaginationSize(nextSize));
  }

  return (
    <Card>
      <CardHeader
        title="Application"
        description="Defaults for generated list and table screens."
        actions={
          <StatusBadge label={`Page size: ${paginationSize}`} tone="neutral" />
        }
      />
      <CardBody>
        <label className="grid max-w-sm gap-2 text-sm font-medium text-app-ink">
          Default pagination size
          <select
            value={paginationSize}
            onChange={(event) =>
              selectPaginationSize(Number(event.target.value) as PaginationSize)
            }
            className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition focus:border-app-accent"
          >
            {PAGINATION_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </CardBody>
    </Card>
  );
}

function PreferredEditorCard() {
  const [editorAppName, setEditorAppName] = useState(getStoredEditorAppName);

  function selectEditor(nextEditorAppName: string) {
    setEditorAppName(saveEditorAppName(nextEditorAppName));
  }

  function reset() {
    setEditorAppName(resetEditorAppName());
  }

  return (
    <Card>
      <CardHeader
        title="Preferred Editor"
        description={`Choose the macOS app ${APP_META.name} uses when opening editable files.`}
        actions={<StatusBadge label={`Current: ${editorAppName}`} tone="neutral" />}
      />
      <CardBody>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="grid flex-1 gap-2 text-sm font-medium text-app-ink">
            Editor
            <select
              value={editorAppName}
              onChange={(event) => selectEditor(event.target.value)}
              className="h-10 rounded-md border border-app-border bg-app-panel px-3 text-sm font-normal text-app-ink outline-none transition placeholder:text-app-muted focus:border-app-accent"
            >
              {EDITOR_APP_OPTIONS.map((option) => (
                <option key={option.appName} value={option.appName}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <Button onClick={reset} variant="ghost">
              <RotateCcw size={15} />
              Reset to VS Code
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function themePaletteLabel(palette: ThemePalette): string {
  const labels: Record<ThemePalette, string> = {
    blue: "Blue",
    green: "Green",
    rose: "Rose",
  };

  return labels[palette];
}

function ThemeOption({
  icon: Icon,
  label,
  description,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-28 flex-col items-start gap-3 rounded-md border px-4 py-4 text-left transition ${
        selected
          ? "border-app-accent bg-app-accent-soft text-app-ink"
          : "border-app-border bg-app-panel text-app-ink hover:bg-app-subtle"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-app-border bg-app-subtle text-app-accent">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-sm text-app-muted">{description}</span>
      </span>
    </button>
  );
}

function AboutCard({ diagnostics }: { diagnostics: DiagnosticsResponse }) {
  return (
    <Card>
      <CardHeader title="About" description={`${APP_META.name} application identity.`} />
      <CardBody>
        <dl className="grid gap-3 text-sm">
          <Detail label="App name" value={diagnostics.app_name} />
          <Detail label="Package name" value={APP_META.packageName} />
          <Detail label="Version" value={diagnostics.version} />
          <Detail label="Environment" value={diagnostics.environment} />
          <Detail label="Bundle identifier" value={diagnostics.bundle_identifier} />
          <Detail label="Tauri" value={`v${diagnostics.tauri_version}`} />
        </dl>
      </CardBody>
    </Card>
  );
}

function DiagnosticsCard({ diagnostics }: { diagnostics: DiagnosticsResponse }) {
  return (
    <Card>
      <CardHeader title="Diagnostics" description="Local macOS environment." />
      <CardBody>
        <dl className="grid gap-3 text-sm">
          <Detail label="macOS" value={diagnostics.macos_version} />
          <Detail label="CPU architecture" value={diagnostics.cpu_architecture} />
          <Detail label="Disk remaining" value={diskSpaceSummary(diagnostics.disk_space)} />
        </dl>
      </CardBody>
    </Card>
  );
}

function diskSpaceSummary(diskSpace: DiagnosticsResponse["disk_space"]): string {
  if (!diskSpace.available) {
    return diskSpace.error_message ? `Unavailable: ${diskSpace.error_message}` : "Unavailable";
  }

  const available = formatBytes(diskSpace.available_bytes);
  const total = formatBytes(diskSpace.total_bytes);
  const capacity = diskSpace.capacity_percent;
  const usage = capacity === null ? "" : ` (${capacity}% used)`;

  return `${available} free of ${total}${usage}`;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) {
    return "n/a";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-app-border bg-app-subtle px-3 py-2 md:grid-cols-[180px_1fr]">
      <dt className="text-app-muted">{label}</dt>
      <dd className="font-medium text-app-ink">{value}</dd>
    </div>
  );
}
