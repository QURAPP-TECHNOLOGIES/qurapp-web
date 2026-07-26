import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Heart, Github, Twitter, MessageCircle, Send } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-border pt-16 pb-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src={logo} 
                alt="QurApp Logo" 
                className="h-8 w-auto"
              />
              <span className="font-display text-xl font-bold tracking-tight">
                QurApp <span className="text-primary text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10">Technologies</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Building technology that helps Muslims learn, practice and live Islam. Ad-free, ethically driven, and built for global impact.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to="/donate" className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                <Heart className="w-3.5 h-3.5 fill-amber-500" /> Support Our Mission
              </Link>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products/qurapp" className="hover:text-foreground transition-colors">
                  QurApp Social Platform
                </Link>
              </li>
              <li>
                <Link to="/products/hisnul-muslim" className="hover:text-foreground transition-colors">
                  Hisnul Muslim Audio
                </Link>
              </li>
              <li>
                <Link to="/products/qurai" className="hover:text-foreground transition-colors flex items-center gap-1">
                  QurAI <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono">Soon</span>
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-foreground transition-colors">
                  Product Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Ecosystem & Research */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/research" className="hover:text-foreground transition-colors">
                  Research & AI Safety
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-foreground transition-colors">
                  Community Hub
                </Link>
              </li>
              <li>
                <Link to="/for-scholars" className="hover:text-foreground transition-colors">
                  Scholar Verification
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  News & Engineering Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About Organization
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground tracking-wider uppercase">Support & Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/donate" className="hover:text-foreground transition-colors text-amber-500">
                  Donate & Support
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <p>© {currentYear} QurApp Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/QURAPP-TECHNOLOGIES" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="WhatsApp Channel">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Telegram">
              <Send className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
