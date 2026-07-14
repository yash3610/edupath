const THEME_EVENT = "luma-theme-change";
const DEFAULT_THEME = "dark";
const DEFAULT_ACCENT = "orange";

export function resolveDashboardTheme(theme) {
  if (theme === "light") return false;
  if (theme === "dark") return true;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return true;
}

export function readStoredDashboardTheme() {
  if (typeof window === "undefined") {
    return { theme: DEFAULT_THEME, accent: DEFAULT_ACCENT, dark: true };
  }

  const themePreference = localStorage.getItem("luma-theme-preference");
  const legacyTheme = localStorage.getItem("luma-theme");
  const theme = themePreference || legacyTheme || DEFAULT_THEME;
  const accent = localStorage.getItem("luma-accent") || DEFAULT_ACCENT;

  return {
    theme,
    accent,
    dark: resolveDashboardTheme(theme),
  };
}

export function applyDashboardTheme({ theme, accent } = {}) {
  if (typeof window === "undefined") {
    return { theme: theme || DEFAULT_THEME, accent: accent || DEFAULT_ACCENT, dark: true };
  }

  const current = readStoredDashboardTheme();
  const nextTheme = theme || current.theme || DEFAULT_THEME;
  const nextAccent = accent || current.accent || DEFAULT_ACCENT;
  const dark = resolveDashboardTheme(nextTheme);

  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.lumaAccent = nextAccent;
  localStorage.setItem("luma-theme", dark ? "dark" : "light");
  localStorage.setItem("luma-theme-preference", nextTheme);
  localStorage.setItem("luma-accent", nextAccent);

  const detail = { theme: nextTheme, accent: nextAccent, dark };
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail }));
  return detail;
}

export function onDashboardThemeChange(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (event) => callback(event.detail || readStoredDashboardTheme());
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}
