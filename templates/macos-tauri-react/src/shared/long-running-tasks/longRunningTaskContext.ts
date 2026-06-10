import { createContext } from "react";

import {
  LongRunningTaskStore,
  longRunningTaskStore,
} from "./longRunningTaskStore";

export const LongRunningTaskContext =
  createContext<LongRunningTaskStore>(longRunningTaskStore);
