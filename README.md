# i7 — Inteligência Imobiliária (Proptech)

Plataforma imobiliária digital de alta tecnologia desenvolvida com modelo de negócios **proptech** (paridade funcional com o QuintoAndar).

---

## 🎨 Identidade Visual i7
- **Fundo**: Dark Graphite (`#0F1115`)
- **Destaque Primário (CTA)**: Lime Green (`#B4FF39`)
- **Destaque Secundário**: Azul Elétrico (`#2F6BFF`)
- **Superfícies Card**: `#161922` e `#1E2230`

---

## 🛠️ Estrutura do Monorepo

```text
i7-proptech/
├── apps/
│   ├── api/       # NestJS + Prisma ORM + REST + Swagger Docs
│   ├── web/       # Next.js 14 App Router (Filtros, Mapa Interativo, Detalhes, Chat, Propostas)
│   ├── mobile/    # Expo React Native (iOS & Android)
│   └── admin/     # Painel de Moderação e Finanças
├── packages/
│   ├── types/     # Modelos TypeScript e DTOs compartilhados
│   └── config/    # TSConfig base
└── docker-compose.yml # PostgreSQL, Redis, Meilisearch e MinIO
```

---

## 🚀 Como Executar o Projeto

### 1. Requisitos
- Node.js >= 18
- Docker & Docker Compose (opcional para PostgreSQL/MinIO)

### 2. Passos de Inicialização

1. **Instale as dependências do monorepo**:
```bash
npm install
```

2. **Suba o banco de dados e serviços (Docker)**:
```bash
docker-compose up -d
```

3. **Gere o Prisma Client e semeie o banco de dados**:
```bash
npm run db:push
npm run db:seed
```

4. **Inicie o ecossistema completo em desenvolvimento**:
```bash
npm run dev
```

---

## 🌐 URLs de Acesso

- **Aplicação Web**: `http://localhost:3000`
- **Painel Administrativo**: `http://localhost:3001`
- **API NestJS (Swagger Docs)**: `http://localhost:4000/api/docs`
- **MinIO Console**: `http://localhost:9001`
