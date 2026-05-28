# Roteiro — Vídeo Pitch (até 4 min)

**0:00–0:30 — Abertura**
- Apresentação e objetivo: API REST do acervo de filmes "UniFECAF Flix" em Node.js.
- "Os filmes ficam num banco MySQL e a API expõe esses dados de forma padronizada."

**0:30–1:30 — Arquitetura**
- Explicar o padrão MVC: `routes → controller → model → Prisma → MySQL`.
  - Model: acesso a dados (Prisma).
  - Controller: validação + status HTTP + JSON.
  - Routes: ligam URL ao controller.
- Por que REST (recursos por URL, verbos HTTP, status codes) e por que Prisma + MySQL.
- Mostrar a estrutura de pastas no editor (`src/models`, `src/controllers`, `src/routes`).

**1:30–3:00 — Demonstração no Postman**
- `GET /v1/controle-filmes/filme` → lista todos (200).
- `GET /v1/controle-filmes/filme/1` → um filme (200); `GET .../filme/999999` → 404.
- `GET /v1/controle-filmes/filtro/filme?nome=star` → filtra (200); sem `nome` → 400.
- Em cada chamada, destacar o JSON retornado e o status code.

**3:00–4:00 — Aprendizados e desafios**
- Sintetizar a sinopse a partir do CSV do IMDB (o dataset não tinha coluna de sinopse).
- Cuidado com o encoding (utf8mb4) ao importar o SQL.
- Separar responsabilidades no MVC e retornar os status HTTP corretos.
- Encerramento e agradecimento.

> **Checklist antes de enviar:**
> - Subir o vídeo no YouTube (privado ou não listado).
> - Conferir se o link está acessível.
> - Confirmar que os 3 endpoints estão funcionando na hora da gravação.
