import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("devcollab-theme") ||
      "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "devcollab-theme",
      theme
    );
  }, [theme]);

  const handleThemeChange = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleThemeChange}
      type="button"
      aria-label="Toggle theme"
      title={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
    >
      <span className="theme-toggle-icon">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}

export default ThemeToggle;