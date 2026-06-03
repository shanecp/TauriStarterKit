import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  isThemeMode,
  resolveEffectiveTheme,
  type EffectiveTheme,
  type ThemeMode,
} from "./theme";
import { readSetting, writeSetting } from "../settings/storage";

type ThemeContextValue = {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialMode(): ThemeMode {
  return readSetting("themeMode", isThemeMode, "system");
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  const effectiveTheme = resolveEffectiveTheme(mode, systemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    media.addEventListener("change", onChange);
    setSystemPrefersDark(media.matches);

    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.dataset.themeMode = mode;
  }, [effectiveTheme, mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    writeSetting("themeMode", nextMode);
  }, []);

  const value = useMemo(
    () => ({ mode, effectiveTheme, setMode }),
    [effectiveTheme, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
