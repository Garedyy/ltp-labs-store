import { useTranslation } from "react-i18next";
import { Form } from "react-router";

import { Button } from "~/components/ui/button";

// The cart-session branch wires the "add" action and the fetcher; the markup stays the same.
export function AddToCartForm({ productId, inStock }: { productId: number; inStock: boolean }) {
  const { t } = useTranslation();
  return (
    <Form method="post" noValidate className="flex flex-col gap-3">
      <input type="hidden" name="intent" value="add" />
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" disabled={!inStock} aria-describedby="stock-status" className="w-full">
        {t("product.addToCart")}
      </Button>
    </Form>
  );
}
