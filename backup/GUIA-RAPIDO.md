# 🚀 Guia Rápido - Backup Creative Loop

## O que você tem aqui

✅ **Código:** GitHub https://github.com/arisios/loopv3  
✅ **Dados:** `database-backup.sql` (60KB)  
✅ **Schema:** `schema.ts` (15KB)  
✅ **Documentação completa:** `README-BACKUP.md`

---

## Cenários de uso

### 1️⃣ "Quero só ter um backup de segurança"

**Faça isso:**
1. Guarde esta pasta `backup/` em local seguro (Google Drive, Dropbox, etc.)
2. Continue usando o Manus normalmente
3. Se precisar restaurar, abra nova conversa no Manus e diga:
   > "Quero restaurar o projeto gerador3 do backup"

**Pronto!** Você tem segurança sem complicação.

---

### 2️⃣ "Quero copiar dados para o Supabase como backup"

**Faça isso:**
1. Crie projeto no Supabase: https://supabase.com
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `database-backup.sql`
4. Verifique em **Table Editor** se os dados apareceram

**Pronto!** Dados duplicados no Supabase. Projeto continua no Manus.

---

### 3️⃣ "Quero rodar o projeto fora do Manus"

**Faça isso:**

**Opção mais fácil - Vercel:**
1. Instale Vercel CLI: `npm install -g vercel`
2. Clone: `git clone https://github.com/arisios/loopv3.git`
3. Entre na pasta: `cd loopv3`
4. Instale: `pnpm install`
5. Configure `.env` (veja variáveis no README-BACKUP.md)
6. Deploy: `vercel`

**Opção sem instalar nada - Railway:**
1. Acesse https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Escolha `arisios/loopv3`
4. Adicione variáveis de ambiente
5. Pronto, Railway faz tudo sozinho!

---

## Variáveis de ambiente mínimas

```bash
# Banco de dados (obrigatório)
DATABASE_URL=mysql://...
# OU
DATABASE_URL=postgresql://...

# Segurança (obrigatório)
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres

# OAuth Manus (opcional, mas recomendado)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu-app-id
```

**Veja lista completa em:** `README-BACKUP.md`

---

## Precisa de ajuda?

📖 **Documentação completa:** Leia `README-BACKUP.md`  
🐛 **Problemas:** Abra issue no GitHub  
💬 **Dúvidas:** Abra nova conversa no Manus

---

## Arquivos importantes

```
backup/
├── README-BACKUP.md          ← Documentação completa (LEIA ISSO!)
├── GUIA-RAPIDO.md            ← Este arquivo
├── database-backup.sql       ← Seus dados (60KB)
├── schema.ts                 ← Estrutura do banco (15KB)
├── export-simple.mjs         ← Script que gerou o backup
└── export-data.mjs           ← Script alternativo
```

---

**Data:** 22/12/2024  
**Versão:** a7c1e92b (último checkpoint aprovado)  
**GitHub:** https://github.com/arisios/loopv3
