export default {
  home: {
    title: "Trending products",
    description: "Our best-rated products, picked from the whole catalogue.",
    intro: "Our best-rated products, picked from the whole catalogue.",
    browse: "Browse the shop",
    seeMore: "See more",
  },
  about: {
    title: "About us",
    description:
      "The story, values and team of The Online Store, a fictional shop built for the LTP Labs challenge.",
    intro:
      "The Online Store is a fictional shop built for the LTP Labs coding challenge. The products come from a public demo catalogue; the team, the addresses and the stories on this site are invented.",
    story: {
      heading: "Our story",
      p1: "The store started in 2024 as a weekend project between three friends in Porto who were tired of shops that hide the price until the last step. The first version sold a dozen phone accessories from a spare room and shipped them by bicycle.",
      p2: "Two years later the catalogue covers beauty, groceries, furniture and electronics, but the rules have not changed: the total you see is the total you pay, every product page shows the real stock, and a human answers every message.",
      p3: "This site is the demo version of that store. It exists to show how an independent shop can be fast, translated and usable by everyone, with or without JavaScript.",
    },
    values: {
      heading: "What we stand for",
      honesty: {
        title: "An honest catalogue",
        body: "Real stock, real ratings, no dark patterns. When a product is out of stock, the button says so instead of hiding.",
      },
      prices: {
        title: "Fair prices",
        body: "Shipping is a flat fee shown from the first screen, and promo codes are printed next to the field they belong to.",
      },
      people: {
        title: "Built for everyone",
        body: "Every page works with a keyboard, a screen reader, a slow connection and a 320-pixel screen. Accessibility is part of the design, not a fix at the end.",
      },
    },
    team: {
      heading: "The team",
      note: "Three fictional people who stand in for a real team.",
      members: {
        ines: { name: "Inês Tavares", role: "Founder and buyer" },
        rui: { name: "Rui Castanheira", role: "Catalogue and logistics" },
        leonor: { name: "Leonor Baptista", role: "Customer care" },
      },
    },
  },
  contact: {
    title: "Contact",
    description: "Write to The Online Store or visit us in Porto.",
    intro: "A question about an order or a product? Write to us or drop by the shop.",
    details: {
      heading: "Get in touch",
      address: "Address",
      addressValue: "Rua da Demonstração 42, 4000-000 Porto, Portugal",
      email: "Email",
      emailValue: "hello@theonlinestore.example",
      phone: "Phone",
      phoneValue: "+351 200 000 000",
      hours: "Opening hours",
      hoursValue: "Monday to Friday, 9:00 to 18:00 (Lisbon time)",
    },
    form: {
      heading: "Send us a message",
      name: "Your name",
      email: "Email address",
      message: "Message",
      submit: "Send message",
      sending: "Sending...",
      note: "This is a demo store: the message is checked but not sent anywhere.",
    },
    sent: {
      title: "Message received",
      body: "Thank you. A real store would answer within two working days; in this demo nothing was sent or stored.",
      another: "Send another message",
    },
  },
  blog: {
    title: "Blog",
    description: "News and guides from The Online Store.",
    intro: "Stories from the shop, guides to choose better and news about how we work.",
    publishedOn: "Published on",
    posts: {
      packaging: {
        title: "Why we switched to plastic-free packaging",
        excerpt:
          "Since June every order leaves the warehouse in paper and cardboard only. Here is what changed and what it cost.",
        body1:
          "For two years we shipped in whatever the suppliers sent us: bubble wrap, foam and tape. In spring we weighed a week of parcels and found that a third of the weight was packaging nobody kept.",
        body2:
          "The new boxes are corrugated cardboard with paper cushioning and a paper tape that tears by hand. They cost about four cents more per order and weigh less, so the courier bill went down by almost the same amount.",
      },
      laptops: {
        title: "How to choose a laptop that lasts",
        excerpt:
          "Screen, memory, ports, battery: the four things to check before looking at the price tag.",
        body1:
          "Most laptops that are replaced early are not broken; they are slow or out of storage. Sixteen gigabytes of memory and a fast solid-state drive keep a machine pleasant far longer than a faster processor does.",
        body2:
          "Look at the ports you will actually use, prefer a matte screen if you work near windows, and read the battery figure with suspicion: halve it for a realistic day.",
      },
      warehouse: {
        title: "A day in our Porto warehouse",
        excerpt:
          "From the 7 a.m. delivery to the last courier pick-up at 5 p.m., how an order finds its way to your door.",
        body1:
          "The day starts when the supplier vans arrive. Every product is counted, checked against the order and put on a numbered shelf; the stock you see on the site is updated at that moment, not at the end of the day.",
        body2:
          "Orders are picked in batches of ten, packed at two stations and scanned once more before the courier arrives. On a normal day the last parcel leaves at five; during sales it is closer to seven.",
      },
    },
  },
  account: {
    title: "Account",
    description: "Your demo account at The Online Store.",
    intro:
      "Accounts are a demo: signing in creates nothing and stores nothing. This page lists what this device knows about you.",
    signIn: {
      heading: "Sign in",
      email: "Email address",
      password: "Password",
      submit: "Sign in",
      signingIn: "Signing in...",
      note: "Any address and password pass the check; no account is created.",
      demo: "Sign-in is a demo: no account was created and nothing was stored. Your cart and your last order live in a cookie on this device.",
    },
    session: {
      heading: "On this device",
      cart: "Cart",
      cartCount_zero: "Empty",
      cartCount_one: "{{count}} item",
      cartCount_many: "{{count}} items",
      cartCount_other: "{{count}} items",
      viewCart: "View cart",
      lastOrder: "Last order",
      noOrder: "No order yet",
      orderSummary: "{{number}}, {{total}}",
      viewOrder: "View the confirmation",
    },
    profile: {
      heading: "Demo profile",
      note: "The sample profile every visitor sees.",
      name: "Name",
      nameValue: "Demo customer",
      since: "Customer since",
      language: "Preferred language",
    },
  },
};
