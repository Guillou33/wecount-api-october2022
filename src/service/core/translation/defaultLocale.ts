import { LOCALE } from "@root/entity/enum/Locale";
import config from "config";

const translationConfig: {
  fallbackLocale: LOCALE,
} = config.get('translation');

export const fallbackLocale = translationConfig.fallbackLocale;
