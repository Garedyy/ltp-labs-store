import { notFound, toRouteError } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { getProduct } from "~/services/dummyjson/products.server";
import { useLocale } from "~/i18n/use-locale";
import type { Route } from "./+types/product";

// Placeholder until feature/product-detail renders the full page.
export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.productId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const product = await getProduct(id).catch((error: unknown) => {
    throw toRouteError(error);
  });
  if (!product) notFound();
  return { title: product.title, description: product.description };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({ ...loaderData, brand: matches[0].loaderData.brand });
}

export default function Product({ loaderData }: Route.ComponentProps) {
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";
  return (
    <>
      <h1 className="text-h3 font-medium" lang={lang}>
        {loaderData.title}
      </h1>
      <p className="mt-4 max-w-prose" lang={lang}>
        {loaderData.description}
      </p>
    </>
  );
}
