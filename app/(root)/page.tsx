import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase())
    .find((tag) => isLocale(tag));

  redirect(`/${preferred ?? defaultLocale}`);
}