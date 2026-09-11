import type en from "~/locales/en/errors";

export default {
  notFound: {
    title: "Página não encontrada",
    description: "A página que procura não existe ou mudou de endereço.",
  },
  productNotFound: {
    title: "Produto não encontrado",
    description: "Este produto não existe ou já não está disponível.",
  },
  serviceUnavailable: {
    title: "Serviço de produtos indisponível",
    description: "Não foi possível aceder ao catálogo de produtos. Tente novamente daqui a pouco.",
    retry: "Tentar novamente",
  },
  unexpected: {
    title: "Ocorreu um problema",
    description: "Ocorreu um erro inesperado. Tente novamente.",
  },
  methodNotAllowed: {
    title: "Método não permitido",
    description: "Este endereço não aceita esse tipo de pedido.",
  },
  badRequest: {
    title: "Pedido inválido",
    description: "Não foi possível processar o pedido.",
  },
  invalidIntent: {
    title: "Ação desconhecida",
    description: "Não foi possível compreender o pedido.",
  },
  invalidQuantity: {
    title: "Introduza um número inteiro",
    description: "A quantidade tem de ser um número inteiro entre 1 e 99.",
  },
  outOfStock: {
    title: "Este produto está esgotado",
    description: "Não pode ser adicionado ao carrinho.",
  },
  cartFull: {
    title: "O seu carrinho está cheio",
    description:
      "Um carrinho aceita no máximo 50 produtos diferentes. Remova um para adicionar outro.",
  },
  promoRequired: {
    title: "Introduza um código promocional",
    description: "Escreva um código antes de o aplicar.",
  },
  promoInvalid: {
    title: "Código promocional desconhecido",
    description: "Verifique o código e tente novamente.",
  },
  emptyCart: {
    title: "O seu carrinho está vazio",
    description: "Adicione produtos antes de finalizar a compra.",
  },
  links: {
    home: "Ir para a loja",
    search: "Pesquisar produtos",
    cart: "Ver o carrinho",
  },
} satisfies typeof en;
