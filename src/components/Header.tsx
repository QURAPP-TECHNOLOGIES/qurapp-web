import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun, Heart, Sparkles, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/50 transition-all">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <img 
                src={logo} 
                alt="QurApp Logo" 
                className="h-9 w-auto transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight leading-none">
                QurApp <span className="text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 ml-1">Tech</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                Ecosystem
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground outline-none ${location.pathname.startsWith('/products') ? 'text-primary' : 'text-muted-foreground'}`}>
                Products <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2 bg-popover/95 backdrop-blur-md">
                <DropdownMenuItem asChild>
                  <Link to="/products" className="flex flex-col gap-0.5 p-2 cursor-pointer">
                    <span className="font-semibold text-sm">All Products</span>
                    <span className="text-xs text-muted-foreground">Explore our full software suite</span>
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem asChild>
                  <Link to="/products/qurapp" className="flex items-center gap-2 p-2 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-medium text-xs">QurApp</div>
                      <div className="text-[10px] text-muted-foreground">Global Quran Social Platform</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/products/hisnul-muslim" className="flex items-center gap-2 p-2 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <div className="font-medium text-xs">Hisnul Muslim</div>
                      <div className="text-[10px] text-muted-foreground">Adhkar & Supplications</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/products/qurai" className="flex items-center gap-2 p-2 cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <div>
                      <div className="font-medium text-xs">QurAI</div>
                      <div className="text-[10px] text-muted-foreground">AI Islamic Learning (Coming Soon)</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/research"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive('/research') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Research
            </Link>

            <Link
              to="/community"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive('/community') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Community
            </Link>

            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive('/about') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              About
            </Link>

            <Link
              to="/blog"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive('/blog') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Blog
            </Link>

            <Link
              to="/for-scholars"
              className={`text-sm font-medium transition-colors hover:text-foreground ${isActive('/for-scholars') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              For Scholars
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button asChild size="sm" variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 gap-1.5">
              <Link to="/donate">
                <Heart className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500" /> Support Mission
              </Link>
            </Button>

            <Button asChild size="sm" className="gap-1.5 shadow-sm">
              <Link to="/products/qurapp">
                <Sparkles className="w-3.5 h-3.5" /> Get App
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              className="p-2 text-foreground rounded-lg hover:bg-muted"
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
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border animate-in slide-in-from-top-2">
          <div className="container py-4 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Navigation</div>
            <nav className="flex flex-col space-y-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Overview
              </Link>
              <Link
                to="/products"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/products') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Our Products
              </Link>
              <Link
                to="/products/hisnul-muslim"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/products/hisnul-muslim') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Hisnul Muslim
              </Link>
              <Link
                to="/research"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/research') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Research
              </Link>
              <Link
                to="/community"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/community') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/about') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/blog"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/blog') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/for-scholars"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/for-scholars') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                For Scholars
              </Link>
            </nav>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Button asChild size="default" variant="outline" className="w-full justify-center border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="w-4 h-4 mr-2 fill-amber-500/20" /> Support Our Mission
                </Link>
              </Button>
              <Button asChild size="default" className="w-full justify-center">
                <Link to="/products/qurapp" onClick={() => setIsMenuOpen(false)}>
                  Get QurApp
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
