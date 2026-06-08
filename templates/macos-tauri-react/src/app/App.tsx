import { AppLayout } from "./layout/AppLayout";
import { ActivityProvider } from "../shared/activity/ActivityProvider";
import { NotificationProvider } from "../shared/notifications/NotificationProvider";
import { ThemeProvider } from "../shared/theme/ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <ActivityProvider>
        <NotificationProvider>
          <AppLayout />
        </NotificationProvider>
      </ActivityProvider>
    </ThemeProvider>
  );
}
