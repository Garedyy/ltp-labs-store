import type en from "~/locales/en/common";

export default {
  brand: "The Online Store",
  tagline: "Desafio de programação para a LTP Labs - loja de demonstração",
  skipToContent: "Saltar para o conteúdo principal",
  loading: "A carregar",
  errorPrefix: "Erro:",
  backTo: {
    shop: "Voltar à loja",
    cart: "Voltar ao carrinho",
    product: "Voltar ao produto",
  },
  nav: {
    label: "Principal",
    footerLabel: "Rodapé",
    home: "Início",
    shop: "Loja",
    about: "Sobre",
    contact: "Contacto",
    blog: "Blogue",
    account: "Conta",
    search: "Pesquisar",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
  },
  cartLink_zero: "Carrinho, vazio",
  cartLink_one: "Carrinho, {{count}} artigo",
  cartLink_many: "Carrinho, {{count}} artigos",
  cartLink_other: "Carrinho, {{count}} artigos",
  language: {
    label: "Idioma",
    current: "{{code}}, {{name}}. Mudar de idioma",
    switchTo: "Mudar para {{name}}",
  },
  theme: {
    label: "Tema",
    current: "Tema: {{name}}. Mudar de tema",
    applied: "Tema {{name}} aplicado",
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
  },
} satisfies typeof en;
