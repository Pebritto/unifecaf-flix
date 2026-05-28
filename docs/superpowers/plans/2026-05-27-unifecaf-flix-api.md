# API de Filmes UniFECAF Flix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma API REST em Node.js (Express + Prisma + MySQL, padrão MVC) que expõe 3 endpoints GET do acervo de filmes da "UniFECAF Flix", mais os entregáveis (script SQL, doc teórico, coleção Postman, roteiro de vídeo).

**Architecture:** MVC clássico — `routes → controller → model → Prisma → MySQL`. A "View" é a resposta JSON. Dados reais vêm de um CSV do IMDB, curados em ~200 filmes, com sinopse sintetizada (o CSV não tem sinopse).

**Tech Stack:** Node.js, Express, Prisma ORM, MySQL, `cors`, `dotenv`, `nodemon`. Estilo CommonJS. Verificação manual via `curl` (testes automatizados estão fora de escopo; o trabalho pede testes via Postman).

**Spec:** [docs/superpowers/specs/2026-05-27-unifecaf-flix-api-design.md](../specs/2026-05-27-unifecaf-flix-api-design.md)

**Convenção de verificação:** vários passos exigem a API ou o MySQL rodando. Suba o MySQL local antes da Task 4 e mantenha a API rodando (`npm run dev`) ao verificar as Tasks 6–8. Cada verificação mostra o `curl` e a saída esperada.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `package.json` | Dependências e scripts (`start`, `dev`). |
| `.env.example` / `.env` | `DATABASE_URL` e `PORT`. |
| `.gitignore` | Ignora `node_modules`, `.env`. |
| `prisma/schema.prisma` | `datasource` MySQL + `model Filme`. |
| `scripts/gerar-sql.js` | Lê o CSV, cura ~200 filmes, sintetiza sinopse, gera o `.sql`. |
| `database/unifecaf_flix.sql` | Entregável: CREATE DATABASE + TABLE + INSERTs. |
| `src/models/filmeModel.js` | Acesso a dados via Prisma (`listarTodos`, `buscarPorId`, `filtrar`). |
| `src/controllers/filmeController.js` | Validação + status HTTP + JSON. |
| `src/routes/filmeRoutes.js` | Mapeia URLs → controller. |
| `src/app.js` | Express + cors + json + rotas. |
| `src/server.js` | `app.listen()`. |
| `docs/parte-teorica.md` | Entregável Parte Teórica. |
| `docs/roteiro-video.md` | Entregável Roteiro do Vídeo. |
| `postman/unifecaf-flix.postman_collection.json` | Entregável Postman. |
| `README.md` | Como rodar. |

---

## Task 1: Inicializar o projeto e dependências

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "unifecaf-flix-api",
  "version": "1.0.0",
  "description": "API REST do acervo de filmes UniFECAF Flix",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.7",
    "prisma": "^5.22.0"
  }
}
```

- [ ] **Step 2: Criar `.gitignore`**

```
node_modules/
.env
```

- [ ] **Step 3: Criar `.env.example`**

```
DATABASE_URL="mysql://root:senha@localhost:3306/unifecaf_flix"
PORT=3000
```

- [ ] **Step 4: Instalar dependências**

Run: `npm install`
Expected: cria `node_modules/` e `package-lock.json` sem erros.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example
git commit -m "chore: inicializa projeto e dependencias"
```

---

## Task 2: Definir o schema do Prisma

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Criar `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Filme {
  id        Int      @id @default(autoincrement())
  nome      String   @db.VarChar(255)
  sinopse   String?  @db.Text
  ano       Int?
  duracao   String?  @db.VarChar(20)
  diretor   String?  @db.VarChar(255)
  genero    String?  @db.VarChar(255)
  elenco    String?  @db.VarChar(500)
  notaImdb  Decimal? @map("nota_imdb") @db.Decimal(3, 1)

  @@map("filme")
}
```

- [ ] **Step 2: Verificar que o schema é válido**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 3: Gerar o Prisma Client**

Run: `npx prisma generate`
Expected: `Generated Prisma Client` sem erros.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: define schema Prisma do model Filme"
```

---

## Task 3: Gerador do script SQL a partir do CSV

**Files:**
- Create: `scripts/gerar-sql.js`
- Create (gerado): `database/unifecaf_flix.sql`

- [ ] **Step 1: Criar `scripts/gerar-sql.js`**

Lê o CSV sem dependências externas (parser simples que respeita aspas), ordena por nº de votos desc, pega os top 200, sintetiza a sinopse e escreve o `.sql`.

```js
const fs = require("fs");
const path = require("path");

const CSV = path.join(__dirname, "..", "world_imdb_movies_top_movies_per_year.csv");
const OUT = path.join(__dirname, "..", "database", "unifecaf_flix.sql");
const LIMITE = 200;

// Parser de uma linha CSV respeitando aspas duplas.
function parseLinha(linha) {
  const campos = [];
  let atual = "";
  let dentroAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (dentroAspas && linha[i + 1] === '"') { atual += '"'; i++; }
      else dentroAspas = !dentroAspas;
    } else if (c === "," && !dentroAspas) {
      campos.push(atual); atual = "";
    } else {
      atual += c;
    }
  }
  campos.push(atual);
  return campos;
}

function escapar(valor) {
  if (valor === null || valor === undefined || valor === "") return "NULL";
  return "'" + String(valor).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

function numeroOuNull(valor) {
  const n = Number(String(valor).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && valor !== "" ? n : "NULL";
}

const conteudo = fs.readFileSync(CSV, "utf8");
const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim() !== "");
const cabecalho = parseLinha(linhas[0]);
const idx = (nome) => cabecalho.indexOf(nome);

const iTitle = idx("title");
const iYear = idx("year");
const iDuration = idx("duration");
const iRating = idx("rating_imdb");
const iVote = idx("vote");
const iDirector = idx("director");
const iStar = idx("star");
const iGenre = idx("genre");

const filmes = linhas.slice(1)
  .map(parseLinha)
  .filter((c) => c[iTitle] && c[iTitle].trim() !== "")
  .map((c) => ({
    nome: c[iTitle],
    ano: c[iYear],
    duracao: c[iDuration],
    diretor: c[iDirector],
    genero: c[iGenre],
    elenco: c[iStar],
    nota: c[iRating],
    votos: Number(String(c[iVote]).replace(/[^0-9]/g, "")) || 0,
  }))
  .sort((a, b) => b.votos - a.votos)
  .slice(0, LIMITE);

function sinopse(f) {
  const partes = [];
  if (f.genero) partes.push(`Filme de ${f.genero}`);
  if (f.ano) partes.push(`lançado em ${f.ano}`);
  if (f.diretor) partes.push(`dirigido por ${f.diretor}`);
  if (f.elenco) partes.push(`estrelando ${f.elenco}`);
  return partes.join(", ") + ".";
}

let sql = "";
sql += "CREATE DATABASE IF NOT EXISTS unifecaf_flix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
sql += "USE unifecaf_flix;\n\n";
sql += "DROP TABLE IF EXISTS filme;\n";
sql += "CREATE TABLE filme (\n";
sql += "  id INT AUTO_INCREMENT PRIMARY KEY,\n";
sql += "  nome VARCHAR(255) NOT NULL,\n";
sql += "  sinopse TEXT,\n";
sql += "  ano INT,\n";
sql += "  duracao VARCHAR(20),\n";
sql += "  diretor VARCHAR(255),\n";
sql += "  genero VARCHAR(255),\n";
sql += "  elenco VARCHAR(500),\n";
sql += "  nota_imdb DECIMAL(3,1)\n";
sql += ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n";

for (const f of filmes) {
  const valores = [
    escapar(f.nome),
    escapar(sinopse(f)),
    numeroOuNull(f.ano),
    escapar(f.duracao),
    escapar(f.diretor),
    escapar(f.genero),
    escapar(f.elenco),
    numeroOuNull(f.nota),
  ].join(", ");
  sql += `INSERT INTO filme (nome, sinopse, ano, duracao, diretor, genero, elenco, nota_imdb) VALUES (${valores});\n`;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, sql, "utf8");
console.log(`Gerado ${OUT} com ${filmes.length} filmes.`);
```

- [ ] **Step 2: Rodar o gerador**

Run: `node scripts/gerar-sql.js`
Expected: `Gerado .../database/unifecaf_flix.sql com 200 filmes.`

- [ ] **Step 3: Conferir o SQL gerado**

Run: `head -20 database/unifecaf_flix.sql && grep -c "INSERT INTO filme" database/unifecaf_flix.sql`
Expected: vê o `CREATE TABLE filme` e a contagem `200`.

- [ ] **Step 4: Commit**

```bash
git add scripts/gerar-sql.js database/unifecaf_flix.sql
git commit -m "feat: gera script SQL com 200 filmes a partir do CSV"
```

---

## Task 4: Criar e popular o banco

**Files:** nenhum arquivo de código (operação de banco). Requer MySQL rodando localmente.

- [ ] **Step 1: Importar o script SQL**

Run: `mysql -u root -p < database/unifecaf_flix.sql`
Expected: sem erros (pede senha do MySQL).

- [ ] **Step 2: Verificar a contagem de registros**

Run: `mysql -u root -p -e "SELECT COUNT(*) FROM unifecaf_flix.filme;"`
Expected: `COUNT(*)` = `200`.

- [ ] **Step 3: Criar o `.env` real**

Copie `.env.example` para `.env` e ajuste a senha do MySQL na `DATABASE_URL`.
Run: `cp .env.example .env`
Depois edite `.env` com a senha correta. (Não commitar — está no `.gitignore`.)

- [ ] **Step 4: Validar a conexão do Prisma com o banco**

Run: `npx prisma db pull --print`
Expected: imprime um schema contendo `model filme` — confirma que o Prisma conecta e enxerga a tabela.

---

## Task 5: Implementar o Model

**Files:**
- Create: `src/models/filmeModel.js`

- [ ] **Step 1: Criar `src/models/filmeModel.js`**

```js
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
```

> Nota: no MySQL o `contains` do Prisma já é case-insensitive por causa do collation `utf8mb4_unicode_ci`.

- [ ] **Step 2: Verificar o Model isoladamente**

Run:
```bash
node -e "const m=require('./src/models/filmeModel'); m.listarTodos().then(f=>{console.log('total:',f.length); console.log(f[0]); process.exit(0)});"
```
Expected: imprime `total: 200` e o primeiro filme como objeto.

- [ ] **Step 3: Commit**

```bash
git add src/models/filmeModel.js
git commit -m "feat: implementa filmeModel com acesso via Prisma"
```

---

## Task 6: Implementar Controller e Routes

**Files:**
- Create: `src/controllers/filmeController.js`
- Create: `src/routes/filmeRoutes.js`

- [ ] **Step 1: Criar `src/controllers/filmeController.js`**

```js
const filmeModel = require("../models/filmeModel");

async function listar(req, res) {
  try {
    const filmes = await filmeModel.listarTodos();
    return res.status(200).json({ status: true, items: filmes.length, filmes });
  } catch (erro) {
    return res.status(500).json({ status: false, message: "Erro ao listar filmes." });
  }
}

async function buscarPorId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: false, message: "ID inválido." });
  }
  try {
    const filme = await filmeModel.buscarPorId(id);
    if (!filme) {
      return res.status(404).json({ status: false, message: "Filme não encontrado." });
    }
    return res.status(200).json({ status: true, filme });
  } catch (erro) {
    return res.status(500).json({ status: false, message: "Erro ao buscar filme." });
  }
}

async function filtrar(req, res) {
  const nome = (req.query.nome || "").trim();
  if (nome === "") {
    return res.status(400).json({ status: false, message: "Parâmetro 'nome' é obrigatório." });
  }
  try {
    const filmes = await filmeModel.filtrar(nome);
    return res.status(200).json({ status: true, items: filmes.length, filmes });
  } catch (erro) {
    return res.status(500).json({ status: false, message: "Erro ao filtrar filmes." });
  }
}

module.exports = { listar, buscarPorId, filtrar };
```

- [ ] **Step 2: Criar `src/routes/filmeRoutes.js`**

```js
const express = require("express");
const router = express.Router();
const filmeController = require("../controllers/filmeController");

router.get("/filme", filmeController.listar);
router.get("/filme/:id", filmeController.buscarPorId);
router.get("/filtro/filme", filmeController.filtrar);

module.exports = router;
```

- [ ] **Step 3: Commit**

```bash
git add src/controllers/filmeController.js src/routes/filmeRoutes.js
git commit -m "feat: implementa controller e rotas dos filmes"
```

---

## Task 7: Montar o app Express e o servidor

**Files:**
- Create: `src/app.js`
- Create: `src/server.js`

- [ ] **Step 1: Criar `src/app.js`**

```js
const express = require("express");
const cors = require("cors");
const filmeRoutes = require("./routes/filmeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/controle-filmes", filmeRoutes);

module.exports = app;
```

- [ ] **Step 2: Criar `src/server.js`**

```js
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Subir o servidor**

Run: `npm run dev`
Expected: `Servidor rodando em http://localhost:3000`. Mantenha rodando para as verificações abaixo.

- [ ] **Step 4: Commit**

```bash
git add src/app.js src/server.js
git commit -m "feat: configura app Express e servidor"
```

---

## Task 8: Verificar os 3 endpoints (via curl)

**Files:** nenhum. Requer a API rodando (Task 7) e o banco populado (Task 4).

- [ ] **Step 1: Listar todos**

Run: `curl -s http://localhost:3000/v1/controle-filmes/filme | head -c 300`
Expected: JSON `{"status":true,"items":200,"filmes":[...]}`.

- [ ] **Step 2: Buscar por ID existente**

Run: `curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/v1/controle-filmes/filme/1`
Expected: `{"status":true,"filme":{...}}` e `HTTP 200`.

- [ ] **Step 3: Buscar por ID inexistente → 404**

Run: `curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/v1/controle-filmes/filme/999999`
Expected: `{"status":false,"message":"Filme não encontrado."}` e `HTTP 404`.

- [ ] **Step 4: Buscar por ID inválido → 400**

Run: `curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/v1/controle-filmes/filme/abc`
Expected: `{"status":false,"message":"ID inválido."}` e `HTTP 400`.

- [ ] **Step 5: Filtrar por nome**

Run: `curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/v1/controle-filmes/filtro/filme?nome=star"`
Expected: `{"status":true,"items":<n>,"filmes":[...]}` com `n >= 1` e `HTTP 200`.

- [ ] **Step 6: Filtrar sem o parâmetro → 400**

Run: `curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/v1/controle-filmes/filtro/filme"`
Expected: `{"status":false,"message":"Parâmetro 'nome' é obrigatório."}` e `HTTP 400`.

---

## Task 9: Coleção Postman

**Files:**
- Create: `postman/unifecaf-flix.postman_collection.json`

- [ ] **Step 1: Criar a coleção**

```json
{
  "info": {
    "name": "UniFECAF Flix API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:3000/v1/controle-filmes" }
  ],
  "item": [
    {
      "name": "Listar todos os filmes",
      "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/filme", "host": ["{{baseUrl}}"], "path": ["filme"] } }
    },
    {
      "name": "Buscar filme por ID",
      "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/filme/1", "host": ["{{baseUrl}}"], "path": ["filme", "1"] } }
    },
    {
      "name": "Filtrar filmes por nome/sinopse",
      "request": { "method": "GET", "url": { "raw": "{{baseUrl}}/filtro/filme?nome=star", "host": ["{{baseUrl}}"], "path": ["filtro", "filme"], "query": [{ "key": "nome", "value": "star" }] } }
    }
  ]
}
```

- [ ] **Step 2: Verificar que é um JSON válido**

Run: `node -e "JSON.parse(require('fs').readFileSync('postman/unifecaf-flix.postman_collection.json','utf8')); console.log('JSON válido')"`
Expected: `JSON válido`.

- [ ] **Step 3: Commit**

```bash
git add postman/unifecaf-flix.postman_collection.json
git commit -m "docs: adiciona colecao Postman dos 3 endpoints"
```

---

## Task 10: Documentação (Parte Teórica, Roteiro, README)

**Files:**
- Create: `docs/parte-teorica.md`
- Create: `docs/roteiro-video.md`
- Create: `README.md`

- [ ] **Step 1: Criar `docs/parte-teorica.md`**

Documento com as seções exigidas pelo trabalho (2,0 pts):

```markdown
# Parte Teórica — API de Filmes UniFECAF Flix

## 1. Arquitetura utilizada (MVC + REST)
A API segue o padrão **MVC**:
- **Model** (`src/models/filmeModel.js`): acesso a dados via Prisma; não conhece HTTP.
- **Controller** (`src/controllers/filmeController.js`): valida entrada, define status HTTP e devolve JSON.
- **View**: numa API REST, a resposta JSON é a "View".
- **Routes** (`src/routes/filmeRoutes.js`): mapeia URLs aos métodos do controller.

O padrão **REST** organiza os recursos por URL e usa verbos HTTP (aqui, GET) e status codes
(200, 400, 404, 500) para comunicar o resultado — facilitando integração e manutenção.

## 2. Justificativa das escolhas tecnológicas
- **Node.js**: runtime JavaScript no servidor, foco da disciplina.
- **Express**: framework HTTP minimalista que simplifica rotas e middlewares.
- **MySQL**: banco relacional pedido no trabalho; adequado a dados estruturados de filmes.
- **Prisma ORM**: substitui SQL manual por uma API tipada, gera o client, previne SQL Injection
  e mapeia a tabela `filme` para objetos JavaScript.
- **Rotas versionadas** (`/v1/...`): boa prática REST para evolução sem quebrar consumidores.

## 3. Endpoints
| Método | Rota | Parâmetros | Descrição |
|---|---|---|---|
| GET | `/v1/controle-filmes/filme` | — | Lista todos os filmes |
| GET | `/v1/controle-filmes/filme/:id` | `id` (path, inteiro) | Busca um filme pelo ID |
| GET | `/v1/controle-filmes/filtro/filme?nome=xxx` | `nome` (query) | Filtra por nome ou sinopse |

Status: 200 (sucesso), 400 (entrada inválida), 404 (não encontrado), 500 (erro interno).

## 4. Estrutura de pastas
(reproduzir a estrutura `src/` do projeto, explicando o papel de cada pasta: models, controllers, routes, app.js, server.js; prisma/; database/.)

## 5. Trechos de código
(incluir capturas/trechos do controller e do model demonstrando o entendimento; tirar prints do Postman.)
```

- [ ] **Step 2: Criar `docs/roteiro-video.md`**

```markdown
# Roteiro — Vídeo Pitch (até 4 min)

**0:00–0:30 — Abertura**
- Apresentação e objetivo: API REST do acervo "UniFECAF Flix" em Node.js.

**0:30–1:30 — Arquitetura**
- Explicar MVC: routes → controller → model → Prisma → MySQL.
- Por que REST e por que Prisma + MySQL.
- Mostrar a estrutura de pastas no editor.

**1:30–3:00 — Demonstração no Postman**
- GET listar todos (200).
- GET por ID existente (200) e inexistente (404).
- GET filtro por nome (200) e sem parâmetro (400).
- Mostrar o JSON e o status code em cada um.

**3:00–4:00 — Aprendizados e desafios**
- Sintetizar a sinopse a partir do CSV (não havia coluna de sinopse).
- Separar responsabilidades no MVC; status HTTP corretos.
- Encerramento.

> Lembrar: subir no YouTube (privado/não listado) e conferir o link antes de enviar.
```

- [ ] **Step 3: Criar `README.md`**

```markdown
# API de Filmes UniFECAF Flix

API REST do acervo de filmes (Node.js + Express + Prisma + MySQL, padrão MVC).

## Como rodar
1. `npm install`
2. Subir MySQL local. Copiar `.env.example` para `.env` e ajustar a `DATABASE_URL`.
3. Importar os dados: `mysql -u root -p < database/unifecaf_flix.sql`
4. `npx prisma generate`
5. `npm run dev` (ou `npm start`)

## Endpoints
- `GET /v1/controle-filmes/filme` — lista todos
- `GET /v1/controle-filmes/filme/:id` — busca por ID
- `GET /v1/controle-filmes/filtro/filme?nome=xxx` — filtra por nome ou sinopse

Importar `postman/unifecaf-flix.postman_collection.json` no Postman para testar.
```

- [ ] **Step 4: Verificar que os docs existem**

Run: `ls docs/parte-teorica.md docs/roteiro-video.md README.md`
Expected: os três caminhos listados.

- [ ] **Step 5: Commit**

```bash
git add docs/parte-teorica.md docs/roteiro-video.md README.md
git commit -m "docs: parte teorica, roteiro do video e README"
```

---

## Verificação final (após todas as tasks)
- [ ] `npm run dev` sobe sem erro.
- [ ] Os 6 cenários de `curl` da Task 8 retornam os status esperados (200/400/404).
- [ ] `database/unifecaf_flix.sql` importa do zero e cria 200 filmes.
- [ ] Coleção Postman importa e executa os 3 endpoints.
- [ ] Entregáveis presentes: código MVC, `.sql`, `docs/parte-teorica.md`, `docs/roteiro-video.md`, coleção Postman.
- [ ] Nada fora do escopo do CLAUDE.md (sem JWT, sem TypeScript, sem POST/PUT/DELETE).
