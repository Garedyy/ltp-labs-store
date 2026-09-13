import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";

import { useAnnounce } from "~/components/layout/announcer";
import { cx } from "~/lib/cx";
import { clampImageIndex } from "~/lib/product/image";

type ProductGalleryProps = { title: string; images: string[] };

// The image lives in the URL (?image=n) so it works without JS; thumbnails replace the entry and
// the loader is not revalidated, so the index is read from the URL here.
export function ProductGallery({ title, images }: ProductGalleryProps) {
  const { t } = useTranslation();
  const announce = useAnnounce();
  const [searchParams] = useSearchParams();
  const total = images.length;
  const imageIndex = clampImageIndex(searchParams.get("image"), total);
  const previous = useRef(imageIndex);

  useEffect(() => {
    if (previous.current === imageIndex) return;
    previous.current = imageIndex;
    announce(t("product.gallery.shown", { index: imageIndex, total }));
  }, [imageIndex, total, announce, t]);
  const current = images[imageIndex - 1] ?? images[0] ?? "";
  if (current) preload(current, { as: "image", fetchPriority: "high" });

  function to(index: number): string {
    const next = new URLSearchParams(searchParams);
    if (index === 1) next.delete("image");
    else next.set("image", String(index));
    const search = next.toString();
    return search ? `?${search}` : "?";
  }

  // Square image bounded by the viewport height (60 svh, 20 rem floor) and centred in its column,
  // so the gallery and the buy block share the first screen (#27).
  return (
    <figure className="mx-auto flex w-full max-w-[min(100%,max(20rem,60svh))] flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-surface-placeholder">
        <img
          src={current}
          alt={t("product.gallery.imageAlt", { title, index: imageIndex, total })}
          width={800}
          height={800}
          loading="eager"
          fetchPriority="high"
          className="size-full object-contain"
        />
      </div>
      {total > 1 && (
        <ul aria-label={t("product.gallery.thumbnails")} className="flex gap-2 overflow-x-auto p-1">
          {images.map((image, index) => {
            const number = index + 1;
            const selected = number === imageIndex;
            return (
              <li key={image} className="shrink-0">
                <Link
                  to={to(number)}
                  replace
                  preventScrollReset
                  aria-label={t("product.gallery.show", { index: number, total })}
                  aria-current={selected ? "true" : undefined}
                  className={cx(
                    "block size-16 overflow-hidden rounded-lg border-2 bg-surface-placeholder",
                    selected ? "border-primary forced-colors:outline-2" : "border-transparent",
                  )}
                >
                  <img
                    src={image}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="size-full object-contain"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}
