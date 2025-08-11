export type ShippingRule = {
  id: string;
  label: string;
  minSubtotal: number; // applies when cart subtotal >= minSubtotal
  rate: number; // flat rate in USD
};

export type TaxRule = {
  id: string;
  label: string;
  percent: number; // e.g., 0.102 = 10.2%
  appliesTo: (destination: { country: string; state?: string; city?: string; zip?: string }) => boolean;
};

export const BRAND = {
  name: "T&T Botanica",
  tagline: "Tropical • Whimsical • Lush",
  email: "hello@ttbotanica.com",
  social: {
    facebook: "https://www.facebook.com/ttbotanica", // TODO: replace with your handle
    instagram: "https://www.instagram.com/ttbotanica" // TODO: replace with your handle
  }
};

// Shipping: simple tiered rules (edit as needed)
export const SHIPPING_RULES: ShippingRule[] = [
  { id: "free_over_75", label: "Free (orders $75+)", minSubtotal: 75, rate: 0 },
  { id: "standard_under_75", label: "Standard shipping", minSubtotal: 0, rate: 8 }
];

// Taxes: destination-based examples. You should verify local rates before launch.
// Tacoma, WA example at ~10.2% (edit to current rate). Otherwise 0% as default.
export const TAX_RULES: TaxRule[] = [
  {
    id: "wa_tacoma",
    label: "Tacoma, WA sales tax",
    percent: 0.102,
    appliesTo: (d) => d.country === "US" && d.state === "WA" && (d.city?.toLowerCase() === "tacoma")
  },
  {
    id: "wa_statewide_fallback",
    label: "Washington (fallback)",
    percent: 0.095,
    appliesTo: (d) => d.country === "US" && d.state === "WA"
  }
  // Add more per state/city as needed
];

export function selectShipping(subtotal: number): ShippingRule {
  // pick the best (lowest rate) rule whose minSubtotal <= subtotal
  return SHIPPING_RULES
    .filter(r => subtotal >= r.minSubtotal)
    .sort((a, b) => a.rate - b.rate)[0] ?? SHIPPING_RULES[0];
}

export function selectTax(dest: { country: string; state?: string; city?: string; zip?: string }): TaxRule | null {
  return TAX_RULES.find(t => t.appliesTo(dest)) ?? null;
}
