# Guia de Publicação Online — i7 Inteligência Imobiliária

Siga este passo a passo para colocar a API NestJS, o Site Web e o Aplicativo Mobile da **i7** online na nuvem.

---

## 1. Banco de Dados PostgreSQL na Nuvem (Supabase / Neon) — 100% Gratuito

1. Acesse [Supabase.com](https://supabase.com) ou [Neon.tech](https://neon.tech) e crie um novo projeto chamado `i7-production`.
2. Copie a string de conexão PostgreSQL fornecida (ex: `postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`).
3. Atualize o arquivo `apps/api/.env` com a sua URL de produção:
   ```env
   DATABASE_URL="sua_string_de_conexao_aqui"
   ```
4. Execute os comandos para criar a estrutura e os imóveis/usuários de teste no banco online:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## 2. Deploy do Backend NestJS (Render / Railway)

1. Faça upload/push do código para o **GitHub**.
2. Acesse [Railway.app](https://railway.app) ou [Render.com](https://render.com).
3. Selecione **New Web Service** -> Conecte o repositório do GitHub.
4. Defina o diretório raiz como `apps/api`.
5. Insira as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão do Supabase/Neon.
   - `PORT`: `4000` (ou atribuída pela plataforma).
   - `JWT_SECRET`: `sua_chave_jwt_super_segura_2026`.
6. O deploy será realizado e você receberá a URL da API (ex: `https://api-i7.up.railway.app`).

---

## 3. Deploy do Site Web (Vercel)

1. Acesse [Vercel.com](https://vercel.com) -> **Add New Project**.
2. Importe o repositório do GitHub.
3. Defina o **Root Directory** como `apps/web`.
4. Adicione a variável de ambiente:
   - `NEXT_PUBLIC_API_URL`: `https://sua-api.up.railway.app/api`
5. Clique em **Deploy**. O site estará no ar com SSL gratuito (ex: `https://i7-web.vercel.app`).

---

## 4. Gerar o Aplicativo Celular Android (`.apk`) para Instalação Direta

Para gerar o arquivo `.apk` e instalar o app i7 direto no seu celular Android:

1. Abra o terminal na pasta do app mobile:
   ```bash
   cd apps/mobile
   ```
2. Instale a CLI do Expo EAS (se ainda não tiver):
   ```bash
   npm install -g eas-cli
   ```
3. Faça login na sua conta Expo (gratuita):
   ```bash
   npx eas login
   ```
4. Execute a compilação do arquivo instalável `.apk`:
   ```bash
   npx eas build --platform android --profile preview
   ```
5. Ao concluir, o Expo fornecerá um **QR Code** e um link de download direto do arquivo `.apk` para você instalar no seu smartphone!
