"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";

export function ThemeSync() {
  const theme = useAppStore((s) => s.settings.theme);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (theme === "system") {
      setTheme("system");
    } else if (theme === "dark") {
      setTheme("dark");
    } else if (theme === "light") {
      setTheme("light");
    }
  }, [theme, setTheme]);

  return null;
}
