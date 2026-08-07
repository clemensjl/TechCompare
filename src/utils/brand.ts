import { Brand } from "../types";

/**
 * Brand colours live in CSS custom properties so light and dark mode can hold
 * different, contrast-corrected values for the same brand. Components reference
 * the variable rather than a hard-coded hex.
 */
const BRAND_VARS: Record<Brand, string> = {
  Apple: "var(--brand-apple)",
  Google: "var(--brand-google)",
  Samsung: "var(--brand-samsung)",
  Xiaomi: "var(--brand-xiaomi)",
};

export function brandColorVar(brand: string): string {
  return BRAND_VARS[brand as Brand] ?? "var(--text-2)";
}

export const BRANDS: Brand[] = ["Apple", "Google", "Samsung", "Xiaomi"];
