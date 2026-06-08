import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  appToastClassName,
  appToastProgressClassName,
  notificationContainerProps,
} from "./toastContainerConfig";

export function NotificationProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        {...notificationContainerProps}
        aria-label="Notifications"
        className="app-toast-container"
        progressClassName={appToastProgressClassName}
        toastClassName={appToastClassName}
      />
    </>
  );
}
