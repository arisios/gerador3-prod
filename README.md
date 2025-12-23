# Creative Loop AI

**Plataforma completa para criação automatizada de conteúdo para influenciadores virtuais usando IA generativa**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-blue.svg)](https://trpc.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Visão Geral

O **Creative Loop AI** é uma plataforma web que revoluciona a criação de conteúdo para influenciadores digitais. Utilizando inteligência artificial generativa, o sistema produz carrosséis completos para Instagram e TikTok em minutos, combinando geração de texto estruturado com imagens fotorrealistas que mantêm a identidade visual do influenciador.

A plataforma resolve o desafio de produção em escala de conteúdo autêntico, permitindo que criadores gerem posts completos mantendo consistência visual e narrativa alinhada com a persona do influenciador.

### ✨ Principais Funcionalidades

**Gestão de Influenciadores Virtuais** - Crie e gerencie múltiplos influenciadores, cada um com identidade própria, nicho de atuação, e características visuais consistentes. O sistema utiliza foto de referência para manter rosto, tatuagens e tipo corporal em todas as gerações.

**Biblioteca de 20 Templates Narrativos** - Escolha entre estruturas otimizadas como Rotina do Dia-a-Dia, Antes e Depois, Lista/Dicas, Storytelling, Passo a Passo, Mitos e Verdades, e muitos outros. Cada template possui instruções específicas que guiam a IA na geração de conteúdo coerente.

**Geração Inteligente de Imagens** - Imagens fotorrealistas em estilo POV (selfie) que mantêm características físicas permanentes (rosto, tatuagens, corpo, cabelo) enquanto variam roupas de acordo com contexto da cena. Sistema previne texto sobreposto indesejado e garante tatuagens apareçam apenas em pele exposta.

**Fontes de Inspiração Múltiplas** - Combine produtos, trends, virais e assuntos para criar conteúdo relevante. O sistema usa trends como tema principal e insere produtos naturalmente, respeitando hierarquia correta de foco.

---

## 🚀 Stack Tecnológica

O Creative Loop foi desenvolvido com stack moderna que garante performance, escalabilidade e manutenibilidade.

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **Frontend** | React | 19 | Interface responsiva com hooks modernos |
| **Estilização** | Tailwind CSS | 4 | Design system com tokens customizados |
| **Backend** | Express + tRPC | 4 + 11 | API type-safe end-to-end |
| **Banco de Dados** | MySQL/TiDB | - | Persistência com suporte a escala |
| **ORM** | Drizzle | 0.44.6 | Schema type-safe e migrations |
| **Autenticação** | Manus OAuth | - | Login integrado com JWT |
| **IA Generativa** | Manus Forge API | - | Geração de texto (LLM) e imagens |
| **Armazenamento** | S3 | - | Storage de imagens e referências |

### Arquitetura Type-Safe

A escolha do **tRPC** como camada de comunicação elimina necessidade de manter contratos de API separados. Tipos TypeScript fluem automaticamente do servidor para o cliente, reduzindo drasticamente bugs de integração e acelerando desenvolvimento de novas funcionalidades.

---

## 📦 Instalação e Configuração

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** 22.13.0 ou superior
- **pnpm** 9.x ou superior
- **MySQL** 8.0 ou TiDB compatível
- Conta na plataforma **Manus** para APIs de IA

### Instalação

```bash
# Clone o repositório
git clone https://github.com/arisios/creative-loop-ai.git
cd creative-loop-ai

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais
```

### Configuração do Banco de Dados

```bash
# Execute migrations
pnpm db:push

# Verifique conexão
pnpm db:studio
```

### Variáveis de Ambiente Essenciais

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação Manus OAuth
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-app-id

# APIs de IA (Manus Forge)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key

# Proprietário
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name
```

### Executar em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Servidor estará disponível em http://localhost:3000
```

### Build para Produção

```bash
# Gerar build otimizado
pnpm build

# Executar build de produção
pnpm start
```

---

## 🎯 Como Usar

### 1. Criar Influenciador

Acesse a seção **Influenciadores** e clique em **Novo Influenciador**. Preencha:

- **Nome:** Nome artístico do influenciador (ex: "Felipe Nata")
- **Nicho:** Área de atuação (fitness, tech, lifestyle, food)
- **Foto de Referência:** Upload de foto frontal em boa resolução
- **Descrição:** Personalidade, valores e estilo de comunicação

Configure também cliente ideal e dores que o influenciador aborda para refinar geração de conteúdo.

### 2. Cadastrar Produtos (Opcional)

Se o influenciador promoverá produtos, cadastre-os na aba **Produtos** do perfil. Para cada produto:

- Nome e descrição com diferenciais
- Cliente ideal que se beneficia
- Abordagens de venda (hard sell, soft sell, educacional, storytelling)
- Upload de 1-5 fotos de referência em diferentes ângulos

### 3. Cadastrar Trends/Virais/Assuntos (Opcional)

Mantenha o influenciador relevante cadastrando fontes de inspiração:

- **Trends:** Hashtags, desafios, temas populares atuais
- **Virais:** Conteúdos específicos que viralizaram e podem ser adaptados
- **Assuntos:** Notícias ou temas para posicionar como especialista

### 4. Gerar Carrossel

No dashboard, selecione o influenciador e clique em **Gerar Conteúdo**:

**Passo 1:** Escolha tipo (Carrossel) e template narrativo (ex: "Rotina do Dia-a-Dia")

**Passo 2:** Selecione fonte de inspiração:
- **Produtos:** Conteúdo promocional sobre produto específico
- **Trends:** Adapta trend para voz do influenciador
- **Virais:** Recria viral mantendo identidade
- **Assuntos:** Posiciona como comentarista/especialista

**Passo 3:** Clique em **Gerar Conteúdo** e aguarde 30-120 segundos

O sistema gera estrutura de texto (título, descrição, hook, slides) e imagem para cada slide, salvando conteúdo completo no banco de dados.

### 5. Revisar e Ajustar

Na tela de visualização você pode:

- Editar texto de cada slide individualmente
- Regenerar imagem de slide específico
- Reordenar slides arrastando
- Excluir slides desnecessários
- Adicionar novos slides manualmente

Quando satisfeito, marque como **Pronto** ou **Publicado**.

---

## 🏗️ Estrutura do Projeto

```
creative-loop-ai/
├── client/                    # Frontend React
│   ├── public/               # Assets estáticos
│   └── src/
│       ├── pages/            # Componentes de página
│       ├── components/       # Componentes reutilizáveis + shadcn/ui
│       ├── contexts/         # React contexts
│       ├── hooks/            # Custom hooks
│       ├── lib/
│       │   └── trpc.ts       # Cliente tRPC
│       ├── App.tsx           # Rotas e layout
│       ├── main.tsx          # Providers
│       └── index.css         # Estilos globais + tokens
│
├── server/                    # Backend Node.js
│   ├── _core/                # Infraestrutura (OAuth, LLM, imagens)
│   ├── db.ts                 # Query helpers
│   ├── routers.ts            # tRPC procedures
│   └── *.test.ts             # Testes Vitest
│
├── drizzle/                   # Schema e migrations
│   ├── schema.ts             # Definição de tabelas
│   └── *.sql                 # Arquivos de migração
│
├── storage/                   # Helpers S3
├── shared/                    # Constantes e tipos compartilhados
└── package.json              # Dependências e scripts
```

### Arquivos Principais

**`server/routers.ts`** - Define todas as procedures tRPC (auth, influencer, product, content, slide, trend, viral, news). Cada procedure valida input com Zod, executa lógica de negócio, e retorna dados tipados.

**`drizzle/schema.ts`** - Schema do banco de dados com 6 entidades principais: influencers, products, influencerContents, influencerSlides, trends, virals. Utiliza Drizzle ORM para type-safety e migrations automáticas.

**`client/src/lib/trpc.ts`** - Cliente tRPC que conecta frontend ao backend. Queries e mutations são automaticamente tipadas, eliminando necessidade de manter contratos separados.

**`server/_core/llm.ts`** - Helper para geração de texto via LLM. Suporta structured outputs com JSON Schema para garantir formato consistente de respostas.

**`server/_core/imageGeneration.ts`** - Helper para geração de imagens fotorrealistas. Aceita prompt e imagens de referência (influenciador + produto) para manter consistência visual.

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm db:push          # Aplica migrations no banco de dados
pnpm db:studio        # Abre interface visual do banco

# Testes
pnpm test             # Executa testes Vitest
pnpm test:watch       # Executa testes em modo watch

# Build e Produção
pnpm build            # Gera build otimizado
pnpm start            # Executa build de produção
pnpm preview          # Preview do build localmente

# Qualidade de Código
pnpm lint             # Executa ESLint
pnpm type-check       # Verifica tipos TypeScript
```

---

## 🎨 Customização de Design

### Tokens de Design

O sistema utiliza CSS variables para manter consistência visual. Edite `client/src/index.css` para customizar:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    /* ... outros tokens ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... tokens para tema escuro ... */
  }
}
```

### Componentes Shadcn/ui

O projeto utiliza componentes shadcn/ui para interface consistente. Componentes estão em `client/src/components/ui/` e podem ser customizados individualmente.

Para adicionar novos componentes:

```bash
pnpx shadcn-ui@latest add button
pnpx shadcn-ui@latest add dialog
pnpx shadcn-ui@latest add dropdown-menu
```

---

## 🔐 Segurança e Privacidade

### Autenticação e Autorização

O sistema utiliza **Manus OAuth** para autenticação, garantindo que senhas nunca são armazenadas localmente. Tokens JWT mantêm sessões seguras com expiração automática.

Todas as procedures do backend verificam autenticação via `protectedProcedure`, impedindo acesso não autorizado. Queries filtram dados por `userId`, garantindo isolamento entre usuários.

### Proteção de Dados

**Imagens e conteúdos** são armazenados em S3 com URLs assinadas que expiram, impedindo acesso não autorizado a conteúdo privado.

**Dados sensíveis** como descrições de influenciadores e produtos são criptografados em trânsito (HTTPS) e em repouso (database encryption at rest).

### Conformidade LGPD

O sistema permite que usuários **exportem todos os seus dados** em formato JSON (direito de portabilidade) e **deletem completamente sua conta** incluindo todos os conteúdos gerados (direito ao esquecimento).

Logs de geração de conteúdo são mantidos por **90 dias** para troubleshooting e depois automaticamente deletados.

### Rate Limiting

Procedures de geração de conteúdo implementam rate limiting para prevenir abuse. Cada usuário pode gerar no máximo **50 conteúdos por dia**, protegendo infraestrutura de IA contra uso excessivo.

Uploads de imagens são limitados a **10MB** e validados quanto a tipo de arquivo (apenas JPEG/PNG aceitos).

---

## 📊 Modelo de Dados

### Entidades Principais

**Influenciadores (`influencers`)** - Personas virtuais com características físicas (foto de referência, descrição), nicho de atuação, configurações de voz e tom de comunicação.

**Produtos (`influencerProducts`)** - Itens que o influenciador pode promover, incluindo nome, descrição, cliente ideal, e múltiplas abordagens de venda. Suporta upload de múltiplas fotos de referência.

**Conteúdos (`influencerContents`)** - Carrosséis gerados pelo sistema, vinculados a influenciador, com tipo (carrossel/imagem/vídeo), template narrativo, fonte de inspiração (produto/trend/viral/assunto), e status (rascunho/gerando/pronto/publicado).

**Slides (`influencerSlides`)** - Páginas individuais de cada carrossel, contendo texto, ordem de exibição, URL da imagem gerada, e configurações de design.

**Trends (`trends`)** - Tendências atuais (hashtags, desafios, temas populares) que podem ser adaptadas para voz do influenciador.

**Virais (`virals`)** - Conteúdos específicos que viralizaram e podem ser recriados mantendo identidade do influenciador.

### Relacionamentos

```
users (1) ──── (N) influencers
influencers (1) ──── (N) influencerProducts
influencers (1) ──── (N) influencerContents
influencerProducts (1) ──── (N) influencerProductReferences
influencerContents (1) ──── (N) influencerSlides
users (1) ──── (N) trends
users (1) ──── (N) virals
```

---

## 🚦 Roadmap

### Versão Atual (v1.0)

- ✅ Gestão completa de influenciadores virtuais
- ✅ Geração de carrosséis com 20 templates narrativos
- ✅ Imagens fotorrealistas com consistência visual
- ✅ Combinação de produtos + trends/virais/assuntos
- ✅ Variação de roupas mantendo identidade
- ✅ Prevenção de texto sobreposto em imagens

### Próximas Versões

**v1.1 (Curto Prazo - 1-2 meses)**
- Regeneração individual de imagens
- Preview grid de imagens antes de finalizar
- Salvamento de rascunhos
- Seletor de estilo de roupa

**v1.2 (Médio Prazo - 3-6 meses)**
- Editor visual de slides drag-and-drop
- Biblioteca de paletas de cores
- Agendamento de publicação (Instagram/TikTok)
- Analytics de performance

**v2.0 (Longo Prazo - 6-12 meses)**
- Geração de vídeos curtos (Reels/TikToks)
- Vozes sintéticas personalizadas
- Marketplace de templates
- IA de recomendação baseada em performance

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

**Código** - Siga convenções TypeScript e ESLint configuradas. Use tipos explícitos e evite `any`.

**Commits** - Use mensagens descritivas no formato: `tipo(escopo): descrição`. Exemplos: `feat(content): add video generation`, `fix(images): prevent text overlay`.

**Testes** - Adicione testes Vitest para novas funcionalidades. Execute `pnpm test` antes de criar PR.

**Documentação** - Atualize README.md e comentários de código quando necessário.

---

## 📝 Changelog

### v1.0.0 (22/12/2024)

**Lançamento Inicial**

- Sistema completo de gestão de influenciadores virtuais
- Geração de carrosséis com 20 templates narrativos
- Integração com APIs de IA para texto e imagens
- Autenticação via Manus OAuth
- Banco de dados MySQL/TiDB com Drizzle ORM

**Correções Críticas**

- Campo `source` obrigatório em `influencerContents`
- Validação de produto null ao gerar conteúdo
- Prompt reforçado para prevenir texto em imagens
- Variação de roupas mantendo características físicas
- Trends/virais/assuntos agora são foco principal do conteúdo

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

**Arísio Nogueira dos Santos** - Desenvolvimento e Arquitetura

**Manus AI** - Assistência em desenvolvimento e documentação

---

## 🙏 Agradecimentos

- **Manus Platform** - Infraestrutura de IA e autenticação
- **Shadcn/ui** - Componentes de interface
- **tRPC** - Type-safe API framework
- **Drizzle ORM** - Type-safe database toolkit

---

## 📞 Suporte

Para questões técnicas, bugs ou solicitações de features:

- **Email:** help@manus.im
- **Portal de Suporte:** https://help.manus.im
- **GitHub Issues:** https://github.com/arisios/creative-loop-ai/issues

---

**Desenvolvido com ❤️ usando IA generativa**
