
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../dist/generated/prisma/client.js";

const { DATABASE_URL, SEED_DEMO_PASSWORD } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL não configurada.");
}

if (!SEED_DEMO_PASSWORD || SEED_DEMO_PASSWORD.length < 12) {
  throw new Error(
    "Configure SEED_DEMO_PASSWORD com pelo menos 12 caracteres no .env.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

const categoriasNomes = [
  "Música",
  "Cultura",
  "Esporte",
  "Natureza",
  "Feira",
  "Gastronomia",
];

const cidades = {
  Caraguatatuba: {
    latitude: -23.6203,
    longitude: -45.4131,
  },
  "São Sebastião": {
    latitude: -23.795,
    longitude: -45.407,
  },
  Ilhabela: {
    latitude: -23.778,
    longitude: -45.355,
  },
  Ubatuba: {
    latitude: -23.433,
    longitude: -45.083,
  },
};

const descricaoDemo =
  "Evento fictício para demonstração da plataforma Maré LN. " +
  "Data, local e informações são ilustrativos.";

const contas = [
  {
    nome: "Administrador de Demonstração",
    email: "admin.demo@mareln.local",
    tipo: "ADMIN",
    cidadePreferida: "Caraguatatuba",
    interesses: ["Cultura", "Tecnologia"],
  },
  {
    nome: "Divulgador de Demonstração 1",
    email: "divulgador1.demo@mareln.local",
    tipo: "DIVULGADOR",
    cidadePreferida: "Caraguatatuba",
    interesses: ["Música", "Feira"],
  },
  {
    nome: "Divulgador de Demonstração 2",
    email: "divulgador2.demo@mareln.local",
    tipo: "DIVULGADOR",
    cidadePreferida: "Ubatuba",
    interesses: ["Natureza", "Esporte"],
  },
  {
    nome: "Visitante de Demonstração 1",
    email: "visitante1.demo@mareln.local",
    tipo: "VISITANTE",
    cidadePreferida: "Caraguatatuba",
    interesses: ["Música", "Gastronomia"],
  },
  {
    nome: "Visitante de Demonstração 2",
    email: "visitante2.demo@mareln.local",
    tipo: "VISITANTE",
    cidadePreferida: "Ilhabela",
    interesses: ["Natureza", "Cultura"],
  },
];

const eventosDemo = [
  {
    chave: "feira-caragua",
    titulo: "Feira Caiçara de Artesanato — DEMONSTRAÇÃO",
    categoria: "Feira",
    data: "2026-11-20T09:00:00-03:00",
    local: "Centro de Caraguatatuba (local ilustrativo)",
    cidade: "Caraguatatuba",
    status: "APROVADO",
    divulgador: "divulgador1.demo@mareln.local",
  },
  {
    chave: "musica-caragua",
    titulo: "Festival de Música na Orla — DEMONSTRAÇÃO",
    categoria: "Música",
    data: "2026-11-21T18:00:00-03:00",
    local: "Orla de Caraguatatuba (local ilustrativo)",
    cidade: "Caraguatatuba",
    status: "APROVADO",
    divulgador: "divulgador2.demo@mareln.local",
  },
  {
    chave: "cultura-sao-sebastiao",
    titulo: "Mostra de Arte Caiçara — DEMONSTRAÇÃO",
    categoria: "Cultura",
    data: "2026-11-23T14:00:00-03:00",
    local: "Centro de São Sebastião (local ilustrativo)",
    cidade: "São Sebastião",
    status: "APROVADO",
    divulgador: "divulgador1.demo@mareln.local",
  },
  {
    chave: "natureza-ubatuba",
    titulo: "Caminhada Ambiental — DEMONSTRAÇÃO",
    categoria: "Natureza",
    data: "2026-11-25T07:00:00-03:00",
    local: "Parque de Ubatuba (local ilustrativo)",
    cidade: "Ubatuba",
    status: "APROVADO",
    divulgador: "divulgador2.demo@mareln.local",
  },
  {
    chave: "gastronomia-ilhabela",
    titulo: "Festival Gastronômico — DEMONSTRAÇÃO",
    categoria: "Gastronomia",
    data: "2026-11-27T11:00:00-03:00",
    local: "Centro de Ilhabela (local ilustrativo)",
    cidade: "Ilhabela",
    status: "APROVADO",
    divulgador: "divulgador1.demo@mareln.local",
  },
  {
    chave: "esporte-ubatuba",
    titulo: "Encontro Esportivo na Praia — DEMONSTRAÇÃO",
    categoria: "Esporte",
    data: "2026-11-29T08:00:00-03:00",
    local: "Praia de Ubatuba (local ilustrativo)",
    cidade: "Ubatuba",
    status: "APROVADO",
    divulgador: "divulgador2.demo@mareln.local",
  },
  {
    chave: "cultura-sao-sebastiao-2",
    titulo: "Exposição de Arte Marinha — DEMONSTRAÇÃO",
    categoria: "Cultura",
    data: "2026-12-03T14:00:00-03:00",
    local: "Centro de São Sebastião (local ilustrativo)",
    cidade: "São Sebastião",
    status: "APROVADO",
    divulgador: "divulgador1.demo@mareln.local",
  },
  {
    chave: "feira-ilhabela",
    titulo: "Feira de Produtos Artesanais — DEMONSTRAÇÃO",
    categoria: "Feira",
    data: "2026-12-05T10:00:00-03:00",
    local: "Centro de Ilhabela (local ilustrativo)",
    cidade: "Ilhabela",
    status: "APROVADO",
    divulgador: "divulgador2.demo@mareln.local",
  },
  {
    chave: "pendente-feira",
    titulo: "Feira Criativa — DEMONSTRAÇÃO PENDENTE",
    categoria: "Feira",
    data: "2026-12-07T10:00:00-03:00",
    local: "Centro de Caraguatatuba (local ilustrativo)",
    cidade: "Caraguatatuba",
    status: "PENDENTE",
    divulgador: "divulgador1.demo@mareln.local",
  },
  {
    chave: "pendente-corrida",
    titulo: "Corrida Solidária — DEMONSTRAÇÃO PENDENTE",
    categoria: "Esporte",
    data: "2026-12-09T07:00:00-03:00",
    local: "Centro de Ubatuba (local ilustrativo)",
    cidade: "Ubatuba",
    status: "PENDENTE",
    divulgador: "divulgador2.demo@mareln.local",
  },
  {
    chave: "rejeitado-evento",
    titulo: "Evento de Teste — DEMONSTRAÇÃO REJEITADA",
    categoria: "Gastronomia",
    data: "2026-12-12T11:00:00-03:00",
    local: "Centro de Ilhabela (local ilustrativo)",
    cidade: "Ilhabela",
    status: "REJEITADO",
    divulgador: "divulgador1.demo@mareln.local",
  },
];

async function main() {
  const senhaHash = await bcrypt.hash(SEED_DEMO_PASSWORD, 10);

  const usuarios = new Map();

  for (const conta of contas) {
    const usuario = await prisma.usuario.upsert({
      where: { email: conta.email },
      update: {
        nome: conta.nome,
        senha: senhaHash,
        tipo: conta.tipo,
        cidadePreferida: conta.cidadePreferida,
        interesses: conta.interesses,
      },
      create: {
        ...conta,
        senha: senhaHash,
      },
    });

    usuarios.set(conta.email, usuario);
  }

  const categorias = new Map();

  for (const nome of categoriasNomes) {
    const categoria = await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });

    categorias.set(nome, categoria);
  }

  const eventos = new Map();

  for (const item of eventosDemo) {
    const usuario = usuarios.get(item.divulgador);
    const categoria = categorias.get(item.categoria);
    const coordenadas = cidades[item.cidade];

    const dados = {
      titulo: item.titulo,
      descricao: descricaoDemo,
      data: new Date(item.data),
      local: item.local,
      cidade: item.cidade,
      latitude: coordenadas.latitude,
      longitude: coordenadas.longitude,
      precisaoLocalizacao: "APROXIMADA",
      status: item.status,
      categoriaId: categoria.id,
    };

    const existente = await prisma.evento.findFirst({
      where: {
        titulo: item.titulo,
        usuarioId: usuario.id,
      },
    });

    const evento = existente
      ? await prisma.evento.update({
          where: { id: existente.id },
          data: dados,
        })
      : await prisma.evento.create({
          data: {
            ...dados,
            usuarioId: usuario.id,
          },
        });

    eventos.set(item.chave, evento);
  }

  const favoritos = [
    ["visitante1.demo@mareln.local", "feira-caragua"],
    ["visitante1.demo@mareln.local", "musica-caragua"],
    ["visitante2.demo@mareln.local", "natureza-ubatuba"],
    ["visitante2.demo@mareln.local", "gastronomia-ilhabela"],
  ];

  for (const [email, chaveEvento] of favoritos) {
    const usuario = usuarios.get(email);
    const evento = eventos.get(chaveEvento);

    await prisma.favorito.upsert({
      where: {
        usuarioId_eventoId: {
          usuarioId: usuario.id,
          eventoId: evento.id,
        },
      },
      update: {},
      create: {
        usuarioId: usuario.id,
        eventoId: evento.id,
      },
    });
  }

  const visitante = usuarios.get("visitante1.demo@mareln.local");
  const eventoAvaliado = eventos.get("feira-caragua");

  await prisma.avaliacao.upsert({
    where: {
      usuarioId_eventoId: {
        usuarioId: visitante.id,
        eventoId: eventoAvaliado.id,
      },
    },
    update: { nota: 5 },
    create: {
      usuarioId: visitante.id,
      eventoId: eventoAvaliado.id,
      nota: 5,
    },
  });

  console.log("Seed do Mareln concluído.");
  console.log("5 contas de demonstração criadas/atualizadas.");
  console.log("6 categorias disponíveis.");
  console.log("8 eventos aprovados, 2 pendentes e 1 rejeitado.");
  console.log("4 favoritos e 1 avaliação preparados.");
  console.log("Todas as contas utilizam SEED_DEMO_PASSWORD.");
  console.log("Os eventos possuem dados fictícios e coordenadas aproximadas.");
  console.log("Nenhum registro externo ao seed foi apagado.");
}

main()
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
