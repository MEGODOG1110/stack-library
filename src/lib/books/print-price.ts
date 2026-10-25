/** 紙onlyの入力ISBN。税抜01/03には10%を加算、1円未満切捨て。税込02/04はそのまま。 */
export type OnixPrice = { PriceType?: string; CurrencyCode?: string; PriceAmount?: string; PriceDate?: unknown; Territory?: unknown };
export function printListPrice(productForm: string | undefined, prices: readonly OnixPrice[]) {
  if (productForm && !/^B[A-Z]$/.test(productForm)) return undefined;
  const candidates = prices.filter(price => ["01", "02", "03", "04"].includes(price.PriceType ?? "") && price.CurrencyCode === "JPY" && price.PriceDate === undefined && price.Territory === undefined)
    .map(price => {
      const amount = typeof price.PriceAmount === "string" && /^\d+(?:\.0+)?$/.test(price.PriceAmount) ? Number(price.PriceAmount) : NaN;
      if (!Number.isSafeInteger(amount) || amount < 0) return NaN;
      return ["01", "03"].includes(price.PriceType ?? "") ? Number(BigInt(amount) * BigInt(11) / BigInt(10)) : amount;
    })
    .filter(price => Number.isSafeInteger(price) && price >= 0);
  const unique = [...new Set(candidates)];
  return unique.length === 1 ? unique[0] : undefined;
}
