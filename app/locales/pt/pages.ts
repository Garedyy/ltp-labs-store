import type en from "~/locales/en/pages";

export default {
  home: {
    title: "Produtos em destaque",
    description: "Os nossos produtos mais bem avaliados, escolhidos em todo o catálogo.",
    intro: "Os nossos produtos mais bem avaliados, escolhidos em todo o catálogo.",
    browse: "Ver a loja",
  },
  about: {
    title: "Sobre nós",
    description:
      "A história, os valores e a equipa da The Online Store, uma loja fictícia criada para o desafio da LTP Labs.",
    intro:
      "A The Online Store é uma loja fictícia criada para o desafio de programação da LTP Labs. Os produtos vêm de um catálogo público de demonstração; a equipa, as moradas e as histórias deste site são inventadas.",
    story: {
      heading: "A nossa história",
      p1: "A loja começou em 2024 como um projeto de fim de semana entre três amigos do Porto, cansados de lojas que escondem o preço até ao último passo. A primeira versão vendia uma dúzia de acessórios para telemóvel a partir de um quarto vago e entregava-os de bicicleta.",
      p2: "Dois anos depois, o catálogo cobre beleza, mercearia, mobiliário e eletrónica, mas as regras não mudaram: o total que vê é o total que paga, cada página de produto mostra o stock real e é uma pessoa que responde a cada mensagem.",
      p3: "Este site é a versão de demonstração dessa loja. Existe para mostrar como uma loja independente pode ser rápida, traduzida e utilizável por todos, com ou sem JavaScript.",
    },
    values: {
      heading: "O que defendemos",
      honesty: {
        title: "Um catálogo honesto",
        body: "Stock real, avaliações reais, sem truques. Quando um produto está esgotado, o botão di-lo em vez de se esconder.",
      },
      prices: {
        title: "Preços justos",
        body: "O envio é uma taxa fixa mostrada desde o primeiro ecrã e os códigos promocionais estão impressos ao lado do campo a que pertencem.",
      },
      people: {
        title: "Feita para todos",
        body: "Cada página funciona com teclado, leitor de ecrã, ligação lenta e um ecrã de 320 píxeis. A acessibilidade faz parte do desenho, não é uma correção no fim.",
      },
    },
    team: {
      heading: "A equipa",
      note: "Três pessoas fictícias que representam uma equipa real.",
      members: {
        ines: { name: "Inês Tavares", role: "Fundadora e compradora" },
        rui: { name: "Rui Castanheira", role: "Catálogo e logística" },
        leonor: { name: "Leonor Baptista", role: "Apoio ao cliente" },
      },
    },
  },
  contact: {
    title: "Contacto",
    description: "Escreva à The Online Store ou visite-nos no Porto.",
    intro: "Uma dúvida sobre uma encomenda ou um produto? Escreva-nos ou passe pela loja.",
    details: {
      heading: "Fale connosco",
      address: "Morada",
      addressValue: "Rua da Demonstração 42, 4000-000 Porto, Portugal",
      email: "E-mail",
      emailValue: "hello@theonlinestore.example",
      phone: "Telefone",
      phoneValue: "+351 200 000 000",
      hours: "Horário",
      hoursValue: "Segunda a sexta, das 9:00 às 18:00 (hora de Lisboa)",
    },
    form: {
      heading: "Envie-nos uma mensagem",
      name: "O seu nome",
      email: "Endereço de e-mail",
      message: "Mensagem",
      submit: "Enviar mensagem",
      sending: "A enviar...",
      note: "Esta é uma loja de demonstração: a mensagem é verificada mas não é enviada para lado nenhum.",
    },
    sent: {
      title: "Mensagem recebida",
      body: "Obrigado. Uma loja real responderia em dois dias úteis; nesta demonstração nada foi enviado nem guardado.",
      another: "Enviar outra mensagem",
    },
  },
  blog: {
    title: "Blogue",
    description: "Novidades e guias da The Online Store.",
    intro:
      "Histórias da loja, guias para escolher melhor e novidades sobre a nossa forma de trabalhar.",
    publishedOn: "Publicado em",
    posts: {
      packaging: {
        title: "Porque passámos a embalagens sem plástico",
        excerpt:
          "Desde junho, todas as encomendas saem do armazém apenas em papel e cartão. Eis o que mudou e o que custou.",
        body1:
          "Durante dois anos enviámos com o que os fornecedores nos mandavam: plástico de bolhas, esferovite e fita adesiva. Na primavera pesámos uma semana de encomendas e descobrimos que um terço do peso era embalagem que ninguém guardava.",
        body2:
          "As novas caixas são de cartão canelado com enchimento de papel e uma fita de papel que se rasga à mão. Custam cerca de quatro cêntimos a mais por encomenda e pesam menos, por isso a fatura da transportadora desceu quase o mesmo.",
      },
      laptops: {
        title: "Como escolher um portátil que dure",
        excerpt:
          "Ecrã, memória, portas, bateria: as quatro coisas a verificar antes de olhar para o preço.",
        body1:
          "A maioria dos portáteis substituídos cedo não está avariada; está lenta ou sem espaço. Dezasseis gigabytes de memória e um disco SSD rápido mantêm uma máquina agradável durante muito mais tempo do que um processador mais rápido.",
        body2:
          "Veja as portas que vai realmente usar, prefira um ecrã mate se trabalha perto de janelas e leia o valor da bateria com desconfiança: divida-o a meio para um dia realista.",
      },
      warehouse: {
        title: "Um dia no nosso armazém do Porto",
        excerpt:
          "Da entrega das 7 da manhã à última recolha da transportadora às 17 horas, como uma encomenda chega à sua porta.",
        body1:
          "O dia começa quando chegam as carrinhas dos fornecedores. Cada produto é contado, conferido com a encomenda e colocado numa prateleira numerada; o stock que vê no site é atualizado nesse momento, não ao fim do dia.",
        body2:
          "As encomendas são recolhidas em lotes de dez, embaladas em duas estações e lidas mais uma vez antes de a transportadora chegar. Num dia normal, a última encomenda sai às cinco; em saldos, mais perto das sete.",
      },
    },
  },
  account: {
    title: "Conta",
    description: "A sua conta de demonstração na The Online Store.",
    intro:
      "As contas são uma demonstração: iniciar sessão não cria nem guarda nada. Esta página indica o que este dispositivo sabe sobre si.",
    signIn: {
      heading: "Iniciar sessão",
      email: "Endereço de e-mail",
      password: "Palavra-passe",
      submit: "Iniciar sessão",
      signingIn: "A iniciar sessão...",
      note: "Qualquer endereço e palavra-passe passam na verificação; nenhuma conta é criada.",
      demo: "O início de sessão é uma demonstração: nenhuma conta foi criada e nada foi guardado. O seu carrinho e a sua última encomenda vivem num cookie neste dispositivo.",
    },
    session: {
      heading: "Neste dispositivo",
      cart: "Carrinho",
      cartCount_zero: "Vazio",
      cartCount_one: "{{count}} artigo",
      cartCount_many: "{{count}} artigos",
      cartCount_other: "{{count}} artigos",
      viewCart: "Ver o carrinho",
      lastOrder: "Última encomenda",
      noOrder: "Ainda sem encomendas",
      orderSummary: "{{number}}, {{total}}",
      viewOrder: "Ver a confirmação",
    },
    profile: {
      heading: "Perfil de demonstração",
      note: "O perfil de exemplo que todos os visitantes veem.",
      name: "Nome",
      nameValue: "Cliente de demonstração",
      since: "Cliente desde",
      language: "Idioma preferido",
    },
  },
} satisfies typeof en;
