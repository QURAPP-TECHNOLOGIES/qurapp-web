import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check, RotateCcw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languages, type Language } from "@/i18n/types";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  const handleReset = () => {
    localStorage.removeItem("preferred-language");
    const browserLang = navigator.language.split("-")[0] as Language;
    const supportedLang = languages.find((l) => l.code === browserLang);
    setLanguage(supportedLang ? browserLang : "en");
    setOpen(false);
  };

  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-lg leading-none">{currentLang?.flag}</span>
          <span className="hidden sm:inline">{currentLang?.nativeName || "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto w-56">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              <span className="text-muted-foreground text-xs">({lang.name})</span>
            </span>
            {language === lang.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleReset}
          className="flex items-center gap-2 cursor-pointer text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset to browser default</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
