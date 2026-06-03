import { AppLayout } from "./layout/AppLayout";
import { ActivityProvider } from "../shared/activity/ActivityProvider";
import { ThemeProvider } from "../shared/theme/ThemeProvider";

export function App() {
  return (
    <ActivityProvider>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </ActivityProvider>
  );
}
