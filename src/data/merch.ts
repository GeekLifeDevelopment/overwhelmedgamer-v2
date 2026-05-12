/**
 * Merch data re-exports.
 *
 * Products are now fetched dynamically from the Fourthwall Storefront API.
 * See src/lib/fourthwall.ts for the fetch helper and type definitions.
 */

export type { MerchProduct as MerchItem } from "../lib/fourthwall";
export { SHOP_URL } from "../lib/fourthwall";
