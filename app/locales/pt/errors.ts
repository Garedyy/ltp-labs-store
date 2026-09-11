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
  links: {
    home: "Ir para a loja",
    search: "Pesquisar produtos",
    cart: "Ver o carrinho",
  },
} satisfies typeof en;
