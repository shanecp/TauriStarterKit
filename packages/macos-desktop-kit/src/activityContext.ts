import { createContext } from "react";

import { ActivityStore, activityStore } from "./activityStore";

export const ActivityContext = createContext<ActivityStore>(activityStore);
