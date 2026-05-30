import { RefreshCw } from "lucide-react";
import { useCallback } from "react";

import { Button } from "../../shared/components/Button";
import { Card, CardBody, CardHeader } from "../../shared/components/Card";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import { PageHeader } from "../../shared/components/PageHeader";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { formatTimestamp } from "../../shared/lib/format";
import { useAsyncResource } from "../../shared/hooks/useAsyncResource";
import { examplePing } from "./example.api";

export function ExamplePage() {
  const load = useCallback(() => examplePing(), []);
  const { data, error, isInitialLoading, isRefreshing, lastUpdatedAt, refresh } =
    useAsyncResource({ load });

  return (
    <div>
      <PageHeader
        actions={
          <Button onClick={refresh} disabled={isInitialLoading || isRefreshing}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-5">
        {isInitialLoading ? <LoadingState label="Loading example command" /> : null}
        {error ? <ErrorState message={error} /> : null}
        {data ? (
          <Card>
            <CardHeader
              title="Example Ping"
              description="A harmless backend command wired through a typed API wrapper."
              actions={
                <StatusBadge
                  label={isRefreshing ? "Refreshing" : "Available"}
                  tone={isRefreshing ? "info" : "success"}
                />
              }
            />
            <CardBody>
              <dl className="grid gap-3 text-sm">
                <Detail label="Message" value={data.message} />
                <Detail
                  label="Command timestamp"
                  value={formatTimestamp(data.received_at_epoch_ms)}
                />
                <Detail label="Last refreshed" value={formatTimestamp(lastUpdatedAt)} />
              </dl>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-app-border bg-app-subtle px-3 py-2 md:grid-cols-[180px_1fr]">
      <dt className="text-app-muted">{label}</dt>
      <dd className="font-medium text-app-ink">{value}</dd>
    </div>
  );
}
