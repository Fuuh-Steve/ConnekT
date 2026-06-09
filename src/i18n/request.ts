import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

const messageImporters: Record<Locale, () => Promise<{ default: object }>> = {
  en: () => import("../messages/en"),
  fr: () => import("../messages/fr"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await messageImporters[locale as Locale]()).default,
  };
});
