/**
 * Fourthwall Storefront API helper.
 *
 * Fetches published products from the "all" collection using the
 * Storefront API at build time (Astro static rendering).
 *
 * Token is read from process.env / import.meta.env and is NEVER
 * exposed in the client-side bundle — all fetching happens server-side
 * at build time.
 *
 * ─────────────────────────────────────────────────────────────────
 * NETLIFY DEPLOYMENT
 * ─────────────────────────────────────────────────────────────────
 * Add the following environment variable in Netlify:
 *   Site configuration → Environment variables → Add variable
 *
 *   Key:   FOURTHWALL_STOREFRONT_TOKEN
 *   Value: <your Fourthwall storefront token>
 *
 * Without this variable the merch sections will render a fallback
 * message and the build will still succeed.
 * ─────────────────────────────────────────────────────────────────
 */

const FW_BASE = "https://storefront-api.fourthwall.com/v1";
export const SHOP_URL = "https://overwhelmed-gamer-shop.fourthwall.com/";

// ─── Public product shape ─────────────────────────────────────────────────────

export type MerchProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  /** Starting price formatted as a currency string, e.g. "From $26.00" */
  price: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  sku?: string;
  imageUrl: string;
  productUrl: string;
  available: boolean;
};

// ─── Raw Fourthwall response types ───────────────────────────────────────────

type FWImage = {
  id: string;
  url: string;
  transformedUrl: string;
  width: number;
  height: number;
};

type FWVariant = {
  id: string;
  name: string;
  sku: string;
  unitPrice: { value: number; currency: string };
  compareAtPrice: { value: number; currency: string } | null;
  stock: { type: string };
};

type FWProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  state: { type: string };
  access: { type: string };
  images: FWImage[];
  variants: FWVariant[];
};

type FWCollectionResponse = {
  results: FWProduct[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    elementsSize: number;
    elementsTotal: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(variants: FWVariant[]): string {
  if (!variants || variants.length === 0) return "";
  const prices = variants
    .map((v) => v.unitPrice?.value)
    .filter((p): p is number => typeof p === "number");
  if (prices.length === 0) return "";
  const min = Math.min(...prices);
  const currency = variants[0].unitPrice?.currency ?? "USD";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(min);
  return prices.length > 1 ? `From ${formatted}` : formatted;
}

function getPriceStats(variants: FWVariant[]): {
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  sku?: string;
} {
  if (!variants || variants.length === 0) return {};

  const prices = variants
    .map((v) => v.unitPrice?.value)
    .filter((p): p is number => typeof p === "number");
  const sku = variants.find((v) => typeof v.sku === "string" && v.sku.trim().length > 0)?.sku;
  const currency = variants.find((v) => typeof v.unitPrice?.currency === "string")?.unitPrice.currency;

  if (prices.length === 0) {
    return {
      currency,
      sku
    };
  }

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    currency,
    sku
  };
}

function mapProduct(fw: FWProduct): MerchProduct {
  const imageUrl =
    fw.images?.[0]?.transformedUrl ?? fw.images?.[0]?.url ?? "";
  const productUrl = `${SHOP_URL}products/${fw.slug}`;
  const available =
    fw.state?.type === "AVAILABLE" && fw.access?.type === "PUBLIC";
  const { minPrice, maxPrice, currency, sku } = getPriceStats(fw.variants ?? []);

  return {
    id: fw.id,
    title: fw.name,
    slug: fw.slug,
    description: fw.description ?? "",
    price: formatPrice(fw.variants ?? []),
    minPrice,
    maxPrice,
    currency,
    sku,
    imageUrl,
    productUrl,
    available,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch published products from the Fourthwall "all" collection.
 *
 * @param maxResults - Optional cap on how many products to return.
 * @returns Array of MerchProduct. Empty array on failure or missing token.
 */
export async function getMerchProducts(
  maxResults?: number
): Promise<MerchProduct[]> {
  const token = import.meta.env.FOURTHWALL_STOREFRONT_TOKEN;

  if (!token) {
    console.warn(
      "[fourthwall] FOURTHWALL_STOREFRONT_TOKEN is not set. " +
        "Merch sections will show a fallback message. " +
        "Add the token in Netlify: Site config → Environment variables."
    );
    return [];
  }

  try {
    const url = new URL(`${FW_BASE}/collections/all/products`);
    url.searchParams.set("storefront_token", token);
    if (maxResults) {
      url.searchParams.set("limit", String(maxResults));
    }

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error(
        `[fourthwall] API responded with ${res.status} ${res.statusText}`
      );
      return [];
    }

    const data: FWCollectionResponse = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.warn("[fourthwall] Unexpected API response shape — no results array.");
      return [];
    }

    const products = data.results
      .filter((p) => p.state?.type === "AVAILABLE" && p.access?.type === "PUBLIC")
      .map(mapProduct);

    return maxResults ? products.slice(0, maxResults) : products;
  } catch (err) {
    console.error("[fourthwall] Failed to fetch products:", err);
    return [];
  }
}
