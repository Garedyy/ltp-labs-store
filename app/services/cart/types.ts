export type CartLine = { productId: number; quantity: number };

export type PaymentMethod = "card" | "paypal";

export type LastOrder = {
  number: string;
  method: PaymentMethod;
  totalCents: number;
  itemCount: number;
  totalFormatted: string;
};

export type CartSessionData = { cart: CartLine[]; promoCode?: string; lastOrder?: LastOrder };

export type CartLineView = {
  productId: number;
  title: string;
  thumbnail: string;
  quantity: number;
  maxQuantity: number;
  unitPriceFormatted: string;
  linePriceFormatted: string;
  href: string;
};

export type TotalsView = {
  subtotalFormatted: string;
  discountFormatted?: string;
  promoCode?: string;
  shippingFormatted: string;
  isFreeShipping: boolean;
  totalFormatted: string;
  totalCents: number;
};

export type CartView = {
  lines: CartLineView[];
  totals: TotalsView;
  cartCount: number;
  promoCode?: string;
};
