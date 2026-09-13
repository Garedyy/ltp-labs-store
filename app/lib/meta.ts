import type { MetaDescriptor } from "react-router";

type PageMetaInput = { title: string; brand: string; description?: string };

// "<page> - <brand>" titles, unique per route and state.
export function pageMeta({ title, brand, description }: PageMetaInput): MetaDescriptor[] {
  const descriptors: MetaDescriptor[] = [{ title: `${title} - ${brand}` }];
  if (description) descriptors.push({ name: "description", content: description });
  return descriptors;
}
