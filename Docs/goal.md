# LTP Labs — Creation of a Simple Online Store

The challenge involves developing a simple e-commerce application in Remix that allows users to view products, add items to the shopping cart, and review the contents of the cart. The application should be designed with a focus on responsiveness, ensuring an optimized user experience across various devices. Furthermore, it is essential that the project adheres to best practices in frontend development, ensuring code quality and interface usability are maintained.

## Application structure

- Create an application in Remix with the following pages:
  - Homepage
  - Product detail
  - Optional: Shopping Cart
- There is a Figma file provided in the notes that should be used as the foundation of the project and reproduced as faithfully as possible

## Homepage

- Implement a page displaying a list of products
- Make a request to fetch the list of products (you may use the API data provided in the notes)
- Each product should have a link to its detail page
- It should be possible to sort the list according to the user's preferences, as well as filter by category
- The product list should also include pagination

## Product detail page

- Make a request to fetch the selected product (you may use the API data provided in the notes)
- All elements present in the Figma design should be added to this page. However, if you wish to include additional elements, that will be appreciated
- When clicking the "Add to cart" button, the product should be added to the cart

## Optional — Shopping cart

- Implement a shopping cart page that fits within the layout of your application
- The user should be able to access the shopping cart from an icon in the header of the application
- The cart should display the added products, the quantity of each item, and the total
- The user should be able to remove products from the cart

## Design

- Optional: Use Tailwind CSS to style the application
- The application should work well on both mobile and desktop devices

## Internationalization (i18n)

- The application must support at least two languages: English (default) and French
- The active locale is resolved server-side in Remix (URL prefix such as `/en/...` and `/fr/...`, or cookie + `Accept-Language` fallback) so that SSR output is already localized
- A language switcher must be available in the header and must preserve the current page (product detail, cart, filters, pagination)
- No hardcoded UI strings in components: all text lives in translation files (one namespace per feature, e.g. `common`, `home`, `product`, `cart`)
- Prices, numbers and dates must be formatted with the `Intl` API according to the active locale (currency symbol, decimal separator, thousands separator)
- Pluralization must be handled through the i18n layer (e.g. "1 item" / "2 items"), never through string concatenation
- The `<html lang>` attribute must reflect the active locale
- Layout must not depend on text length: labels, buttons and badges must accommodate longer French translations without overflow
- Product data coming from the API may remain in its original language; only the UI chrome is required to be translated
- Optional: `hreflang` alternate links for SEO, and RTL-ready layout (logical CSS properties)

## Accessibility (a11y)

- Target compliance: WCAG 2.1 level AA
- Use semantic HTML landmarks (`header`, `nav`, `main`, `footer`) and a coherent heading hierarchy (a single `h1` per page)
- Every interactive element must be reachable and operable with the keyboard alone, with a visible focus indicator
- A "Skip to main content" link must be the first focusable element on each page
- Icon-only controls (cart icon, remove item, pagination arrows) must have an accessible name (`aria-label` or visually hidden text)
- Product images must have meaningful `alt` text (product title); purely decorative images use an empty `alt`
- Sort and filter controls must be native form controls or fully accessible custom widgets, with an associated `<label>`
- Pagination must be a `<nav aria-label="Pagination">` and the current page must be marked with `aria-current="page"`
- Dynamic feedback (product added to cart, item removed, cart count update) must be announced to screen readers via an `aria-live` region
- Text and interactive components must meet contrast ratios of at least 4.5:1 (normal text) and 3:1 (large text, UI components)
- Touch targets must be at least 44×44 px on mobile
- Respect `prefers-reduced-motion` for any animation or transition
- Forms and actions must work without JavaScript (progressive enhancement through Remix `<Form>` and actions)
- The application must pass an automated audit (Lighthouse / axe) with no critical or serious issues, and must be manually tested with a screen reader (VoiceOver) on the three pages

## Development Resources

- Figma
- Dummy JSON API

## Key Notes

- Appropriately utilize Remix's loader and action functions
- Pay attention to the Remix routing structure
- The project should be submitted on a version control platform
