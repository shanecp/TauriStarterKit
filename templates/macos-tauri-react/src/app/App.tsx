import { AppLayout } from "./layout/AppLayout";
import { ThemeProvider } from "../shared/theme/ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}
