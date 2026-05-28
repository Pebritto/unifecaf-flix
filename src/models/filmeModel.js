const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function listarTodos() {
  return prisma.filme.findMany({ orderBy: { id: "asc" } });
}

async function buscarPorId(id) {
  return prisma.filme.findUnique({ where: { id } });
}

async function filtrar(termo) {
  return prisma.filme.findMany({
    where: {
      OR: [
        { nome: { contains: termo } },
        { sinopse: { contains: termo } },
      ],
    },
    orderBy: { id: "asc" },
  });
}

module.exports = { listarTodos, buscarPorId, filtrar };
