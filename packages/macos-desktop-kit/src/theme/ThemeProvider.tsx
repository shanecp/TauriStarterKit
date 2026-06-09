import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { readSetting, writeSetting } from "../settings/storage";
import {
  isThemePalette,
  isThemeMode,
  resolveEffectiveTheme,
  type EffectiveTheme,
  type ThemeMode,
  type ThemePalette,
} from "./theme";

type ThemeContextValue = {
  mode: ThemeMode;
  palette: ThemePalette;
  effectiveTheme: EffectiveTheme;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
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
  const [palette, setPaletteState] = useState<ThemePalette>(() =>
    readSetting(storageNamespace, "themePalette", isThemePalette, "blue"),
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
    document.documentElement.dataset.themePalette = palette;
  }, [effectiveTheme, mode, palette]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    writeSetting(storageNamespace, "themeMode", nextMode);
  }, [storageNamespace]);

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette);
    writeSetting(storageNamespace, "themePalette", nextPalette);
  }, [storageNamespace]);

  const value = useMemo(
    () => ({ mode, palette, effectiveTheme, setMode, setPalette }),
    [effectiveTheme, mode, palette, setMode, setPalette],
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
