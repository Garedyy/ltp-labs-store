import { useTranslation } from "react-i18next";

import { Rating } from "~/components/ui/rating";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import type { ReviewView } from "~/lib/product/view.server";

export function ReviewList({ reviews, lang }: { reviews: ReviewView[]; lang?: string }) {
  const { t } = useTranslation();
  if (reviews.length === 0) return null;
  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-4">
      <h2 id="reviews-heading" className="text-h5 font-medium">
        {t("product.reviews.heading", { count: reviews.length })}
      </h2>
      <ul className="divide-y divide-border">
        {reviews.map((review, index) => (
          <li key={review.key} className="py-4">
            <article
              aria-labelledby={`review-${review.key}-index review-${review.key}-name`}
              className="flex flex-col gap-1"
            >
              <VisuallyHidden>
                <span id={`review-${review.key}-index`}>
                  {t("product.reviews.item", { index: index + 1, total: reviews.length })}
                </span>
              </VisuallyHidden>
              <h3 id={`review-${review.key}-name`} className="font-medium" lang={lang}>
                {review.reviewerName}
              </h3>
              {review.date && (
                <time dateTime={review.date} className="text-body-sm text-fg-muted">
                  {review.dateFormatted}
                </time>
              )}
              <Rating
                value={review.rating}
                valueFormatted={review.ratingFormatted}
                label={t("product.reviews.rated", { value: review.ratingFormatted })}
              />
              <p lang={lang}>{review.comment}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
