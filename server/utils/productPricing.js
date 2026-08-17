/**
 * Single source of truth for what a product actually costs.
 * A discount only counts when it is a positive number strictly below the list price.
 */
const hasActiveDiscount = (product) => {
  if (!product) return false;

  const price = Number(product.price);
  const discountPrice = Number(product.discountPrice);

  return (
    Number.isFinite(price) &&
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < price
  );
};

const getEffectivePrice = (product) => {
  if (!product) return 0;
  return hasActiveDiscount(product) ? Number(product.discountPrice) : Number(product.price) || 0;
};

module.exports = {
  hasActiveDiscount,
  getEffectivePrice,
};
