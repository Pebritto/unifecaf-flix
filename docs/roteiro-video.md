# Roteiro — Vídeo Pitch (até 4 min)

> Falas sugeridas (em *itálico*) + o que mostrar na tela. Adapte para o seu jeito de falar; não precisa decorar.

---

## 0:00–0:30 — Abertura

**Mostrar:** seu rosto ou a tela inicial do projeto (README aberto).

**Fala sugerida:**
> *"Olá, meu nome é Pedro. Neste vídeo vou apresentar a API de Filmes da UniFECAF Flix, que desenvolvi na disciplina de Web Programming for Back End. O objetivo era criar, do zero, uma API REST em Node.js para fornecer o acervo de filmes da plataforma, que fica armazenado num banco de dados MySQL. Vou explicar a arquitetura, mostrar a API funcionando no Postman e comentar os principais aprendizados."*

---

## 0:30–1:30 — Arquitetura e tecnologias

**Mostrar:** a estrutura de pastas no editor (`src/models`, `src/controllers`, `src/routes`, `src/app.js`, `src/server.js`).

**Fala sugerida:**
> *"Para organizar o código, usei o padrão MVC, que separa as responsabilidades em três camadas. O **Model**, no arquivo filmeModel.js, é o único que acessa o banco de dados — ele usa o Prisma, que é um ORM, para fazer as consultas na tabela de filmes. O **Controller** recebe a requisição, valida os dados de entrada e devolve a resposta em JSON com o status HTTP correto. E as **Rotas** ligam cada URL ao método certo do Controller. Numa API REST, a 'View' do MVC é a própria resposta em JSON."*

> *"Escolhi o **Node.js com Express** porque é um framework leve e muito usado para criar APIs. Para o banco, usei **MySQL**, que é relacional, junto com o **Prisma**, que transforma as tabelas em objetos JavaScript, evita SQL injection e deixa as consultas mais simples e seguras. Também versionei a API com o prefixo `/v1`, que é uma boa prática REST para poder evoluir sem quebrar quem já usa."*

**Dica:** se quiser, abra rapidamente o `filmeController.js` e aponte para um `res.status(200)` e um `res.status(404)` enquanto fala dos status HTTP.

---

## 1:30–3:00 — Demonstração no Postman

**Mostrar:** o Postman com a coleção importada e a API rodando. Clicar **Send** em cada requisição e apontar o **status code** no canto direito.

**Fala sugerida, requisição por requisição:**

1. **Listar todos** — `GET /v1/controle-filmes/filme`
   > *"Esse primeiro endpoint lista todos os filmes. Veja que ele retorna status 200 e um total de 200 filmes, com nome, sinopse, ano, diretor, gênero e nota do IMDB."*

2. **Buscar por ID** — `GET /v1/controle-filmes/filme/1`
   > *"Aqui eu busco um filme específico pelo ID. Passando o ID 1, ele retorna o filme Inception, com status 200."*

3. **ID inexistente** — `GET /v1/controle-filmes/filme/9999999`
   > *"Se eu peço um ID que não existe, a API responde corretamente com status 404, Not Found, e uma mensagem dizendo que o filme não foi encontrado."*

4. **ID inválido** — `GET /v1/controle-filmes/filme/abc`
   > *"E se eu mando algo que não é um número, ela valida a entrada e retorna 400, Bad Request, com a mensagem 'ID inválido'."*

5. **Filtrar por nome** — `GET /v1/controle-filmes/filtro/filme?nome=star`
   > *"O terceiro endpoint é o filtro. Passando 'star' no parâmetro nome, ele me devolve todos os filmes que têm esse termo no título — como a saga Star Wars — com status 200."*

6. **Filtro pela sinopse** — `GET /v1/controle-filmes/filtro/filme?nome=Nolan`
   > *"E uma coisa legal: o filtro também procura na sinopse. Se eu busco por 'Nolan', que é um diretor e não aparece em nenhum título, ele ainda encontra os filmes, porque o nome do diretor está na sinopse."*

7. **Filtro sem parâmetro** *(opcional)* — `GET /v1/controle-filmes/filtro/filme`
   > *"E se eu esqueço de passar o parâmetro nome, a API retorna 400, avisando que ele é obrigatório."*

---

## 3:00–4:00 — Aprendizados e desafios

**Mostrar:** seu rosto ou o `database/unifecaf_flix.sql` aberto.

**Fala sugerida:**
> *"Sobre os aprendizados: o maior desafio foi os dados. Eu parti de um dataset real do IMDB, mas ele não tinha uma coluna de sinopse — então criei a sinopse a partir do gênero, ano, diretor e elenco de cada filme, e por isso o filtro por sinopse funciona de verdade."*

> *"Outro ponto foi cuidar do encoding com UTF-8 na hora de importar o banco, pra não perder os acentos. E, no geral, o que mais consolidei foi a importância de separar bem as responsabilidades no MVC e de retornar os status HTTP corretos — isso deixa a API muito mais fácil de entender e de manter. Era isso, obrigado!"*

---

## ✅ Checklist antes de enviar
- [ ] Subir o vídeo no YouTube (privado ou **não listado**).
- [ ] Conferir se o **link abre** (testar numa aba anônima).
- [ ] Confirmar que a API e o banco estão rodando **antes** de gravar a demo.
- [ ] Enviar o link do vídeo junto com o `.zip` da entrega.
