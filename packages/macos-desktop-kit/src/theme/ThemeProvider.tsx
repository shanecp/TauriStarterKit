import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { readSetting, writeSetting } from "../settings/storage";
import {
  isThemeMode,
  resolveEffectiveTheme,
  type EffectiveTheme,
  type ThemeMode,
} from "./theme";

type ThemeContextValue = {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({
  children,
  storageNamespace = "app",
}: {
  children: ReactNode;
  storageNamespace?: string;
}) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    readSetting(storageNamespace, "themeMode", isThemeMode, "system"),
  );
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

  function setMode(nextMode: ThemeMode) {
    setModeState(nextMode);
    writeSetting(storageNamespace, "themeMode", nextMode);
  }

  const value = useMemo(
    () => ({ mode, effectiveTheme, setMode }),
    [effectiveTheme, mode],
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
