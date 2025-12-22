# Documentação Completa dos Prompts de IA - Gerador 3

## Índice
- [IA-1: Seleção de Template Visual](#ia-1-seleção-de-template-visual)
- [IA-2: Seleção de Templates Variados](#ia-2-seleção-de-templates-variados)
- [IA-3: Análise de Projeto](#ia-3-análise-de-projeto)
- [IA-4: Geração de Clientes Ideais](#ia-4-geração-de-clientes-ideais)
- [IA-5: Geração de Dores](#ia-5-geração-de-dores)
- [IA-6: Análise Profunda de Link](#ia-6-análise-profunda-de-link)
- [IA-7: Geração de Dores por Clientes Selecionados](#ia-7-geração-de-dores-por-clientes-selecionados)
- [IA-8: Geração de Dores por Cliente Ideal](#ia-8-geração-de-dores-por-cliente-ideal)
- [IA-9: Geração de Conteúdo (Projetos)](#ia-9-geração-de-conteúdo-projetos)
- [IA-10: Geração de Conteúdo Soft-Sell](#ia-10-geração-de-conteúdo-soft-sell)
- [IA-11: Geração de Abordagens de Produto](#ia-11-geração-de-abordagens-de-produto)
- [IA-12: Geração de Conteúdo de Produto](#ia-12-geração-de-conteúdo-de-produto)
- [IA-13: Coleta de Trends](#ia-13-coleta-de-trends)
- [IA-14: Coleta de Virais](#ia-14-coleta-de-virais)
- [IA-15: Busca de Notícias](#ia-15-busca-de-notícias)
- [IA-16: Geração de Conteúdo com Notícia](#ia-16-geração-de-conteúdo-com-notícia)

---

## IA-1: Seleção de Template Visual

**Localização:** `server/routers.ts` linha 80  
**Função:** `projects.selectVisualTemplate`  
**Quando é chamado:** Quando o usuário gera um carrossel e precisa selecionar templates visuais automaticamente

### O que faz
Analisa o texto do conteúdo e seleciona o template visual mais adequado baseado no tom, tipo de conteúdo e objetivo.

### Entrada
- `text`: Texto do conteúdo a ser analisado
- `templates`: Lista de templates disponíveis com IDs e descrições

### Saída (JSON)
```json
{
  "templateId": "id-do-template-escolhido",
  "accentColorId": "id-da-cor-de-destaque",
  "reason": "breve explicação da escolha"
}
```

### Prompt Completo
```
Você é um especialista em design de conteúdo para redes sociais, especialmente no estilo @brandsdecoded__.

Analise o texto abaixo e escolha o template visual mais adequado.

TEXTO DO CONTEÚDO:
"[texto do slide]"

TEMPLATES DISPONÍVEIS:
[lista de templates com IDs e descrições]

Critérios de escolha:
- Tom do texto (provocativo, informativo, emocional, humor, urgente)
- Tipo de conteúdo (dados/números, história, pergunta, lista, citação, comparação)
- Objetivo implícito (venda, autoridade, engajamento, educação)
- Presença de elementos específicos (%, números, perguntas, urgência, antes/depois)

Responda APENAS com um JSON:
{
  "templateId": "id-do-template-escolhido",
  "accentColorId": "id-da-cor-de-destaque",
  "reason": "breve explicação da escolha"
}

Cores disponíveis: neon-green, neon-yellow, neon-pink, neon-blue, neon-orange, neon-red, white, gold, neon-purple, neon-cyan
```

---

## IA-2: Seleção de Templates Variados

**Localização:** `server/routers.ts` linha 157  
**Função:** `projects.selectVariedTemplates`  
**Quando é chamado:** Quando o usuário gera um carrossel com múltiplos slides

### O que faz
Seleciona templates DIFERENTES e VARIADOS para cada slide do carrossel, criando experiência visual dinâmica.

### Entrada
- `slides`: Array de objetos com `{order, text}` de cada slide
- `templates`: Lista de templates disponíveis
- `palettes`: Lista de paletas de cores

### Saída (JSON)
```json
{
  "paletteId": "id-da-paleta-escolhida",
  "slides": [
    { "order": 1, "templateId": "id-template", "reason": "breve justificativa" },
    { "order": 2, "templateId": "id-template", "reason": "breve justificativa" }
  ]
}
```

### Prompt Completo
```
Você é um especialista em design de carrosséis para Instagram no estilo @brandsdecoded__.

Você recebeu um carrossel com [N] slides. Sua tarefa é escolher templates DIFERENTES e VARIADOS para cada slide, criando uma experiência visual dinâmica.

SLIDES DO CARROSSEL:
Slide 1: "[texto]"
Slide 2: "[texto]"
...

TEMPLATES DISPONÍVEIS:
[lista de templates]

PALETAS DE CORES:
[lista de paletas]

REGRAS IMPORTANTES:
1. NÃO repita o mesmo template em slides consecutivos
2. Varie os layouts (split, card, fullbleed, minimal, bold)
3. Mantenha coerência visual usando a mesma paleta de cores
4. O primeiro slide (capa) deve ser impactante - use templates bold ou fullbleed
5. O último slide (CTA) deve ser limpo - use templates minimal ou card
6. Slides com dados/números: use templates com mais espaço para texto
7. Slides com histórias/emoção: use templates fullbleed com imagem forte

Responda APENAS com um JSON:
{
  "paletteId": "id-da-paleta-escolhida",
  "slides": [
    { "order": 1, "templateId": "id-template", "reason": "breve justificativa" },
    { "order": 2, "templateId": "id-template", "reason": "breve justificativa" },
    ...
  ]
}
```

---

## IA-3: Análise de Projeto

**Localização:** `server/routers.ts` linha 279  
**Função:** `projects.analyze`  
**Quando é chamado:** Logo após o usuário cadastrar um projeto (URL ou descrição)

### O que faz
Analisa a fonte do projeto (site, Instagram, TikTok ou descrição) e extrai informações relevantes para criação de conteúdo.

### Entrada
- `source`: URL ou descrição do projeto
- `sourceType`: Tipo da fonte (website, instagram, tiktok, description)

### Saída (JSON)
```json
{
  "businessName": "nome do negócio/marca",
  "niche": "nicho de atuação",
  "mainProduct": "produto/serviço principal",
  "targetAudience": "público-alvo geral",
  "tone": "tom de comunicação identificado",
  "uniqueValue": "proposta de valor única",
  "keywords": ["palavras-chave relevantes"]
}
```

### Prompt Completo
```
Analise a seguinte fonte e extraia informações relevantes para criação de conteúdo para redes sociais.

Fonte ([tipo]): [URL ou descrição]

Retorne um JSON com:
{
  "businessName": "nome do negócio/marca",
  "niche": "nicho de atuação",
  "mainProduct": "produto/serviço principal",
  "targetAudience": "público-alvo geral",
  "tone": "tom de comunicação identificado",
  "uniqueValue": "proposta de valor única",
  "keywords": ["palavras-chave relevantes"]
}
```

---

## IA-4: Geração de Clientes Ideais

**Localização:** `server/routers.ts` linha 298  
**Função:** `projects.analyze` (segunda chamada)  
**Quando é chamado:** Imediatamente após a análise do projeto

### O que faz
Gera 10 perfis de GRUPOS de clientes ideais baseados na análise do projeto.

### Entrada
- `analysis`: JSON com análise do projeto (resultado da IA-3)

### Saída (JSON Array)
```json
[
  {
    "name": "Descrição do grupo (ex: 'Mães que buscam praticidade na cozinha')",
    "description": "Descrição detalhada do perfil e suas características",
    "demographics": {
      "age": "faixa etária",
      "gender": "gênero predominante",
      "location": "localização típica",
      "income": "faixa de renda",
      "education": "nível de educação"
    },
    "psychographics": {
      "values": ["valores importantes"],
      "interests": ["interesses"],
      "lifestyle": "estilo de vida",
      "goals": ["objetivos"],
      "challenges": ["desafios"]
    }
  }
]
```

### Prompt Completo
```
Com base na análise do negócio abaixo, gere 10 perfis de GRUPOS de clientes ideais.

Análise: [JSON da análise]

IMPORTANTE: NÃO use nomes fictícios como "Maria", "João", "Ana". Use DESCRIÇÕES DE GRUPO.

Exemplos CORRETOS:
- "Mães que buscam praticidade na cozinha"
- "Profissionais de saúde com rotina intensa"
- "Empreendedores iniciantes em marketing digital"
- "Pessoas com restrições alimentares"
- "Jovens adultos começando a morar sozinhos"

Exemplos INCORRETOS (NÃO USE):
- "Ana, a Otimizadora Doméstica"
- "Lucas, o Fitness Focado"
- "Maria Empreendedora"

Para cada grupo de cliente ideal, retorne um JSON array com:
[
  {
    "name": "Descrição do grupo (ex: 'Mães que buscam praticidade na cozinha')",
    "description": "Descrição detalhada do perfil e suas características",
    "demographics": {
      "age": "faixa etária",
      "gender": "gênero predominante",
      "location": "localização típica",
      "income": "faixa de renda",
      "education": "nível de educação"
    },
    "psychographics": {
      "values": ["valores importantes"],
      "interests": ["interesses"],
      "lifestyle": "estilo de vida",
      "goals": ["objetivos"],
      "challenges": ["desafios"]
    }
  }
]

Gere exatamente 10 grupos de clientes diversos e realistas. NUNCA use nomes próprios.
```

---

## IA-5: Geração de Dores

**Localização:** `server/routers.ts` linha 330  
**Função:** `projects.analyze` (terceira chamada)  
**Quando é chamado:** Após o usuário selecionar 3 clientes ideais

### O que faz
Gera dores (primárias, secundárias, inexploradas) para os clientes ideais selecionados.

### Entrada
- `analysis`: JSON com análise do projeto
- `idealClients`: JSON com clientes ideais selecionados

### Saída (JSON)
```json
{
  "primary": [
    {"pain": "dor principal", "description": "explicação detalhada"}
  ],
  "secondary": [
    {"pain": "dor secundária", "description": "explicação detalhada"}
  ],
  "unexplored": [
    {"pain": "dor inexplorada", "description": "explicação detalhada"}
  ]
}
```

### Prompt Completo
```
Com base na análise do negócio e nos clientes ideais, gere dores em 3 níveis.

Análise: [JSON]
Clientes Ideais: [JSON]

Retorne um JSON com:
{
  "primary": [
    {"pain": "dor principal 1", "description": "explicação detalhada"},
    {"pain": "dor principal 2", "description": "explicação detalhada"},
    {"pain": "dor principal 3", "description": "explicação detalhada"},
    {"pain": "dor principal 4", "description": "explicação detalhada"},
    {"pain": "dor principal 5", "description": "explicação detalhada"}
  ],
  "secondary": [
    {"pain": "dor secundária 1", "description": "explicação detalhada"},
    {"pain": "dor secundária 2", "description": "explicação detalhada"},
    {"pain": "dor secundária 3", "description": "explicação detalhada"},
    {"pain": "dor secundária 4", "description": "explicação detalhada"},
    {"pain": "dor secundária 5", "description": "explicação detalhada"}
  ],
  "unexplored": [
    {"pain": "dor inexplorada 1", "description": "explicação detalhada"},
    {"pain": "dor inexplorada 2", "description": "explicação detalhada"},
    {"pain": "dor inexplorada 3", "description": "explicação detalhada"},
    {"pain": "dor inexplorada 4", "description": "explicação detalhada"},
    {"pain": "dor inexplorada 5", "description": "explicação detalhada"}
  ]
}

- Dores primárias: problemas óbvios e urgentes
- Dores secundárias: problemas relacionados mas menos urgentes
- Dores inexploradas: problemas que o público nem sabe que tem
```

---

## IA-6: Análise Profunda de Link

**Localização:** `server/routers.ts` linha 437  
**Função:** `projects.analyzeLink`  
**Quando é chamado:** Quando o usuário solicita análise profunda de um link

### O que faz
Análise profunda de site/perfil social com schema JSON estruturado, identificando TODOS os possíveis clientes ideais.

### Entrada
- `url`: URL do site ou perfil social
- `sourceType`: Tipo da fonte

### Saída (JSON com schema estruturado)
```json
{
  "businessAnalysis": {
    "name": "nome do negócio",
    "niche": "nicho principal",
    "mainOffer": "oferta principal",
    "uniqueValue": "proposta de valor única",
    "tone": "tom de comunicação",
    "keywords": ["palavras-chave identificadas"]
  },
  "potentialClients": [
    {
      "name": "Nome descritivo do perfil",
      "description": "Descrição breve",
      "demographics": {...},
      "psychographics": {...},
      "buyingMotivation": "Por que compraria",
      "mainPain": "Dor principal"
    }
  ]
}
```

### Prompt Completo
```
Você é um especialista em análise de negócios e marketing digital.

Analise PROFUNDAMENTE o seguinte link e identifique TODOS os possíveis clientes ideais que esse negócio poderia atender.

Link: [URL]
Tipo: [tipo]

Sua análise deve considerar:
1. O produto/serviço oferecido
2. A linguagem e tom de comunicação
3. Os problemas que o negócio resolve
4. O posicionamento de mercado
5. Os benefícios destacados
6. O público-alvo implícito e explícito

Retorne um JSON com:
{
  "businessAnalysis": {
    "name": "nome do negócio",
    "niche": "nicho principal",
    "mainOffer": "oferta principal",
    "uniqueValue": "proposta de valor única",
    "tone": "tom de comunicação",
    "keywords": ["palavras-chave identificadas"]
  },
  "potentialClients": [
    {
      "name": "Nome descritivo do perfil (ex: 'Maria Empreendedora', 'João Executivo')",
      "description": "Descrição breve de quem é essa pessoa",
      "demographics": {
        "age": "faixa etária",
        "gender": "gênero predominante",
        "location": "localização típica",
        "income": "faixa de renda",
        "occupation": "ocupação/profissão"
      },
      "psychographics": {
        "values": ["valores importantes"],
        "interests": ["interesses"],
        "lifestyle": "estilo de vida",
        "goals": ["objetivos principais"],
        "frustrations": ["frustrações atuais"]
      },
      "buyingMotivation": "Por que essa pessoa compraria?",
      "mainPain": "Dor principal que esse cliente tem"
    }
  ]
}

Gere entre 8 a 12 perfis de clientes potenciais, variando desde os mais óbvios até os menos explorados.
Seja criativo e pense em nichos adjacentes que também poderiam se beneficiar.
```

---

## IA-7: Geração de Dores por Clientes Selecionados

**Localização:** `server/routers.ts` linha 561  
**Função:** `projects.generatePainsForClients`  
**Quando é chamado:** Após análise profunda, quando usuário seleciona clientes específicos

### O que faz
Gera dores específicas e profundas para os clientes SELECIONADOS pelo usuário, em 3 categorias.

### Entrada
- `businessAnalysis`: JSON com análise do negócio
- `selectedClients`: JSON com clientes selecionados

### Saída (JSON com schema estruturado)
```json
{
  "primary": [
    {
      "pain": "dor principal",
      "description": "explicação detalhada de por que isso dói",
      "contentOpportunity": "como usar em conteúdo"
    }
  ],
  "secondary": [...],
  "unexplored": [...]
}
```

### Prompt Completo
```
Você é um especialista em copywriting e psicologia do consumidor.

Com base na análise do negócio e nos clientes ideais SELECIONADOS pelo usuário, gere dores em 3 categorias:

Análise do Negócio: [JSON]

Clientes Ideais Selecionados: [JSON]

Gere dores específicas para ESSES clientes selecionados:

1. **DORES PRINCIPAIS** (5-7 dores)
   - São as dores mais evidentes e urgentes
   - Problemas que o cliente já sabe que tem
   - Dores que ele busca ativamente resolver
   - Muito conteúdo já existe sobre isso

2. **DORES SECUNDÁRIAS** (5-7 dores)
   - Dores relacionadas mas menos óbvias
   - Problemas que o cliente reconhece quando apontados
   - Consequências das dores principais
   - Algum conteúdo existe, mas não é saturado

3. **DORES INEXPLORADAS** (5-7 dores)
   - Dores que o cliente nem sabe que tem
   - Problemas que poucos criadores abordam
   - Oportunidades de conteúdo diferenciado
   - Pouco ou nenhum conteúdo sobre isso nas redes
   - GRANDE OPORTUNIDADE para se destacar

Retorne um JSON com:
{
  "primary": [
    {"pain": "dor principal", "description": "explicação detalhada de por que isso dói", "contentOpportunity": "como usar em conteúdo"}
  ],
  "secondary": [
    {"pain": "dor secundária", "description": "explicação detalhada", "contentOpportunity": "como usar em conteúdo"}
  ],
  "unexplored": [
    {"pain": "dor inexplorada", "description": "explicação detalhada", "contentOpportunity": "por que é uma oportunidade"}
  ]
}

IMPORTANTE: As dores devem ser ESPECÍFICAS para os clientes selecionados, não genéricas.
Use a linguagem que esses clientes usariam para descrever seus problemas.
```

---

## IA-8: Geração de Dores por Cliente Ideal

**Localização:** `server/routers.ts` linha 750  
**Função:** `projects.generatePainsByIdealClient`  
**Quando é chamado:** Quando usuário quer gerar dores para um cliente ideal específico

### O que faz
Gera 9 dores (3 primárias, 3 secundárias, 3 inexploradas) para um cliente ideal específico.

### Entrada
- `idealClientName`: Nome do cliente ideal
- Contexto do projeto (implícito)

### Saída (JSON com schema estruturado)
```json
{
  "primary": [
    {"pain": "dor", "description": "explicação"}
  ],
  "secondary": [...],
  "unexplored": [...]
}
```

### Prompt Completo
```
Você é um especialista em copywriting e psicologia do consumidor. Gere dores ESPECÍFICAS e PROFUNDAS para o cliente ideal fornecido.

Cliente Ideal: [nome]

Gere EXATAMENTE 9 dores (3 de cada categoria):

**DORES PRIMÁRIAS** (3 dores)
- Problemas óbvios e urgentes
- O cliente já sabe que tem
- Busca ativamente resolver
- Muito conteúdo já existe

**DORES SECUNDÁRIAS** (3 dores)
- Menos óbvias mas relacionadas
- Cliente reconhece quando apontado
- Consequências das primárias
- Algum conteúdo existe

**DORES INEXPLORADAS** (3 dores)
- Cliente nem sabe que tem
- Poucos criadores abordam
- GRANDE OPORTUNIDADE de conteúdo único
- Pouco/nenhum conteúdo nas redes

Classificação de saturação:
- saturated: 80%+ do mercado já fala disso
- common: 40-80% falam sobre
- emerging: 10-40% começam a explorar
- unexplored: <10% abordam (OPORTUNIDADE!)

Retorne JSON:
{
  "primary": [
    {
      "pain": "dor específica e clara",
      "description": "por que isso dói profundamente",
      "saturation": "saturated/common/emerging/unexplored",
      "contentAngle": "ângulo único para abordar"
    }
  ],
  "secondary": [...],
  "unexplored": [...]
}

Estatísticas esperadas:
- primary: 3 dores saturadas (oportunidades de conteúdo conhecido)
- secondary: 3 dores comuns (oportunidades de diferenciação)
- unexplored: 3 dores inexploradas (oportunidades de conteúdo único)
```

---

## IA-9: Geração de Conteúdo (Projetos)

**Localização:** `server/routers.ts` linha 951  
**Função:** `projects.generateContent`  
**Quando é chamado:** Quando usuário clica em "Gerar Conteúdo" após configurar tudo

### O que faz
Gera conteúdo completo (título, descrição, hook, slides) para carrossel baseado em todos os parâmetros configurados.

### Entrada (parâmetros extensos)
- `template`: Nome do template (ex: "PAS", "AIDA")
- `templateStructure`: Array com estrutura do template
- `pain`: Dor selecionada
- `painDescription`: Descrição da dor (opcional)
- `niche`: Nicho do projeto
- `objective`: "sale" | "authority" | "growth"
- `person`: "first" | "second" | "third"
- `platform`: "instagram" | "tiktok"
- `voiceTone`: Tom de voz
- `voiceToneDetails`: Características e exemplos (opcional)
- `clickbait`: boolean
- `hookType`: Tipo de gancho (opcional)
- `formula`: Fórmula de copy (opcional)
- `businessContext`: Contexto do negócio (opcional)
- `idealClient`: Cliente ideal (opcional)

### Saída (JSON)
```json
{
  "title": "título interno do conteúdo",
  "description": "legenda completa para o post (pode ser longa, com emojis e hashtags)",
  "hook": "a frase de gancho do primeiro slide",
  "slides": [
    {"order": 1, "text": "texto do slide 1 - O HOOK"},
    {"order": 2, "text": "texto do slide 2"}
  ]
}
```

### Prompt Completo (resumido - muito extenso)
```
Você é um COPYWRITER PROFISSIONAL especializado em conteúdo para redes sociais.
Sua missão é criar textos que CONVERTEM, ENGAJAM e VENDEM.

===== CONTEXTO DO CONTEÚDO =====
Plataforma: [Instagram/TikTok]
Estilo da plataforma: [estilo específico]
Nicho: [nicho]
Contexto do negócio: [contexto]
Cliente ideal: [cliente]

===== DOR/TEMA CENTRAL =====
Dor: [dor]
Descrição: [descrição]

Esta dor é o CENTRO de todo o conteúdo. Cada slide deve:
- Tocar nessa dor de forma ESPECÍFICA
- Usar a LINGUAGEM que o público usa para descrever esse problema
- Mostrar que você ENTENDE profundamente o que eles sentem

===== ESTRUTURA DO CARROSSEL =====
Template: [template]
Estrutura: [estrutura]
Número de slides: [min] a [max]

Siga EXATAMENTE esta estrutura. Cada slide tem um propósito específico.

===== OBJETIVO DO CONTEÚDO =====
Objetivo: [VENDA/AUTORIDADE/CRESCIMENTO]

Diretrizes para este objetivo:
[diretrizes específicas por objetivo]

===== TOM DE VOZ =====
Tom: [tom]
Características: [características]
Exemplos: [exemplos]

MANTENHA este tom CONSISTENTEMENTE em todos os slides.

===== PESSOA GRAMATICAL =====
[1ª/2ª/3ª pessoa com instruções]

===== TÉCNICAS DE COPY =====
Tipo de Hook: [tipo]
Fórmula de Copy: [fórmula]
Clickbait: [SIM/NÃO]

===== REGRAS OBRIGATÓRIAS =====
1. MÁXIMO [N] CARACTERES por slide (OBRIGATÓRIO)
2. Cada slide deve ser IMPACTANTE e fazer o leitor querer ver o próximo
3. O PRIMEIRO slide é o HOOK - deve PARAR o scroll imediatamente
4. O ÚLTIMO slide é o CTA - deve ter uma ação CLARA
5. Use QUEBRAS de padrão para manter atenção
6. Evite clichês e frases genéricas
7. Seja ESPECÍFICO, não genérico

===== FORMATO DE RESPOSTA =====
Retorne APENAS um JSON válido:
{
  "title": "título interno do conteúdo",
  "description": "legenda completa para o post (pode ser longa, com emojis e hashtags)",
  "hook": "a frase de gancho do primeiro slide",
  "slides": [
    {"order": 1, "text": "texto do slide 1 - O HOOK"},
    {"order": 2, "text": "texto do slide 2"},
    ...
  ]
}

Lembre-se: Você é um copywriter PROFISSIONAL. Cada palavra conta. Cada slide deve ser IRRESISTÍVEL.
```

---

## IA-10: Geração de Conteúdo Soft-Sell

**Localização:** `server/routers.ts` linha 1488  
**Função:** `influencers.generateContent` (modo soft-sell)  
**Quando é chamado:** Quando usuário gera conteúdo de influenciador SEM produto

### O que faz
Gera conteúdo soft-sell (venda sutil/autoridade) para influenciador virtual.

### Entrada
- `influencerName`: Nome do influenciador
- `influencerDescription`: Descrição do influenciador
- `influencerNiche`: Nicho do influenciador
- `template`: Template selecionado
- `product`: Produto/serviço (opcional)

### Saída (JSON)
```json
{
  "title": "título do conteúdo",
  "description": "legenda",
  "hook": "gancho",
  "slides": [
    {"order": 1, "text": "texto"}
  ]
}
```

### Prompt Completo
```
Você é um especialista em marketing de influência e soft sell.
Crie conteúdo para o influenciador virtual [nome].
Descrição: [descrição]
Nicho: [nicho]
Template: [template]
[Produto/Serviço: [produto] (se houver)]

O conteúdo deve:
- Parecer natural e autêntico
- Não ser vendedor demais
- Integrar o produto/serviço de forma orgânica (se houver)
- Manter a personalidade do influenciador
- Gerar autoridade e conexão com o público

Retorne um JSON com:
{
  "title": "título do conteúdo",
  "description": "legenda completa",
  "hook": "gancho inicial",
  "slides": [
    {"order": 1, "text": "texto do slide"},
    ...
  ]
}
```

---

## IA-11: Geração de Abordagens de Produto

**Localização:** `server/routers.ts` linha 1762  
**Função:** `influencers.products.generateApproaches`  
**Quando é chamado:** Após cadastrar um produto do influenciador

### O que faz
Gera 5 abordagens criativas para divulgar um produto.

### Entrada
- `productName`: Nome do produto
- `productDescription`: Descrição do produto
- `influencerNiche`: Nicho do influenciador

### Saída (JSON com schema)
```json
{
  "approaches": [
    "Abordagem 1",
    "Abordagem 2",
    "Abordagem 3",
    "Abordagem 4",
    "Abordagem 5"
  ]
}
```

### Prompt Completo
```
Você é um especialista em marketing de influência.

Gere 5 abordagens CRIATIVAS e DIFERENTES para divulgar o seguinte produto:

Produto: [nome]
Descrição: [descrição]
Nicho do Influenciador: [nicho]

Cada abordagem deve:
- Ser ÚNICA e DIFERENTE das outras
- Conectar o produto com o nicho do influenciador
- Ser aplicável em conteúdo de redes sociais
- Focar em um ângulo específico (benefício, transformação, problema resolvido, etc.)

Exemplos de abordagens:
- "Antes vs Depois: A transformação que [produto] proporcionou"
- "5 erros que você comete sem [produto]"
- "O segredo dos profissionais: Como [produto] mudou minha rotina"
- "Mito vs Verdade sobre [produto]"
- "Por que [produto] é essencial para [público-alvo]"

Retorne APENAS um array JSON com as abordagens:
["Abordagem 1", "Abordagem 2", "Abordagem 3", "Abordagem 4", "Abordagem 5"]
```

---

## IA-12: Geração de Conteúdo de Produto

**Localização:** `server/routers.ts` linha 1885  
**Função:** `influencers.generateContent` (modo produto)  
**Quando é chamado:** Quando usuário gera conteúdo de produto no Hub de Geração

### O que faz
Gera conteúdo para divulgar produto do influenciador, podendo combinar com trend/viral/assunto.

### Entrada
- `influencerName`, `influencerDescription`, `influencerNiche`
- `productName`, `selectedApproaches`
- `contextInfo`: Informações de trend/viral/assunto (opcional)

### Saída (JSON)
```json
{
  "title": "título",
  "description": "legenda",
  "hook": "gancho",
  "slides": [...]
}
```

### Prompt Completo
```
Você é um especialista em marketing de influência e soft sell.
Crie conteúdo para o influenciador virtual [nome].
Descrição: [descrição]
Nicho: [nicho]
Produto/Serviço: [produto]
Abordagens: [abordagens selecionadas]
[Contexto: [trend/viral/assunto] (se houver)]

O conteúdo deve:
- Divulgar o produto de forma natural
- Usar as abordagens selecionadas
- Conectar com o contexto fornecido (se houver)
- Manter autenticidade do influenciador
- Gerar desejo e ação

Retorne um JSON com:
{
  "title": "título",
  "description": "legenda",
  "hook": "gancho",
  "slides": [...]
}
```

---

## IA-13: Coleta de Trends

**Localização:** `server/routers.ts` linha 1985  
**Função:** `trends.collect`  
**Quando é chamado:** Quando usuário clica em "Atualizar Trends" (ou ao abrir aba pela primeira vez)

### O que faz
Busca 15 tendências atuais do TikTok e Google Trends Brasil.

### Entrada
- `query`: Query de busca (opcional)

### Saída (JSON com schema)
```json
{
  "trends": [
    {
      "title": "título",
      "description": "descrição",
      "platform": "tiktok" | "google",
      "category": "categoria",
      "tags": ["tags"]
    }
  ]
}
```

### Prompt Completo
```
Você é um especialista em tendências virais do Brasil.
Gere tendências REALISTAS e ATUAIS baseadas no seu conhecimento.
Para cada tendência, analise e classifique.

[Query: [query]] (se houver)
[Ou: Liste 15 tendências do TikTok Brasil em dezembro de 2024.
Inclua: sons virais, hashtags, desafios, danças, formatos de vídeo, trends de humor.]

Retorne um JSON com:
{
  "trends": [
    {
      "title": "título da trend",
      "description": "descrição detalhada",
      "platform": "tiktok" ou "google",
      "category": "categoria (Moda, Tech, Fitness, etc)",
      "tags": ["tags relevantes"]
    }
  ]
}

Gere exatamente 15 tendências atuais e relevantes para o Brasil.
```

---

## IA-14: Coleta de Virais

**Localização:** `server/routers.ts` linha 2073  
**Função:** `virals.collect`  
**Quando é chamado:** Quando usuário clica em "Coletar Virais"

### O que faz
Identifica 12 tipos de conteúdo viral que estão em alta.

### Entrada
- `query`: Query de busca (opcional)

### Saída (JSON com schema)
```json
{
  "virals": [
    {
      "title": "título",
      "description": "descrição",
      "category": "categoria",
      "suggestedNiches": ["nichos"],
      "suggestedAngles": ["ângulos"]
    }
  ]
}
```

### Prompt Completo
```
Você é um especialista em conteúdo viral da internet.
Gere conteúdos virais REALISTAS baseados em padrões atuais.
Para cada viral, sugira nichos que podem adaptar e ângulos de abordagem.

[Query: [query]] (se houver)
[Ou: Identifique 12 tipos de conteúdo viral que estão em alta em dezembro de 2024.
Inclua: memes, histórias engraçadas, vídeos satisfatórios, discussões populares, conteúdo brasileiro.]

Retorne um JSON com:
{
  "virals": [
    {
      "title": "título do viral",
      "description": "descrição do tipo de conteúdo",
      "category": "categoria (Humor, Inspiração, Fails, etc)",
      "suggestedNiches": ["nichos que podem adaptar"],
      "suggestedAngles": ["ângulos de adaptação"]
    }
  ]
}

Gere exatamente 12 conteúdos virais atuais.
```

---

## IA-15: Busca de Notícias

**Localização:** `server/routers.ts` linha 2149  
**Função:** `subjects.search`  
**Quando é chamado:** Quando usuário busca notícias na aba Assuntos

### O que faz
Busca 10 notícias atuais sobre um assunto específico.

### Entrada
- `query`: Termo de busca

### Saída (JSON com schema)
```json
{
  "news": [
    {
      "title": "título",
      "description": "descrição",
      "source": "fonte",
      "date": "data",
      "category": "categoria"
    }
  ]
}
```

### Prompt Completo
```
Você é um especialista em encontrar notícias relevantes e atuais do Brasil.
Gere 10 notícias REALISTAS e ATUAIS sobre o assunto solicitado.
Para cada notícia, forneça título, descrição resumida, fonte e data de publicação.

Busque 10 notícias recentes (dezembro 2024) sobre: [query]

Retorne um JSON com:
{
  "news": [
    {
      "title": "título da notícia",
      "description": "resumo da notícia (2-3 frases)",
      "source": "fonte (ex: G1, Folha, UOL, Valor Econômico)",
      "date": "data de publicação (formato: YYYY-MM-DD)",
      "category": "categoria (Política, Economia, Tecnologia, Saúde, etc)"
    }
  ]
}

Gere exatamente 10 notícias relevantes e atuais.
```

---

## IA-16: Geração de Conteúdo com Notícia

**Localização:** `server/routers.ts` linha 2741  
**Função:** `topics.generateContentFromNews`  
**Quando é chamado:** Quando usuário gera conteúdo a partir de uma notícia (em Projetos)

### O que faz
Gera conteúdo conectando notícia com nicho do projeto.

### Entrada
- `newsTitle`, `newsDescription`, `newsSource`
- `projectNiche`
- `template`, `objective`

### Saída (JSON)
```json
{
  "title": "título",
  "description": "legenda",
  "hook": "gancho",
  "slides": [...]
}
```

### Prompt Completo
```
Você é um especialista em criar conteúdo viral para redes sociais conectando notícias atuais com nichos específicos.

NOTÍCIA:
Título: [título]
Descrição: [descrição]
Fonte: [fonte]

NICHO DO PROJETO: [nicho]

TEMPLATE: [template]
OBJETIVO: [objetivo]

Sua missão é criar um carrossel que:
- Conecte a notícia com o nicho de forma NATURAL
- Mostre como a notícia IMPACTA o público do nicho
- Gere CURIOSIDADE e ENGAJAMENTO
- Mantenha RELEVÂNCIA para o nicho

Retorne APENAS um JSON válido:
{
  "title": "título interno",
  "description": "legenda completa",
  "hook": "gancho do primeiro slide",
  "slides": [
    {"order": 1, "text": "texto do slide 1"},
    ...
  ]
}
```

---

## Resumo Estatístico

**Total de Intervenções de IA:** 16

**Por Categoria:**
- Análise e Extração: 4 (IA-1, IA-2, IA-3, IA-6)
- Geração de Personas e Dores: 4 (IA-4, IA-5, IA-7, IA-8)
- Geração de Conteúdo: 5 (IA-9, IA-10, IA-11, IA-12, IA-16)
- Coleta de Dados Externos: 3 (IA-13, IA-14, IA-15)

**Por Fluxo:**
- Projetos: 9 IAs
- Influenciadores: 5 IAs
- Trends/Virais/Notícias: 3 IAs (compartilhadas entre fluxos)

**Modelos de Resposta:**
- JSON estruturado: 16/16 (100%)
- Com schema validation: 10/16 (62.5%)
- Sem schema: 6/16 (37.5%)
