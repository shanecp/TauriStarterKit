import { ClipboardCopy } from "lucide-react";

import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { useNotifications } from "../../shared/notifications/useNotifications";
import { copyTextToClipboard } from "./clipboard";

const copyItems = [
  {
    label: "Bundle ID",
    value: "com.example.utility",
  },
  {
    label: "Install Path",
    value: "~/Applications/Example Utility.app",
  },
  {
    label: "Command",
    value: "npm run tauri:dev",
  },
];

export function InteractionsPage() {
  const notifications = useNotifications();

  async function copyValue(label: string, value: string) {
    try {
      await copyTextToClipboard(value);
      notifications.success(`${label} copied.`);
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Copy failed.");
    }
  }

  return (
    <Card>
      <CardHeader
        title="Interactions"
        description="Click-to-copy actions."
        actions={<StatusBadge label="Clipboard" tone="info" />}
      />
      <CardBody>
        <div className="grid gap-3">
          {copyItems.map((item) => (
            <div
              key={item.label}
              className="grid gap-3 rounded-md border border-app-border bg-app-subtle px-4 py-3 md:grid-cols-[160px_1fr_auto] md:items-center"
            >
              <div className="text-sm font-medium text-app-muted">{item.label}</div>
              <code className="truncate rounded-md bg-app-code px-3 py-2 text-sm text-app-code-text">
                {item.value}
              </code>
              <Button
                variant="secondary"
                onClick={() => copyValue(item.label, item.value)}
              >
                <ClipboardCopy size={15} />
                Copy
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
