# 📦 Backup Completo - Creative Loop (Gerador 3)

**Data do backup:** 22 de dezembro de 2024  
**Repositório GitHub:** https://github.com/arisios/loopv3  
**Projeto Manus:** gerador3

---

## 📋 O que está incluído neste backup

### 1. Código-fonte
✅ **Localização:** GitHub - https://github.com/arisios/loopv3  
✅ **Branch:** main  
✅ **Último commit:** Hub reorganizado com 5 fontes + correção procedures produtos

### 2. Banco de dados
✅ **Arquivo:** `database-backup.sql` (60KB)  
✅ **Schema:** `schema.ts` (15KB)  
✅ **Conteúdo:** Todos os dados de usuários, projetos, influenciadores, conteúdos, produtos, trends e virais

### 3. Documentação
✅ Este arquivo (README-BACKUP.md)  
✅ Guia de migração para Supabase  
✅ Lista de variáveis de ambiente  
✅ Instruções de deploy

---

## 🎯 Opções de uso deste backup

### Opção A: Continuar no Manus (Recomendado)
Não precisa fazer nada! Seu projeto continua funcionando no Manus com todos os dados salvos.

### Opção B: Backup de segurança no Supabase
Copie os dados para o Supabase como backup, mas continue usando o Manus normalmente.

### Opção C: Migrar completamente para outro serviço
Use este backup para rodar o projeto em Vercel, Railway, Render ou seu próprio servidor.

---

## 🔧 Como fazer backup no Supabase

### Passo 1: Criar projeto no Supabase

1. Acesse https://supabase.com
2. Faça login (você já tem conta)
3. Clique em "New Project"
4. Escolha um nome: `creative-loop-backup`
5. Escolha uma senha forte para o banco
6. Escolha região: South America (São Paulo) - mais próximo do Brasil
7. Aguarde 2-3 minutos para o projeto ser criado

### Passo 2: Obter credenciais

1. No painel do Supabase, vá em **Settings** → **Database**
2. Role até **Connection string**
3. Copie a **URI** (formato: `postgresql://...`)
4. Substitua `[YOUR-PASSWORD]` pela senha que você escolheu no Passo 1

### Passo 3: Criar tabelas

1. No Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `schema.ts` (adaptado para PostgreSQL)
4. Execute o SQL

**OU use o schema MySQL direto:**

```sql
-- Copie as definições CREATE TABLE do arquivo database-backup.sql
-- (As primeiras linhas antes dos INSERTs)
```

### Passo 4: Importar dados

1. Ainda no **SQL Editor**
2. Copie e cole o conteúdo de `database-backup.sql`
3. Execute o SQL
4. ✅ Pronto! Dados copiados para o Supabase

### Passo 5: Verificar

1. Vá em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - users
   - projects
   - influencers
   - influencerContents
   - influencerProducts
   - trends
   - virals
3. Clique em cada tabela e veja se os dados estão lá

---

## 🚀 Como rodar o projeto fora do Manus

### Opção 1: Vercel (Recomendado para este projeto)

1. **Instale Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Clone o repositório:**
   ```bash
   git clone https://github.com/arisios/loopv3.git
   cd loopv3
   ```

3. **Instale dependências:**
   ```bash
   pnpm install
   ```

4. **Configure variáveis de ambiente:**
   Crie arquivo `.env` com as variáveis listadas abaixo

5. **Deploy:**
   ```bash
   vercel
   ```

### Opção 2: Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione `arisios/loopv3`
5. Adicione as variáveis de ambiente (veja lista abaixo)
6. Railway detecta automaticamente e faz deploy

### Opção 3: Render

1. Acesse https://render.com
2. Clique em "New +" → "Web Service"
3. Conecte ao GitHub e escolha `arisios/loopv3`
4. Configure:
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
5. Adicione variáveis de ambiente
6. Clique em "Create Web Service"

---

## 🔐 Variáveis de Ambiente Necessárias

### Essenciais (obrigatórias)

```bash
# Banco de dados
DATABASE_URL=mysql://usuario:senha@host:3306/database
# OU para Supabase/PostgreSQL:
DATABASE_URL=postgresql://usuario:senha@host:5432/database

# Autenticação JWT
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres

# OAuth Manus (se quiser manter login com Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu-app-id-aqui
```

### Opcionais (mas recomendadas)

```bash
# LLM para geração de conteúdo
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-aqui
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend-aqui

# Armazenamento S3 (para upload de imagens)
# Configure seu próprio bucket S3 ou use alternativa

# Stripe (para pagamentos, se usar)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Informações do proprietário

```bash
OWNER_OPEN_ID=seu-id-aqui
OWNER_NAME=Seu Nome
```

### Customização da aplicação

```bash
VITE_APP_TITLE=Creative Loop
VITE_APP_LOGO=/logo.png
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas principais

1. **users** - Usuários do sistema
2. **projects** - Projetos criados pelos usuários
3. **influencers** - Influenciadores virtuais criados
4. **influencerContents** - Conteúdos gerados para influenciadores
5. **influencerProducts** - Produtos associados aos influenciadores
6. **trends** - Trends coletadas para geração de conteúdo
7. **virals** - Conteúdos virais coletados

### Relacionamentos

- `projects` → pertence a `users`
- `influencers` → pertence a `users`
- `influencerContents` → pertence a `influencers`
- `influencerProducts` → pertence a `influencers`

---

## ⚠️ Notas Importantes

### Sobre o banco de dados

- O backup atual usa **MySQL/TiDB**
- Se migrar para **Supabase (PostgreSQL)**, algumas adaptações podem ser necessárias:
  - Tipos de dados (ex: `TINYINT` → `SMALLINT`)
  - Sintaxe de datas
  - Funções específicas

### Sobre APIs externas

- O projeto usa APIs do Manus para:
  - Autenticação (OAuth)
  - Geração de conteúdo (LLM)
  - Armazenamento de imagens (S3)
  
- Se rodar fora do Manus, você precisará:
  - Configurar seu próprio provedor de LLM (OpenAI, Anthropic, etc.)
  - Configurar seu próprio S3 ou alternativa (Cloudinary, UploadThing, etc.)
  - Implementar autenticação alternativa (Auth0, Clerk, etc.) ou manter OAuth Manus

### Sobre custos

- **Manus:** Tudo incluído, sem configuração
- **Supabase:** Gratuito até 500MB de banco + 2GB de storage
- **Vercel:** Gratuito para projetos pessoais
- **Railway:** $5/mês após trial gratuito
- **Render:** Gratuito com limitações, $7/mês para produção

---

## 🆘 Suporte

Se precisar de ajuda:

1. **Documentação Manus:** https://docs.manus.im
2. **Documentação Supabase:** https://supabase.com/docs
3. **GitHub Issues:** https://github.com/arisios/loopv3/issues

---

## ✅ Checklist de Migração

Use esta lista para garantir que não esqueceu nada:

### Preparação
- [ ] Backup do código no GitHub ✅ (já feito)
- [ ] Backup dos dados em SQL ✅ (já feito)
- [ ] Documentação criada ✅ (já feito)

### Supabase (se for usar)
- [ ] Criar projeto no Supabase
- [ ] Copiar credenciais (DATABASE_URL)
- [ ] Criar tabelas (executar schema)
- [ ] Importar dados (executar INSERTs)
- [ ] Verificar dados importados

### Deploy (se for migrar)
- [ ] Escolher plataforma (Vercel/Railway/Render)
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Fazer primeiro deploy
- [ ] Testar aplicação funcionando
- [ ] Configurar domínio customizado (opcional)

### Configurações adicionais
- [ ] Configurar provedor de LLM (se não usar Manus)
- [ ] Configurar storage de imagens (se não usar Manus)
- [ ] Configurar autenticação (se não usar Manus OAuth)
- [ ] Testar todas as funcionalidades

---

**Última atualização:** 22/12/2024  
**Versão do backup:** a7c1e92b (último checkpoint aprovado)
