import { useMemo } from "react";

import { notifications } from "./notifications";

export function useNotifications() {
  return useMemo(() => notifications, []);
}
