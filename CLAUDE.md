# CLAUDE.md — API de Filmes UniFECAF Flix

Trabalho da disciplina **Web Programming For Back End** (Unidades 1–4). Objetivo: uma API REST do acervo de filmes, **simples, funcional e bem organizada**. Faça o básico — nada além do que as Unidades 1–4 ensinam.

Design completo: [docs/superpowers/specs/2026-05-27-unifecaf-flix-api-design.md](docs/superpowers/specs/2026-05-27-unifecaf-flix-api-design.md).

## Stack obrigatório (não trocar)
- **Node.js** + **Express**
- **Prisma ORM** + **MySQL**
- Estilo **CommonJS** (`require`/`module.exports`) — é o que as unidades usam. Não usar `import`/ESM.
- Bibliotecas permitidas: `express`, `@prisma/client`, `prisma`, `cors`, `dotenv`, `nodemon`. **Nada além disso.**

## Arquitetura: MVC
- `src/models/filmeModel.js` — único acesso a dados (Prisma Client). Não conhece `req`/`res`.
- `src/controllers/filmeController.js` — valida entrada, chama o Model, define status HTTP + JSON.
- `src/routes/filmeRoutes.js` — mapeia URLs → Controller.
- `src/app.js` — Express + `cors()` + `express.json()` + rotas. `src/server.js` — `app.listen()`.
- "View" numa API REST = resposta JSON. Sem templates.

## Os 3 endpoints (e SÓ estes)
| Método | Rota |
|---|---|
| GET | `/v1/controle-filmes/filme` |
| GET | `/v1/controle-filmes/filme/:id` |
| GET | `/v1/controle-filmes/filtro/filme?nome=xxx` (filtra por nome OU sinopse) |

Status HTTP: 200 (ok), 400 (entrada inválida), 404 (não achou), 500 (erro). Resposta de erro: `{ "status": false, "message": "..." }`.

## Dados
- Fonte: `world_imdb_movies_top_movies_per_year.csv`.
- Tabela `filme`: `id, nome, sinopse, ano, duracao, diretor, genero, elenco, nota_imdb`.
- **Sinopse é sintetizada** a partir do CSV (gênero + ano + diretor + elenco) — o CSV não tem sinopse.
- Curar ~200 filmes (top por nº de votos). Gerar `database/unifecaf_flix.sql` (CREATE + INSERTs) via `scripts/gerar-sql.js`.

## NÃO FAZER (fora de escopo)
- Sem autenticação/JWT, sem TypeScript, sem POST/PUT/DELETE.
- Sem paginação, cache, testes automatizados, Docker.
- Não inventar endpoints, campos ou libs extras. Não "melhorar" além do pedido.
- Não fugir de CommonJS nem do padrão MVC.

## Entregáveis
1. API + `database/unifecaf_flix.sql`
2. `docs/parte-teorica.md` (arquitetura, justificativas, endpoints, estrutura de pastas)
3. `postman/unifecaf-flix.postman_collection.json`
4. `docs/roteiro-video.md` (roteiro de até 4 min; gravação é do aluno)

## Comandos
- `npm install`
- `npm run dev` (nodemon) · `npm start`
- `npx prisma generate` · `npx prisma migrate dev`
