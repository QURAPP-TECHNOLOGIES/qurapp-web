import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import { id } from "./id";
import { ur } from "./ur";
import { tr } from "./tr";
import { ms } from "./ms";
import { bn } from "./bn";
import { fa } from "./fa";
import { es } from "./es";
import { de } from "./de";
import { ru } from "./ru";
import { zh } from "./zh";
import { ja } from "./ja";
import { hi } from "./hi";
import type { Language } from "../types";

export type TranslationKeys = typeof en;

export const translations: Record<Language, TranslationKeys> = {
  en,
  ar,
  fr,
  id,
  ur,
  tr,
  ms,
  bn,
  fa,
  es,
  de,
  ru,
  zh,
  ja,
  hi,
};
