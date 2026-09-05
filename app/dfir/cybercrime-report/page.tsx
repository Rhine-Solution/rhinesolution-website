import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

export default function LegacyCybercrimeReport() {
  redirect(`/${defaultLocale}/dfir/cybercrime-report`);
}