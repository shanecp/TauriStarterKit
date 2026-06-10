import { AppLayout } from "./layout/AppLayout";
import { PageTopLoadingIndicatorProvider } from "../shared/page-top-loading-indicator/PageTopLoadingIndicatorProvider";
import { NotificationProvider } from "../shared/notifications/NotificationProvider";
import { ThemeProvider } from "../shared/theme/ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <PageTopLoadingIndicatorProvider>
        <NotificationProvider>
          <AppLayout />
        </NotificationProvider>
      </PageTopLoadingIndicatorProvider>
    </ThemeProvider>
  );
}
