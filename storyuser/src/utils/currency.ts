export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

export const calculateIndiaOrderTotals = (
  subtotal: number,
  couponDiscount: number = 0,
  deliveryFee: number = 149,
  freeDeliveryAbove: number = 5000,
  gstPercentage: number = 18
) => {
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const shipping = discountedSubtotal >= freeDeliveryAbove ? 0 : deliveryFee;
  const tax = discountedSubtotal * (gstPercentage / 100);
  const total = discountedSubtotal + shipping + tax;

  return { shipping, tax, total };
};
