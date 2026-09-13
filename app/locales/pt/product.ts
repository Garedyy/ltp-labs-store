import type en from "~/locales/en/product";

export default {
  description: "Detalhes do produto, preço, disponibilidade e avaliações.",
  gallery: {
    imageAlt: "{{title}}, imagem {{index}} de {{total}}",
    show: "Mostrar a imagem {{index}} de {{total}}",
    shown: "Imagem {{index}} de {{total}} apresentada",
    thumbnails: "Imagens do produto",
  },
  price: {
    sale: "Preço promocional",
    original: "Preço original",
  },
  rating: {
    label_one: "Classificação {{value}} em 5, {{count}} avaliação",
    label_many: "Classificação {{value}} em 5, {{count}} avaliações",
    label_other: "Classificação {{value}} em 5, {{count}} avaliações",
    label_zero: "Classificação {{value}} em 5, ainda sem avaliações",
  },
  stock: {
    inStock: "Em stock",
    low_one: "Só {{count}} em stock",
    low_many: "Só {{count}} em stock",
    low_other: "Só {{count}} em stock",
    out: "Esgotado",
  },
  addToCart: "Adicionar ao carrinho",
  adding: "A adicionar...",
  buyNow: "Comprar agora",
  buyingNow: "A finalizar a compra...",
  buyBlock: "Opções de compra",
  details: {
    heading: "Detalhes do produto",
  },
  info: {
    heading: "Informações práticas",
    brand: "Marca",
    sku: "Referência",
    shipping: "Envio",
    warranty: "Garantia",
    returns: "Política de devolução",
    dimensions: "Dimensões",
    dimensionsValue: "{{width}} x {{height}} x {{depth}} cm",
    dimensionsBy: "por",
    weight: "Peso",
    weightValue: "{{value}} kg",
    tags: "Etiquetas",
  },
  reviews: {
    item: "Avaliação {{index}} de {{total}}",
    heading_one: "{{count}} avaliação",
    heading_many: "{{count}} avaliações",
    heading_other: "{{count}} avaliações",
    rated: "Classificação {{value}} em 5",
  },
} satisfies typeof en;
