# API de Filmes UniFECAF Flix

API REST do acervo de filmes da plataforma fictícia "UniFECAF Flix".
**Stack:** Node.js + Express + Prisma ORM + MySQL, padrão **MVC**.

## Pré-requisitos
- Node.js 18+
- MySQL 8 rodando localmente (ou via Docker — ver abaixo)

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o ambiente: copie `.env.example` para `.env` e ajuste a senha do MySQL na `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```

3. Crie e popule o banco importando o script SQL (use o charset utf8mb4 para preservar os acentos):
   ```bash
   mysql -u root -p --default-character-set=utf8mb4 < database/unifecaf_flix.sql
   ```

4. Gere o Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Suba a API:
   ```bash
   npm run dev   # com reload automático (nodemon)
   # ou
   npm start
   ```
   A API sobe em `http://localhost:3000`.

### Alternativa: MySQL via Docker
```bash
docker run --name unifecaf-mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=unifecaf_flix -p 3306:3306 -d mysql:8
docker exec -i unifecaf-mysql mysql -uroot -proot --default-character-set=utf8mb4 < database/unifecaf_flix.sql
```
Use `DATABASE_URL="mysql://root:root@localhost:3306/unifecaf_flix"` no `.env`.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/controle-filmes/filme` | Lista todos os filmes |
| GET | `/v1/controle-filmes/filme/:id` | Busca um filme pelo ID |
| GET | `/v1/controle-filmes/filtro/filme?nome=xxx` | Filtra por nome ou sinopse |

Status: `200` sucesso, `400` entrada inválida, `404` não encontrado, `500` erro interno.

## Testes
Importe `postman/unifecaf-flix.postman_collection.json` no Postman para testar os 3 endpoints.

## Estrutura do projeto
Documentada em [`docs/parte-teorica.md`](docs/parte-teorica.md).

## Regenerar o script SQL
O `database/unifecaf_flix.sql` é gerado a partir do CSV do IMDB com:
```bash
node scripts/gerar-sql.js
```
