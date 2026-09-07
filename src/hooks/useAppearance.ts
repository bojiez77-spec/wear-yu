import { useEffect, useState } from "react";

export type Theme = "sky" | "steel";
export type LayoutMode = "studio" | "focus";

export function useAppearance() {
  const [theme, setTheme] = useState<Theme>("sky");
  const [layout, setLayout] = useState<LayoutMode>("studio");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.layout = layout;
    return () => {
      delete document.documentElement.dataset.theme;
      delete document.documentElement.dataset.layout;
    };
  }, [theme, layout]);
  return { theme, setTheme, layout, setLayout };
}
