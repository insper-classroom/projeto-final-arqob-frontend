# Blackboard — Frontend

Interface web do Blackboard, versão simplificada de um LMS desenvolvida como projeto final da disciplina de *Arquitetura de Objetos e Times Ágeis*. Consome a API do repositório [arqo-pro-final](https://github.com/miqueias-ayron/arqo-pro-final).

Feito com React, Vite, TypeScript, Mantine, TanStack Query e React Router.

## Como executar

Pré-requisitos: Node.js 20 ou superior e a API rodando (por padrão em `http://localhost:8081`).

```powershell
npm install
Copy-Item .env.example .env   # ajuste VITE_API_URL se a API estiver em outro endereço
npm run dev
```

O front abre em `http://localhost:5173`. Essa é a origem liberada por padrão no CORS da API; se usar outra porta, inclua a origem em `CORS_ALLOWED_ORIGINS` no `.env` da API.

## Deploy na Vercel

O repositório já está pronto para a Vercel: o `vercel.json` define o build do Vite e redireciona todas as rotas para o `index.html`, para que recarregar páginas como `/turmas/3` não dê 404.

1. Importe o repositório na Vercel. Framework, comando de build (`npm run build`) e pasta de saída (`dist`) vêm do `vercel.json`.
2. O endereço da API de produção está em `.env.production` (`https://blackboard-api-latest.onrender.com`). Para apontar para outra API, defina `VITE_API_URL` nas variáveis de ambiente da Vercel, que tem prioridade sobre o arquivo. O valor é lido no build: depois de mudar, faça um novo deploy.
3. Inclua o endereço gerado pela Vercel em `CORS_ALLOWED_ORIGINS` no Render, sem barra no final (ex.: `https://blackboard.vercel.app,http://localhost:5173`).

No plano gratuito do Render a API dorme depois de 15 minutos sem uso; a primeira requisição depois disso pode levar perto de 1 minuto, e a tela de login avisa quando isso acontece.

## Telas

| Perfil | Telas |
|---|---|
| Aluno | Minhas matrículas, boletim de cada matrícula, organizações estudantis e eventos (participar, sair, inscrever-se e cancelar) |
| Professor | Minhas turmas (só as que leciona), avaliações da turma, lançamento de notas e frequência, boletim de cada aluno |
| Master | Tudo do professor em qualquer turma, matrícula de alunos e cadastros de turmas, disciplinas, cursos, professores, alunos, salas, organizações e eventos |

Depois do login, o front busca `GET /me` para saber o perfil e escolher o menu. Quando a API recusa o token (expirado ou usuário desativado), o usuário volta para o login.

## Tipos da API

Os tipos de `src/api/schema.ts` são gerados do OpenAPI da API. Com a API rodando, atualize-os sempre que um DTO mudar:

```powershell
npm run gen:api
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checa os tipos e gera o build em `dist/` |
| `npm run lint` | Roda o oxlint |
| `npm run gen:api` | Regera os tipos a partir de `http://localhost:8081/v3/api-docs` |
