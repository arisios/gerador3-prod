# Mapeamento: Sistema de Projetos → Produtos (Influenciadores)

**Objetivo:** Adaptar a lógica de Projetos (clientes ideais + dores) para Produtos no hub de geração de influenciadores.

---

## 1. BACKEND - Rotas de Projetos (server/routers.ts)

### Rotas Principais Identificadas:

#### 1.1. `projects.list`
- **O que faz:** Lista todos os projetos do usuário
- **Adaptação:** Já existe `influencers.products.listProducts` ✅

#### 1.2. `projects.get`
- **O que faz:** Busca projeto + clientes ideais + dores
- **Código:**
```typescript
const project = await db.getProjectById(input.id);
const idealClients = await db.getIdealClientsByProject(input.id);
const pains = await db.getPainsByProject(input.id);
return { ...project, idealClients, pains };
```
- **Adaptação necessária:** Criar rota similar para produtos

#### 1.3. `projects.analyze`
- **O que faz:** Analisa projeto e gera automaticamente:
  1. Análise do negócio
  2. 5 clientes ideais (via LLM)
  3. Dores para cada cliente (via LLM)
- **Fluxo:**
  1. Chama `prompts.analyzeProjectPrompt()` → análise
  2. Chama `prompts.generateIdealClientsPrompt()` → clientes
  3. Chama `prompts.generatePainsPrompt()` → dores
  4. Salva tudo no banco
- **Adaptação necessária:** Criar `influencers.products.analyzeProduct` similar

#### 1.4. `projects.addIdealClient`
- **O que faz:** Adiciona cliente ideal manualmente
- **Adaptação necessária:** Criar para produtos

#### 1.5. `projects.generatePainsForClient`
- **O que faz:** Gera dores para um cliente específico
- **Adaptação necessária:** Criar para produtos

---

## 2. BANCO DE DADOS - Estrutura Atual

### Tabelas de Projetos:
```
projects (id, userId, name, sourceType, sourceUrl, analysis, ...)
  ↓
idealClients (id, projectId, name, age, occupation, ...)
  ↓
pains (id, projectId, idealClientId, level, pain, description, ...)
```

### Tabelas de Produtos (Influenciadores):
```
influencerProducts (id, influencerId, name, description, ...)
  ↓
❌ NÃO EXISTE: influencerIdealClients
  ↓
❌ NÃO EXISTE: influencerPains
```

**⚠️ ATENÇÃO:** Precisamos verificar se as tabelas `influencerIdealClients` e `influencerPains` existem no schema!

---

## 3. PROMPTS - Funções de Geração

### Prompts de Projetos (server/prompts.ts):
1. `analyzeProjectPrompt()` - Analisa negócio
2. `generateIdealClientsPrompt()` - Gera 5 clientes ideais
3. `generatePainsPrompt()` - Gera dores (primary, secondary, unexplored)

**Adaptação necessária:** Criar versões para produtos:
- `analyzeProductPrompt()` - Analisa produto
- `generateProductIdealClientsPrompt()` - Gera 5 clientes ideais para produto
- `generateProductPainsPrompt()` - Gera dores para cliente do produto

---

## 4. FRONTEND - Fluxo de UI de Projetos

### Páginas/Componentes a Analisar:
- `client/src/pages/ProjectDetail.tsx` - Página de detalhes do projeto
- `client/src/pages/Projects.tsx` - Lista de projetos

**Próximo passo:** Ler esses arquivos para mapear o fluxo de UI.

---

## 5. ADAPTAÇÕES NECESSÁRIAS (Resumo)

### Backend:
1. ✅ Verificar se tabelas `influencerIdealClients` e `influencerPains` existem
2. ⚠️ Criar funções no `db.ts`:
   - `getInfluencerIdealClientsByProduct(productId)`
   - `getInfluencerPainsByProduct(productId)`
   - `createInfluencerIdealClients(productId, clients[])`
   - `createInfluencerPains(productId, pains[])`
3. ⚠️ Criar rotas em `routers.ts`:
   - `influencers.products.analyzeProduct` (gera clientes + dores)
   - `influencers.products.addIdealClient` (manual)
   - `influencers.products.generatePainsForClient`
4. ⚠️ Criar prompts em `prompts.ts`:
   - `analyzeProductPrompt()`
   - `generateProductIdealClientsPrompt()`
   - `generateProductPainsPrompt()`

### Frontend:
1. ⚠️ Criar modal expandido para produto (similar a ProjectDetail)
2. ⚠️ Mostrar clientes ideais + dores
3. ⚠️ Botão "Gerar Clientes Ideais"
4. ⚠️ Botão "+ Adicionar Cliente Ideal" (manual)
5. ⚠️ Botão "Gerar Dores" por cliente

### Integração Grupo B (Trend/Viral/Assunto):
1. ⚠️ Modificar prompt de geração de conteúdo para aceitar:
   - **Modo Direto:** `produto + trend/viral/assunto`
   - **Modo Detalhado:** `produto + cliente + dor + trend/viral/assunto`

---

## 6. PONTOS DE ATENÇÃO

### ⚠️ Verificar Antes de Implementar:
1. **Schema do banco:** Confirmar se `influencerIdealClients` e `influencerPains` existem
2. **Relacionamentos:** ProductId → ClientId → PainId
3. **Prompts:** Adaptar linguagem de "projeto/negócio" para "produto"
4. **UI:** Não quebrar fluxo existente de seleção de produtos

### ⚠️ Possíveis Erros:
1. **Tabelas faltando:** Se não existirem, precisamos criar migration
2. **Relacionamentos errados:** ProductId pode não estar linkado corretamente
3. **Prompts inadequados:** Produto ≠ Projeto, precisa ajustar contexto
4. **UI complexa:** Modal com muitos estados pode confundir

---

## 7. PRÓXIMOS PASSOS (MAPEAMENTO)

1. ✅ Ler schema do banco (`drizzle/schema.ts`) - verificar tabelas
2. ⚠️ Ler `server/db.ts` - funções de clientes e dores de projetos
3. ⚠️ Ler `server/prompts.ts` - prompts de geração
4. ⚠️ Ler `client/src/pages/ProjectDetail.tsx` - fluxo de UI
5. ⚠️ Documentar adaptações detalhadas

---

**Status:** Mapeamento em andamento - Fase 1/5 completa


---

## 2. BANCO DE DADOS - Análise Completa do Schema

### ✅ Tabelas de Projetos (Existentes):

```typescript
// Tabela principal
projects (linhas 17-37)
  - id, userId, name, description, niche
  - sourceType, sourceUrl, sourceDescription
  - analysis (JSON)
  - Kit de Marca (logoUrl, colorPaletteId, etc.)

// Clientes ideais
idealClients (linhas 40-49)
  - id, projectId, name, description
  - demographics (JSON), psychographics (JSON)
  - isSelected (boolean)

// Dores
pains (linhas 52-60)
  - id, projectId, idealClientId
  - level (primary/secondary/unexplored)
  - pain, description
```

### ⚠️ Tabelas de Produtos (Influenciadores):

```typescript
// Tabela principal
influencerProducts (linhas 124-135)
  - id, influencerId, name, description
  - idealClient (text) ← ⚠️ CAMPO ÚNICO, não tabela separada!
  - pains (JSON array) ← ⚠️ ARRAY JSON, não tabela separada!
  - suggestedApproaches (JSON array)
  - selectedApproaches (JSON array)
```

### 🚨 DESCOBERTA CRÍTICA:

**A estrutura de Produtos é DIFERENTE de Projetos!**

**Projetos:**
- 1 projeto → N clientes ideais (tabela `idealClients`)
- 1 projeto → N dores (tabela `pains`)
- Relacionamento: `projectId` → `idealClientId` → `painId`

**Produtos (Atual):**
- 1 produto → 1 cliente ideal (campo `idealClient` text)
- 1 produto → N dores (campo `pains` JSON array)
- **NÃO HÁ** tabelas separadas para clientes e dores!

### 🎯 DECISÃO NECESSÁRIA:

**Opção A: Manter estrutura atual de Produtos**
- ✅ Mais simples
- ✅ Não precisa criar tabelas novas
- ❌ Limitado a 1 cliente ideal por produto
- ❌ Dores não vinculadas a clientes específicos

**Opção B: Criar estrutura igual a Projetos**
- ✅ Múltiplos clientes ideais por produto
- ✅ Dores vinculadas a clientes específicos
- ❌ Precisa criar 2 tabelas novas:
  - `influencerIdealClients`
  - `influencerPains`
- ❌ Precisa migration

### 💡 RECOMENDAÇÃO:

**Usar Opção A (manter estrutura atual)** porque:
1. Já existe no banco
2. Mais simples de implementar
3. Suficiente para o caso de uso (produto geralmente tem 1 cliente ideal principal)
4. Podemos gerar 5 opções de clientes, mas salvar apenas o selecionado

**Adaptação:**
- Gerar 5 clientes ideais (temporário, não salvar)
- Usuário escolhe 1
- Salvar apenas o escolhido no campo `idealClient`
- Gerar dores para esse cliente
- Salvar dores no array `pains`

---

## 3. FUNÇÕES DO BANCO (server/db.ts)

### Funções de Projetos a Mapear:
- `getIdealClientsByProject(projectId)` → retorna array de clientes
- `getPainsByProject(projectId)` → retorna array de dores
- `createIdealClients(projectId, clients[])` → insere múltiplos clientes
- `createPains(projectId, pains[])` → insere múltiplas dores

### Adaptação para Produtos:
- ✅ `getInfluencerProductById(id)` → já existe (retorna produto com `idealClient` e `pains`)
- ⚠️ Criar: `updateInfluencerProductIdealClient(id, idealClient)` → salva cliente escolhido
- ⚠️ Criar: `updateInfluencerProductPains(id, pains[])` → salva array de dores

---

**Status:** Mapeamento em andamento - Fase 2/5 completa


---

## 3. FRONTEND - Fluxo de UI de Projetos (ProjectDetail.tsx)

### Componentes e Estados Principais:

#### Estados para Clientes Ideais (linhas 66-70):
```typescript
const [showAddClientModal, setShowAddClientModal] = useState(false);
const [newClientName, setNewClientName] = useState("");
const [newClientDescription, setNewClientDescription] = useState("");
const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
```

#### Mutations (linhas 176-196):
```typescript
// Adicionar cliente ideal manualmente
const addIdealClient = trpc.projects.addIdealClient.useMutation({...});

// Gerar dores para um cliente específico
const generatePainsForClient = trpc.projects.generatePainsForClient.useMutation({...});

// Selecionar/desselecionar cliente
const toggleClientSelection = trpc.projects.toggleClientSelection.useMutation({...});
```

### Fluxo de UI:

#### 1. Aba "Clientes Ideais" (linhas 640-700):
- Botão "Adicionar Cliente Ideal" → abre modal
- Lista de clientes com:
  - Checkbox para selecionar
  - Nome + descrição
  - Badge "Selecionado"
  - Botão "Gerar Dores" (se não tiver dores)
  - Expansível para mostrar dores vinculadas

#### 2. Modal "Adicionar Cliente Ideal" (linhas 1130-1152):
- Input: Nome do cliente
- Textarea: Descrição
- Botão "Adicionar" → chama `addIdealClient.mutate()`

#### 3. Card de Cliente Expandido (linhas 653-700):
```typescript
<Card className={client.isSelected ? "bg-primary/5 border-primary/30" : "bg-card/50 opacity-60"}>
  <Checkbox checked={client.isSelected} onCheckedChange={() => toggleClientSelection.mutate({...})} />
  <div>{client.name}</div>
  <div>{client.description}</div>
  <Button onClick={() => handleGeneratePainsForClient(client.id)}>
    Gerar Dores
  </Button>
  {/* Lista de dores vinculadas */}
</Card>
```

#### 4. Aba "Dores" (linhas 795-870):
- Filtro por cliente ideal (dropdown)
- Dores agrupadas por nível (primary/secondary/unexplored)
- Cada dor mostra:
  - Título da dor
  - Descrição
  - Badge com nome do cliente vinculado
  - Checkbox para selecionar

### Adaptação para Produtos:

**Diferenças Críticas:**
1. Projetos: Múltiplos clientes (array) → Produtos: 1 cliente (string)
2. Projetos: Dores vinculadas a `idealClientId` → Produtos: Dores em array JSON

**Solução para Produtos:**
- **Não mostrar lista de clientes** (não há tabela)
- **Botão "Gerar Cliente Ideal"** → gera 5 opções temporárias
- **Modal com 5 cards de clientes** → usuário escolhe 1
- **Salvar apenas o escolhido** no campo `idealClient` (text)
- **Botão "Gerar Dores"** → gera dores para o cliente salvo
- **Salvar dores** no array `pains` (JSON)

---

## 4. PROMPTS - Funções de Geração (server/prompts.ts)

### Prompts de Projetos a Mapear:
1. `analyzeProjectPrompt(source, sourceType)` - Analisa negócio
2. `generateIdealClientsPrompt(analysis)` - Gera 5 clientes ideais
3. `generatePainsPrompt(analysis, idealClients)` - Gera dores

### Adaptação para Produtos:
- `generateProductIdealClientsPrompt(product)` - Gera 5 opções de clientes
- `generateProductPainsPrompt(product, idealClient)` - Gera dores para cliente escolhido

**Diferença de Contexto:**
- Projeto: Negócio completo (site, Instagram, descrição)
- Produto: Item específico (nome + descrição)

---

**Status:** Mapeamento em andamento - Fase 3/5 completa


---

## 4. ADAPTAÇÕES NECESSÁRIAS - Análise Detalhada

### 🔍 Sistema Atual de Produtos (Influenciadores)

#### Rotas Existentes (linhas 1746-1900):
1. ✅ `analyzeProduct` - Gera abordagens de venda (não clientes/dores)
2. ✅ `createProduct` - Aceita `idealClient` (string) e `pains` (array)
3. ✅ `listProducts` - Lista produtos do influenciador
4. ✅ `updateProduct` - Atualiza produto
5. ✅ `deleteProduct` - Deleta produto
6. ✅ `generateContentWithProduct` - Gera conteúdo com produto + contexto (trend/viral/subject)

#### Campos do Produto (schema linha 124-135):
```typescript
{
  id, influencerId, name, description,
  idealClient: text,  // ← Cliente ideal único (string)
  pains: json,        // ← Array de dores (string[])
  suggestedApproaches: json,  // ← Abordagens de venda
  selectedApproaches: json
}
```

### ✅ O QUE JÁ FUNCIONA:

1. **Estrutura de dados pronta** - Campos `idealClient` e `pains` já existem
2. **Rota de geração de conteúdo** - `generateContentWithProduct` já aceita produto + contexto
3. **Integração Grupo B** - Já suporta trend/viral/subject

### ⚠️ O QUE PRECISA SER CRIADO:

#### Backend (server/routers.ts):

**1. Rota: `generateIdealClients`**
```typescript
influencers.products.generateIdealClients: protectedProcedure
  .input(z.object({ productId: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const product = await db.getInfluencerProductById(input.productId);
    // Gerar 5 clientes ideais via LLM
    // Retornar array temporário (NÃO salvar no banco)
    return { clients: [...] };
  })
```

**2. Rota: `saveIdealClient`**
```typescript
influencers.products.saveIdealClient: protectedProcedure
  .input(z.object({ 
    productId: z.number(), 
    idealClient: z.string() 
  }))
  .mutation(async ({ input, ctx }) => {
    // Salvar cliente escolhido no campo `idealClient`
    await db.updateInfluencerProduct(input.productId, { 
      idealClient: input.idealClient 
    });
    return { success: true };
  })
```

**3. Rota: `generatePains`**
```typescript
influencers.products.generatePains: protectedProcedure
  .input(z.object({ productId: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const product = await db.getInfluencerProductById(input.productId);
    // Gerar dores para o `idealClient` salvo
    // Salvar no array `pains`
    const pains = await generatePainsForProduct(product);
    await db.updateInfluencerProduct(input.productId, { pains });
    return { pains };
  })
```

**4. Rota: `addManualClient`**
```typescript
influencers.products.addManualClient: protectedProcedure
  .input(z.object({ 
    productId: z.number(), 
    idealClient: z.string() 
  }))
  .mutation(async ({ input, ctx }) => {
    // Salvar cliente manual no campo `idealClient`
    await db.updateInfluencerProduct(input.productId, { 
      idealClient: input.idealClient 
    });
    return { success: true };
  })
```

#### Prompts (server/prompts.ts):

**1. `generateProductIdealClientsPrompt(product, influencer)`**
```typescript
export function generateProductIdealClientsPrompt(product: any, influencer: any) {
  return `Você é um especialista em personas e público-alvo.

INFLUENCIADOR:
Nicho: ${influencer.niche}
Descrição: ${influencer.description}

PRODUTO:
Nome: ${product.name}
Descrição: ${product.description}

TAREFA:
Gere 5 perfis de clientes ideais para este produto no contexto do influenciador.

Cada perfil deve ter:
- Nome fictício representativo
- Idade aproximada
- Ocupação/contexto de vida
- Motivação principal para comprar
- Objeção principal

Retorne JSON:
[
  {
    "name": "João, 28 anos, Mecânico Iniciante",
    "description": "Trabalha em oficina pequena, quer crescer profissionalmente...",
    "motivation": "Aumentar conhecimento técnico",
    "objection": "Preço alto"
  },
  ...
]`;
}
```

**2. `generateProductPainsPrompt(product, idealClient, influencer)`**
```typescript
export function generateProductPainsPrompt(product: any, idealClient: string, influencer: any) {
  return `Você é um especialista em copywriting e dores do cliente.

INFLUENCIADOR:
Nicho: ${influencer.niche}

PRODUTO:
Nome: ${product.name}
Descrição: ${product.description}

CLIENTE IDEAL:
${idealClient}

TAREFA:
Gere 5-8 dores específicas que este cliente ideal enfrenta e que o produto resolve.

Retorne array JSON:
["Dor 1: Não sabe como...", "Dor 2: Tem medo de...", ...]`;
}
```

#### Frontend (client/src/pages/GenerateInfluencerContent.tsx):

**1. Modal de Produto Expandido**
- Clicar no card do produto → abre Dialog
- Seções dentro do Dialog:
  - **Seção 1: Cliente Ideal**
    - Se não tem cliente: Botão "Gerar Clientes Ideais"
    - Se gerando: Mostrar 5 cards com opções
    - Botão "+ Adicionar Manualmente"
    - Se já tem cliente: Mostrar cliente salvo + botão "Alterar"
  - **Seção 2: Dores** (só aparece se tem cliente)
    - Se não tem dores: Botão "Gerar Dores"
    - Se tem dores: Lista de dores com checkboxes

**2. Estados Necessários**
```typescript
const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
const [productModalOpen, setProductModalOpen] = useState(false);
const [generatedClients, setGeneratedClients] = useState<any[]>([]);
const [isGeneratingClients, setIsGeneratingClients] = useState(false);
const [showManualClientInput, setShowManualClientInput] = useState(false);
const [manualClientText, setManualClientText] = useState("");
```

**3. Mutations**
```typescript
const generateClients = trpc.influencers.products.generateIdealClients.useMutation({...});
const saveClient = trpc.influencers.products.saveIdealClient.useMutation({...});
const generatePains = trpc.influencers.products.generatePains.useMutation({...});
const addManualClient = trpc.influencers.products.addManualClient.useMutation({...});
```

---

## 5. PLANO DE IMPLEMENTAÇÃO DETALHADO

### Fase 1: Backend - Rotas (30 min)
1. ✅ Criar `generateIdealClients` em `server/routers.ts`
2. ✅ Criar `saveIdealClient` em `server/routers.ts`
3. ✅ Criar `generatePains` em `server/routers.ts`
4. ✅ Criar `addManualClient` em `server/routers.ts`

### Fase 2: Backend - Prompts (20 min)
1. ✅ Criar `generateProductIdealClientsPrompt` em `server/prompts.ts`
2. ✅ Criar `generateProductPainsPrompt` em `server/prompts.ts`

### Fase 3: Frontend - Modal de Produto (60 min)
1. ✅ Criar Dialog expandido ao clicar no produto
2. ✅ Seção "Cliente Ideal" com botão "Gerar"
3. ✅ Mostrar 5 cards de clientes gerados
4. ✅ Botão "+ Adicionar Manualmente"
5. ✅ Salvar cliente escolhido
6. ✅ Seção "Dores" com botão "Gerar"
7. ✅ Lista de dores com checkboxes

### Fase 4: Integração Grupo A + B (30 min)
1. ✅ Modificar lógica de geração de conteúdo
2. ✅ Aceitar produto direto (sem cliente/dor)
3. ✅ Aceitar produto + cliente + dor
4. ✅ Mesclar com trend/viral/assunto

### Fase 5: Testes (30 min)
1. ✅ Testar geração de clientes
2. ✅ Testar geração de dores
3. ✅ Testar modo direto (produto + trend)
4. ✅ Testar modo detalhado (produto + cliente + dor + trend)

---

## 6. RISCOS E MITIGAÇÕES

### ⚠️ Risco 1: Cliente gerado muito genérico
**Mitigação:** Incluir contexto do nicho do influenciador no prompt

### ⚠️ Risco 2: Dores não alinhadas com produto
**Mitigação:** Passar descrição completa do produto no prompt de dores

### ⚠️ Risco 3: UI confusa (modal com muitas seções)
**Mitigação:** Usar abas ou expansíveis, mostrar apenas seção ativa

### ⚠️ Risco 4: Usuário não entende diferença entre modo direto e detalhado
**Mitigação:** Adicionar tooltip explicativo, mostrar preview do prompt

---

## 7. ESTIMATIVA FINAL

**Tempo Total:** ~2h30min
**Complexidade:** Média (copiar lógica de Projetos + adaptar para estrutura simples)
**Chance de Erro:** Baixa (estrutura de dados já existe, apenas adicionar rotas)

**Principais Diferenças vs Projetos:**
1. ❌ Não criar tabelas novas (usar campos existentes)
2. ❌ Não salvar múltiplos clientes (apenas 1 escolhido)
3. ✅ Gerar 5 opções temporárias (não salvar no banco)
4. ✅ Integração Grupo B já existe (`generateContentWithProduct`)

---

**Status:** Mapeamento COMPLETO - Pronto para implementação
