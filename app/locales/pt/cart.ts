import type en from "~/locales/en/cart";

export default {
  title: "O seu carrinho",
  description: "Reveja os artigos do seu carrinho antes de finalizar a compra.",
  viewCart: "Ver o carrinho",
  notice: {
    added_one: "Adicionado ao carrinho. Tem agora {{count}} artigo.",
    added_many: "Adicionado ao carrinho. Tem agora {{count}} artigos.",
    added_other: "Adicionado ao carrinho. Tem agora {{count}} artigos.",
    addedCapped: "Quantidade limitada ao stock disponível ({{max}}).",
    quantityUpdated: "Quantidade de {{title}} atualizada para {{quantity}}.",
    quantityClamped: "Quantidade limitada a {{max}}.",
    removed: "{{title}} removido do carrinho.",
    promoApplied: "Código {{code}} aplicado.",
    promoRemoved: "Código promocional removido.",
    itemsRemoved: "Alguns artigos já não estão disponíveis e foram removidos do carrinho.",
    quantitiesAdjusted: "Algumas quantidades foram ajustadas ao stock disponível.",
  },
} satisfies typeof en;
