import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    // Apply the theme on initial load
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.className = `${savedTheme}-theme`;
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    
    // Apply the theme to body
    document.body.className = `${newTheme}-theme theme-transition`;
    
    // Save preference
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button 
      variant="link" 
      className="theme-toggle p-0 d-flex align-items-center justify-content-center me-2" 
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <i className="bi bi-sun-fill"></i>
      ) : (
        <i className="bi bi-moon-fill"></i>
      )}
    </Button>
  );
};

export default ThemeToggle;