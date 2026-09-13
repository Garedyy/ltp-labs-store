import { BlogPage } from "~/components/pages/blog-page";
import { POSTS, type PostView } from "~/content/posts";
import { isLocale } from "~/i18n/config";
import { formatDate } from "~/i18n/format.server";
import { notFound } from "~/lib/http";
import { pageMeta } from "~/lib/meta";
import { getInstance, getLocale } from "~/middleware/i18next";
import type { Route } from "./+types/blog";

export function loader({ context }: Route.LoaderArgs) {
  const locale = getLocale(context);
  if (!isLocale(locale)) notFound();
  const t = getInstance(context).t;
  const posts: PostView[] = POSTS.map((post) => ({
    ...post,
    dateFormatted: formatDate(post.date, locale),
  }));
  return { posts, title: t("pages.blog.title"), description: t("pages.blog.description") };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  return pageMeta({
    title: loaderData.title,
    description: loaderData.description,
    brand: matches[0].loaderData.brand,
  });
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  return <BlogPage title={loaderData.title} posts={loaderData.posts} />;
}
