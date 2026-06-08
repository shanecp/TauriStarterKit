import type { ToastClassName, ToastContainerProps } from "react-toastify";

export const notificationContainerProps = {
  position: "top-right",
  autoClose: 4000,
  closeOnClick: false,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
  limit: 3,
  newestOnTop: false,
  draggable: "touch",
  theme: "light",
} satisfies ToastContainerProps;

export const appToastClassName: ToastClassName = (context) =>
  [context?.defaultClassName, "app-toast"].filter(Boolean).join(" ");

export const appToastProgressClassName: ToastClassName = (context) =>
  [context?.defaultClassName, "app-toast-progress"].filter(Boolean).join(" ");
