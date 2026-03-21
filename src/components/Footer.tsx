import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="QurApp Logo" 
              className="h-8 w-auto"
            />
            <span className="font-display text-lg font-bold">QurApp</span>
          </Link>

          <p className="text-muted-foreground text-sm">© {currentYear} QurApp. {t.footer.copyright}</p>

          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link to="/for-scholars" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.footer.forScholars}
            </Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.footer.blog}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.footer.privacy}
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.footer.terms}
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {t.footer.contact}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
