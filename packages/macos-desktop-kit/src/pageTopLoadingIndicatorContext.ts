import { createContext } from "react";

import {
  PageTopLoadingIndicatorStore,
  pageTopLoadingIndicatorStore,
} from "./pageTopLoadingIndicatorStore";

export const PageTopLoadingIndicatorContext =
  createContext<PageTopLoadingIndicatorStore>(pageTopLoadingIndicatorStore);
