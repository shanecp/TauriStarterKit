import { AppLayout } from "./layout/AppLayout";
import { LongRunningTaskProvider } from "../shared/long-running-tasks/LongRunningTaskProvider";
import { PageTopLoadingIndicatorProvider } from "../shared/page-top-loading-indicator/PageTopLoadingIndicatorProvider";
import { NotificationProvider } from "../shared/notifications/NotificationProvider";
import { ThemeProvider } from "../shared/theme/ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <PageTopLoadingIndicatorProvider>
        <LongRunningTaskProvider>
          <NotificationProvider>
            <AppLayout />
          </NotificationProvider>
        </LongRunningTaskProvider>
      </PageTopLoadingIndicatorProvider>
    </ThemeProvider>
  );
}
