import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });
  const { t } = useLanguage();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="QurApp Logo" 
              className="h-9 w-auto"
            />
            <span className="font-display text-xl font-bold">QurApp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/for-scholars"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              {t.header.forScholars}
            </Link>
            <Link
              to="/blog"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              {t.header.blog}
            </Link>
          </nav>

          {/* Desktop CTA & Language Switcher & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button size="default">{t.header.getApp}</Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container py-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/for-scholars"
                className="text-muted-foreground hover:text-foreground transition-colors py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.forScholars}
              </Link>
              <Link
                to="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.header.blog}
              </Link>
              <Button size="default" className="mt-2">
                {t.header.getApp}
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
