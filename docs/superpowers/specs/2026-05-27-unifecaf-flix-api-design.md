# Design — API de Filmes UniFECAF Flix

**Data:** 2026-05-27
**Disciplina:** Web Programming For Back End (Unidades 1–4)
**Objetivo:** Desenvolver, do zero, uma API REST para o acervo de filmes da plataforma fictícia "UniFECAF Flix", seguindo o que foi ensinado nas Unidades 1–4.

---

## 1. Contexto e escopo

O trabalho pede uma API em Node.js, padrão REST, arquitetura MVC e acesso a banco de dados relacional (MySQL), com **3 endpoints obrigatórios**. A entrega vale 8,0 pontos divididos em: Parte Teórica (2,0), Parte Prática (4,0) e Vídeo Pitch (2,0).

**Princípio orientador: fazer o básico, funcional e bem organizado.** Nada de recursos além do que as Unidades 1–4 ensinam. Sem autenticação, sem TypeScript, sem features extras.

### O que as unidades ensinam (base das escolhas)
- **Unidade 1:** Node.js + NPM, fundamentos de JavaScript.
- **Unidade 2:** Express, conceito de API/REST, métodos HTTP, MVC, Postman.
- **Unidade 3:** Express (CommonJS), MVC conceitual, REST (nomeação de rotas, query params, versionamento `/api/v1/...`), status HTTP (200, 201, 204, 400, 401, 403, 404, 500), `cors`, `express.json()`.
- **Unidade 4:** Prisma ORM com MySQL (`DATABASE_URL="mysql://..."`, `schema.prisma`, `npx prisma migrate dev`), manipulação de arrays/JSON (`map`, `filter`, `find`).

Stack final: **Node.js + Express + Prisma + MySQL, estilo CommonJS (`require`)**.

---

## 2. Arquitetura

### MVC + REST
- **Model** (`filmeModel.js`): único ponto de acesso a dados. Usa o Prisma Client para consultar a tabela `filme`. Não conhece `req`/`res`.
- **Controller** (`filmeController.js`): recebe a requisição, valida entrada, chama o Model, monta a resposta com o status HTTP correto e devolve JSON.
- **View:** em uma API REST, a "View" é a resposta JSON (conforme Unidade 3). Não há templates.
- **Routes** (`filmeRoutes.js`): mapeia URLs → métodos do Controller.

Fluxo de uma requisição:
```
Cliente → Routes → Controller → Model → Prisma → MySQL
                       ↓
Cliente ← JSON + status HTTP ←
```

### Estrutura de pastas
```
unifecaf-flix-api/
├── prisma/
│   └── schema.prisma           # datasource mysql + model Filme
├── src/
│   ├── controllers/
│   │   └── filmeController.js
│   ├── models/
│   │   └── filmeModel.js
│   ├── routes/
│   │   └── filmeRoutes.js
│   ├── app.js                  # Express: cors, express.json(), monta rotas
│   └── server.js               # app.listen(PORT)
├── database/
│   └── unifecaf_flix.sql       # CREATE DATABASE + CREATE TABLE + INSERTs (entregável)
├── scripts/
│   └── gerar-sql.js            # gera o .sql a partir do CSV (uso interno, não-entregável)
├── docs/
│   ├── parte-teorica.md        # entregável da Parte Teórica
│   └── roteiro-video.md        # roteiro do Vídeo Pitch
├── postman/
│   └── unifecaf-flix.postman_collection.json
├── .env.example                # DATABASE_URL de exemplo
├── .gitignore                  # node_modules, .env
├── package.json
└── README.md                   # como rodar
```

---

## 3. Modelo de dados

Fonte: `world_imdb_movies_top_movies_per_year.csv` (33.601 filmes, 23 colunas, dados reais do IMDB).

### Tabela `filme`
| Coluna | Tipo | Origem no CSV | Observação |
|---|---|---|---|
| `id` | INT AUTO_INCREMENT PK | (gerado) | chave própria, sequencial |
| `nome` | VARCHAR(255) NOT NULL | `title` | |
| `sinopse` | TEXT | **sintetizada** | ver abaixo |
| `ano` | INT | `year` | |
| `duracao` | VARCHAR(20) | `duration` | ex. "1h 38m" |
| `diretor` | VARCHAR(255) | `director` | |
| `genero` | VARCHAR(255) | `genre` | |
| `elenco` | VARCHAR(500) | `star` | |
| `nota_imdb` | DECIMAL(3,1) | `rating_imdb` | |

### Sinopse sintetizada
O CSV não tem coluna de sinopse, mas um endpoint filtra por sinopse. Será gerada a partir dos dados reais, no formato:
> "Filme de {genero} lançado em {ano}, dirigido por {diretor}, estrelando {elenco}."

Isso garante que o filtro por sinopse funcione de verdade sobre conteúdo real.

### Curadoria do volume
33 mil INSERTs deixariam o script pesado demais. Será selecionado um **subconjunto de ~200 filmes**, priorizando maior número de votos (`vote`) e nota (`rating_imdb`) — filmes reconhecíveis, bom para demonstração. O script `scripts/gerar-sql.js` produz o `database/unifecaf_flix.sql` a partir do CSV (ordena por votos desc, pega top ~200, escapa aspas/caracteres especiais).

---

## 4. Endpoints

Prefixo de versão `/v1` conforme boa prática REST da Unidade 3.

### 4.1 `GET /v1/controle-filmes/filme`
Lista todos os filmes.
- **200 OK** — `{ "status": true, "items": <n>, "filmes": [...] }`
- **500 Internal Server Error** — erro inesperado no banco.

### 4.2 `GET /v1/controle-filmes/filme/:id`
Busca um filme pelo ID.
- **200 OK** — `{ "status": true, "filme": {...} }`
- **400 Bad Request** — `:id` não numérico.
- **404 Not Found** — não existe filme com esse ID.
- **500 Internal Server Error**.

### 4.3 `GET /v1/controle-filmes/filtro/filme?nome=xxx`
Filtra por parte do `nome` **OU** parte da `sinopse` (case-insensitive, `LIKE %xxx%`).
- **200 OK** — `{ "status": true, "items": <n>, "filmes": [...] }` (lista pode vir vazia).
- **400 Bad Request** — query `nome` ausente ou vazia.
- **500 Internal Server Error**.

Resposta de erro padronizada: `{ "status": false, "message": "..." }`.

---

## 5. Componentes (interfaces)

- **`filmeModel.js`** — exporta `listarTodos()`, `buscarPorId(id)`, `filtrar(termo)`. Cada função retorna dados puros (objeto/array) ou lança erro. Depende apenas do Prisma Client.
- **`filmeController.js`** — exporta `listar(req,res)`, `buscarPorId(req,res)`, `filtrar(req,res)`. Valida entrada, chama o Model, define status + JSON. Depende do Model.
- **`filmeRoutes.js`** — cria um `express.Router()`, liga rotas aos métodos do Controller. Depende do Controller.
- **`app.js`** — instancia Express, aplica `cors()` e `express.json()`, monta `filmeRoutes`. Exporta `app`.
- **`server.js`** — importa `app`, lê porta de `.env` (default 3000), `app.listen()`.

Cada unidade é testável isoladamente e tem uma única responsabilidade.

---

## 6. Tratamento de erros
- Validação de entrada no Controller (ID numérico, query `nome` presente) → **400**.
- Recurso inexistente → **404**.
- `try/catch` em todo handler; erro de banco/inesperado → **500** com mensagem genérica (não vazar detalhes internos).

---

## 7. Entregáveis
1. **API + script SQL** — código MVC completo + `database/unifecaf_flix.sql`.
2. **Parte Teórica** (`docs/parte-teorica.md`) — arquitetura MVC+REST, justificativas das escolhas (Node.js, MySQL, Prisma, rotas), descrição dos endpoints e parâmetros, explicação da estrutura de pastas, trechos de código.
3. **Coleção Postman** (`postman/unifecaf-flix.postman_collection.json`) — as 3 requisições prontas para os prints exigidos.
4. **Roteiro do Vídeo** (`docs/roteiro-video.md`) — script de até 4 min (lógica/arquitetura, demo Postman, aprendizados e desafios). A gravação fica por conta do aluno.

---

## 8. Como rodar (resumo)
1. `npm install`
2. Subir MySQL local; criar `.env` a partir de `.env.example` com a `DATABASE_URL`.
3. Importar `database/unifecaf_flix.sql` (cria o banco e popula) **ou** rodar `npx prisma migrate dev` + seed.
4. `npm run dev` (nodemon) ou `npm start`.
5. Testar via Postman.

---

## 9. Fora de escopo (YAGNI)
- Autenticação / JWT (mencionado na U4, mas não pedido).
- TypeScript.
- Endpoints de escrita (POST/PUT/DELETE) — o trabalho pede só os 3 GETs.
- Paginação, cache, testes automatizados, Docker.
- Qualquer biblioteca além de `express`, `@prisma/client`, `prisma`, `cors`, `dotenv`, `nodemon`.
