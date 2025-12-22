# 📋 Implementação Pendente: Sistema de Dores para Influenciadores

## ✅ O que já está pronto:

### 1. Schema do Banco de Dados
- ✅ Tabela `influencerNiches` criada
- ✅ Tabela `influencerIdealClients` criada  
- ✅ Tabela `influencerPains` criada

### 2. Funções no db.ts
- ✅ `createInfluencerNiche(influencerId, name, description)` - linha 893
- ✅ `getInfluencerNiches(influencerId)` - linha 900
- ✅ `getInfluencerNicheById(id)` - linha 907
- ✅ `createInfluencerIdealClient(nicheId, data)` - linha 915
- ✅ `getIdealClientByNiche(nicheId)` - linha 922
- ✅ `createInfluencerPains(idealClientId, painsList)` - linha 930
- ✅ `getInfluencerPainsByIdealClient(idealClientId)` - linha 938
- ✅ `getAllPainsByInfluencer(influencerId)` - linha 944

---

## ❌ O que FALTA implementar:

### 3. Procedures Backend (server/routers.ts)

Criar sub-router `niches` dentro do router `influencers`:

```typescript
// Adicionar em server/routers.ts, dentro do router influencers

niches: router({
  // Criar nicho
  create: protectedProcedure
    .input(z.object({
      influencerId: z.number(),
      name: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const nicheId = await createInfluencerNiche(
        input.influencerId,
        input.name,
        input.description
      );
      return { nicheId };
    }),

  // Listar nichos do influenciador
  list: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input }) => {
      return await getInfluencerNiches(input.influencerId);
    }),

  // Gerar cliente ideal a partir do nicho (usando LLM)
  generateIdealClient: protectedProcedure
    .input(z.object({
      nicheId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Buscar nicho
      const niche = await getInfluencerNicheById(input.nicheId);
      if (!niche) throw new TRPCError({ code: "NOT_FOUND" });

      // 2. Chamar LLM para gerar cliente ideal
      const prompt = `
Você é um especialista em marketing e personas.

Nicho: ${niche.name}
Descrição: ${niche.description || "Não fornecida"}

Crie um perfil detalhado do cliente ideal para este nicho.

Retorne em JSON com esta estrutura:
{
  "name": "Nome do cliente ideal (ex: Maria Empreendedora)",
  "description": "Descrição geral do cliente",
  "demographics": {
    "age": "Faixa etária",
    "gender": "Gênero predominante",
    "location": "Localização",
    "income": "Faixa de renda",
    "education": "Nível de educação",
    "occupation": "Ocupação"
  },
  "psychographics": {
    "goals": ["objetivo 1", "objetivo 2"],
    "challenges": ["desafio 1", "desafio 2"],
    "values": ["valor 1", "valor 2"],
    "interests": ["interesse 1", "interesse 2"]
  }
}
`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ideal_client",
            strict: true,
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                demographics: {
                  type: "object",
                  properties: {
                    age: { type: "string" },
                    gender: { type: "string" },
                    location: { type: "string" },
                    income: { type: "string" },
                    education: { type: "string" },
                    occupation: { type: "string" }
                  },
                  required: ["age", "gender", "location", "income", "education", "occupation"],
                  additionalProperties: false
                },
                psychographics: {
                  type: "object",
                  properties: {
                    goals: { type: "array", items: { type: "string" } },
                    challenges: { type: "array", items: { type: "string" } },
                    values: { type: "array", items: { type: "string" } },
                    interests: { type: "array", items: { type: "string" } }
                  },
                  required: ["goals", "challenges", "values", "interests"],
                  additionalProperties: false
                }
              },
              required: ["name", "description", "demographics", "psychographics"],
              additionalProperties: false
            }
          }
        }
      });

      const clientData = JSON.parse(response.choices[0].message.content);

      // 3. Salvar no banco
      const clientId = await createInfluencerIdealClient(input.nicheId, clientData);

      return { clientId, ...clientData };
    }),

  // Gerar dores a partir do cliente ideal (usando LLM)
  generatePains: protectedProcedure
    .input(z.object({
      nicheId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Buscar nicho e cliente ideal
      const niche = await getInfluencerNicheById(input.nicheId);
      if (!niche) throw new TRPCError({ code: "NOT_FOUND" });

      const client = await getIdealClientByNiche(input.nicheId);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente ideal não encontrado. Gere o cliente ideal primeiro." });

      // 2. Chamar LLM para gerar dores
      const prompt = `
Você é um especialista em marketing e copywriting.

Nicho: ${niche.name}
Cliente Ideal: ${client.name}
Descrição: ${client.description}
Demografia: ${JSON.stringify(client.demographics)}
Psicografia: ${JSON.stringify(client.psychographics)}

Identifique as dores (pain points) deste cliente ideal em 3 níveis:
- PRIMARY: Dores óbvias e conscientes (o cliente sabe que tem)
- SECONDARY: Dores menos óbvias (o cliente sente mas não identifica claramente)
- UNEXPLORED: Dores profundas e inconscientes (o cliente não percebe)

Retorne em JSON com esta estrutura:
{
  "pains": [
    {
      "level": "primary",
      "pain": "Título curto da dor",
      "description": "Descrição detalhada da dor"
    },
    ...
  ]
}

Gere pelo menos 3 dores de cada nível (total mínimo: 9 dores).
`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "pains_list",
            strict: true,
            schema: {
              type: "object",
              properties: {
                pains: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      level: { type: "string", enum: ["primary", "secondary", "unexplored"] },
                      pain: { type: "string" },
                      description: { type: "string" }
                    },
                    required: ["level", "pain", "description"],
                    additionalProperties: false
                  }
                }
              },
              required: ["pains"],
              additionalProperties: false
            }
          }
        }
      });

      const { pains } = JSON.parse(response.choices[0].message.content);

      // 3. Salvar no banco
      await createInfluencerPains(client.id, pains);

      return { count: pains.length, pains };
    }),

  // Listar todas as dores do influenciador
  listPains: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input }) => {
      return await getAllPainsByInfluencer(input.influencerId);
    }),
}),
```

**Caminho final das procedures:**
- `influencers.niches.create`
- `influencers.niches.list`
- `influencers.niches.generateIdealClient`
- `influencers.niches.generatePains`
- `influencers.niches.listPains`

---

### 4. Frontend (client/src/pages/InfluencerContentCreate.tsx)

**Aba Dores - Fluxo completo:**

```typescript
// Estados necessários
const [selectedNicheId, setSelectedNicheId] = useState<number | null>(null);
const [showCreateNicheModal, setShowCreateNicheModal] = useState(false);
const [newNicheName, setNewNicheName] = useState("");
const [newNicheDescription, setNewNicheDescription] = useState("");
const [selectedPains, setSelectedPains] = useState<number[]>([]);

// Queries
const { data: niches, refetch: refetchNiches } = trpc.influencers.niches.list.useQuery(
  { influencerId: Number(influencerId) }
);

const { data: pains } = trpc.influencers.niches.listPains.useQuery(
  { influencerId: Number(influencerId) }
);

// Mutations
const createNiche = trpc.influencers.niches.create.useMutation({
  onSuccess: () => {
    refetchNiches();
    setShowCreateNicheModal(false);
    setNewNicheName("");
    setNewNicheDescription("");
  }
});

const generateIdealClient = trpc.influencers.niches.generateIdealClient.useMutation();

const generatePains = trpc.influencers.niches.generatePains.useMutation({
  onSuccess: () => {
    refetchNiches();
  }
});

// Interface da aba Dores
<TabsContent value="dores">
  <div className="space-y-4">
    {/* Botão Criar Nicho */}
    <Button onClick={() => setShowCreateNicheModal(true)}>
      + Novo Nicho
    </Button>

    {/* Dropdown de Nichos */}
    <Select value={selectedNicheId?.toString()} onValueChange={(v) => setSelectedNicheId(Number(v))}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um nicho" />
      </SelectTrigger>
      <SelectContent>
        {niches?.map(niche => (
          <SelectItem key={niche.id} value={niche.id.toString()}>
            {niche.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Botões de Geração */}
    {selectedNicheId && (
      <div className="space-x-2">
        <Button 
          onClick={() => generateIdealClient.mutate({ nicheId: selectedNicheId })}
          disabled={generateIdealClient.isPending}
        >
          {generateIdealClient.isPending ? "Gerando..." : "Gerar Cliente Ideal"}
        </Button>

        <Button 
          onClick={() => generatePains.mutate({ nicheId: selectedNicheId })}
          disabled={generatePains.isPending}
        >
          {generatePains.isPending ? "Gerando..." : "Gerar Dores"}
        </Button>
      </div>
    )}

    {/* Lista de Dores com Checkboxes */}
    <div className="space-y-2">
      {pains?.map(pain => (
        <div key={pain.id} className="flex items-start gap-2 p-3 border rounded">
          <input
            type="checkbox"
            checked={selectedPains.includes(pain.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPains([...selectedPains, pain.id]);
              } else {
                setSelectedPains(selectedPains.filter(id => id !== pain.id));
              }
            }}
          />
          <div>
            <div className="font-medium">{pain.pain}</div>
            <div className="text-sm text-muted-foreground">{pain.description}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {pain.nicheName} • {pain.clientName} • {pain.level}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Modal Criar Nicho */}
  <Dialog open={showCreateNicheModal} onOpenChange={setShowCreateNicheModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Criar Novo Nicho</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Nome do Nicho</Label>
          <Input
            value={newNicheName}
            onChange={(e) => setNewNicheName(e.target.value)}
            placeholder="Ex: Fitness para iniciantes"
          />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea
            value={newNicheDescription}
            onChange={(e) => setNewNicheDescription(e.target.value)}
            placeholder="Descreva o nicho..."
          />
        </div>
        <Button 
          onClick={() => createNiche.mutate({
            influencerId: Number(influencerId),
            name: newNicheName,
            description: newNicheDescription
          })}
          disabled={!newNicheName || createNiche.isPending}
        >
          {createNiche.isPending ? "Criando..." : "Criar Nicho"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</TabsContent>
```

---

## 📝 Resumo para retomar:

1. **Adicionar sub-router `niches`** em `server/routers.ts` (dentro de `influencers`)
2. **Importar `invokeLLM`** no topo do arquivo
3. **Copiar as 5 procedures** do código acima
4. **Implementar interface** na aba Dores do `InfluencerContentCreate.tsx`
5. **Testar fluxo:** Criar nicho → Gerar cliente → Gerar dores → Selecionar dores

**Tempo estimado:** 30-40 minutos de implementação + testes

---

## 🔗 Integração com Geração de Conteúdo

Quando Dores estiver pronto, atualizar `generateContent` para aceitar `painIds`:

```typescript
// Em server/routers.ts, procedure generateContent
.input(z.object({
  // ... outros campos
  painIds: z.array(z.number()).optional(), // IDs das dores selecionadas
}))
```

E passar as dores para o LLM junto com trends/virais/produtos.
