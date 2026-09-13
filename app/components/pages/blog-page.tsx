import { useTranslation } from "react-i18next";

import type { PostView } from "~/content/posts";
import { PageHeader } from "./page-header";

export function BlogPage({ title, posts }: { title: string; posts: PostView[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={title} intro={t("pages.blog.intro")} />
      <div className="flex max-w-prose flex-col gap-8">
        {posts.map((post) => (
          <article
            key={post.key}
            aria-labelledby={`post-${post.key}`}
            className="flex flex-col gap-3 border-t border-border pt-8"
          >
            <h2 id={`post-${post.key}`} className="text-h4 font-medium">
              {t(`pages.blog.posts.${post.key}.title`)}
            </h2>
            <p className="text-body-sm text-fg-muted">
              {t("pages.blog.publishedOn")} <time dateTime={post.date}>{post.dateFormatted}</time>
            </p>
            <p className="font-medium">{t(`pages.blog.posts.${post.key}.excerpt`)}</p>
            <p>{t(`pages.blog.posts.${post.key}.body1`)}</p>
            <p>{t(`pages.blog.posts.${post.key}.body2`)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
