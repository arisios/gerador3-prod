# Gerador 3 - TODO

## Estrutura Base
- [x] Configurar tema visual (cores roxo/escuro, fonte moderna)
- [x] Configurar index.css com variáveis de tema
- [x] Configurar App.tsx com rotas

## Banco de Dados
- [x] Schema: users, projects, idealClients, pains, contents, slides, influencers, trends, virals
- [x] Funções de DB para todas as entidades

## Templates de Copywriting
- [x] 19 templates de carrossel
- [x] 15 templates de imagem única
- [x] 12 templates de vídeo
- [x] 8 templates de soft sell (influenciadores)
- [x] 8 tipos de hooks virais
- [x] Fórmulas: AIDA, PAS, BAB, FAB, 4U's

## Templates Visuais (estilo @brandsdecoded__)
- [x] Lifestyle Editorial
- [x] Celebridade/Autoridade
- [x] Provocativo/Pergunta
- [x] Tech/Ciência
- [x] Case de Marca
- [x] Dados/Mercado
- [x] Tendência/Gen Z
- [x] Cultura Pop
- [x] Split Screen
- [x] Minimalista
- [x] Full Bleed
- [x] Card/Moldura

## API Routes
- [x] Projetos: create, list, get, analyzeSource, analyzePains, savePains
- [x] Conteúdo: generate, list, get, update, delete
- [x] Imagens: generate, regenerate, proxy
- [x] Influenciadores: create, createByPhoto, list, get, generateContent
- [x] Trends: collect (AI-powered), list, getAlerts - CORRIGIDO: usa response_format para JSON válido
- [x] Virals: collect (AI-powered), list - CORRIGIDO: usa response_format para JSON válido

## Frontend - Páginas
- [x] Home (landing)
- [x] Dashboard
- [x] ProjectCreate (wizard 4 etapas)
- [x] ProjectDetail
- [x] ContentEdit (edição de conteúdo)
- [x] ImageEdit
- [x] VideoEdit
- [x] History
- [x] Influencers
- [x] InfluencerCreate
- [x] InfluencerCreateByPhoto
- [x] InfluencerDetail
- [x] InfluencerContentCreate
- [x] InfluencerContentEdit
- [x] Trends
- [x] Virals

## Componentes
- [x] SlideComposer (3 abas: Básico, Cores, Avançado)
- [ ] SlideTemplatePreview
- [ ] ImageLightbox
- [ ] ImageLightboxWithEdit
- [ ] QuantitySelector
- [ ] PromptEditorModal

## Sistema de Download
- [x] Proxy de imagens (CORS)
- [x] Canvas 1080x1350
- [x] Download com texto (sombra, overlay)
- [x] Download sem texto
- [x] Download em lote

## Sistema de Padrão
- [x] Salvar estilo no localStorage
- [x] Carregar padrão salvo
- [x] Aplicar automaticamente

## Configurações de Batch
- [ ] Tipo: carrossel, imagem, vídeo
- [ ] Template selecionável
- [ ] Quantidade de posts
- [ ] Clickbait on/off
- [ ] Objetivo: venda, autoridade, crescimento
- [ ] Pessoa gramatical: 1ª, 2ª, 3ª

## Influenciadores Virtuais - Consistência Física
- [x] Criação por Descrição: gerar 3 fotos para escolha
- [x] Criação por Descrição: interface para escolher 1 das 3 fotos
- [x] Criação por Foto: upload de foto como referência
- [x] Salvar referenceImageUrl no influenciador
- [x] Geração de conteúdo: usar referenceImageUrl como originalImages
- [x] Garantir consistência física em todas as gerações

## Testes Realizados (18/12/2024)
- [x] Download Com Texto - funcionando (2.1MB, 1080x1350)
- [x] Download Sem Texto - funcionando
- [x] Consistência física de influenciadores - funcionando
- [x] Geração de 3 fotos por descrição - funcionando
- [x] Seleção de foto de referência - funcionando
- [x] Geração de imagem usando referência - funcionando
- [x] Trends Google e TikTok - funcionando (15 trends cada)
- [x] Virais ViralHog - funcionando (12 virais)
- [x] Criação de projeto - funcionando
- [x] Geração de conteúdo para projeto - funcionando

## Regras Gerais para Imagens Geradas por IA
- [x] Componente ImageLightbox: abre imagem em tela cheia ao clicar
- [x] Botão Regenerar: gera nova imagem com mesmo prompt ou editando
- [x] Botão Excluir: deleta a imagem
- [x] Botão Baixar: download da imagem
- [x] Salvar imagem no banco de referência correspondente
- [x] Prompt com instrução "imagem real sem texto" (regra primordial)
- [x] Mostrar prompt usado como orientação para upload no slide
- [x] Integrar lightbox em ContentEdit
- [x] Integrar lightbox em InfluencerContentEdit
- [x] Integrar lightbox em InfluencerCreate (fotos de referência)

## Bugs Reportados (18/12/2024)
- [x] Erro "Cannot update a component (Home)" - setState durante render - CORRIGIDO: useEffect
- [x] Download de todos não funciona no mobile - mudar de ZIP para PNG sequencial - CORRIGIDO
- [x] App não é PWA - configurar manifest, service worker, icons - CORRIGIDO
- [x] Interface não otimizada para mobile - CORRIGIDO: CSS mobile-first
- [x] Bug: Imagem fica esticada no download - corrigido com cover ratio
- [x] Bug: Prompt de influenciador deve gerar fotos em primeira pessoa (selfies reais) - CORRIGIDO

## Novo Fluxo - Implementação (18/12/2024)

### Regras Gerais
- [ ] Todo conteúdo pode ser editado
- [ ] Toda imagem tem prompt editável como referência + botão salvar

### Fluxo A - Projeto
- [x] Escolher fonte: Dores OU Viral OU Trends
- [x] Seleção múltipla de dores/trends/virais
- [x] Escolher tipo de conteúdo + quantidade para cada seleção
- [x] Exemplo: Dor 1 → Carrossel Antes/Depois → 5 conteúdos

### Fluxo B - Influenciador
- [x] Após criar influenciador, gerar automaticamente fotos de perfil
- [x] Foto de perfil para rede social
- [x] Foto "antes" e "atual" (transformação)
- [x] Outras fotos para montar o perfil
- [x] Conteúdos: templates padrão + dores + trends + virais
- [x] Edição de conteúdo igual aos projetos

## Fluxo de Criação por Link
- [x] Opção de entrada por link (Instagram, TikTok, YouTube, site)
- [x] IA analisa o link profundamente
- [x] IA retorna lista de possíveis clientes ideais
- [x] Usuário seleciona quais clientes são ideais
- [x] IA analisa novamente com base nos clientes selecionados
- [x] IA gera 3 categorias de dores:
  - [x] Dores Principais (mais evidentes)
  - [x] Dores Secundárias (importantes mas menos óbvias)
  - [x] Dores Inexploradas (pouco conteúdo, oportunidade)

## Simplificação do Dashboard (18/12/2024)
- [x] Remover stats, trends, virais, histórico do Dashboard
- [x] Manter apenas 2 opções: Projetos e Influenciadores
- [x] Projetos → Link ou Descrição
- [x] Influenciadores → Foto ou Descrição

## Simplificação do Fluxo por Link (18/12/2024)
- [x] Remover campo de nome do projeto no fluxo por link
- [x] Usar o link como nome do projeto automaticamente (extrai domínio ou @username)

## Melhorias de Imagem (18/12/2024)
- [x] Botão "Gerar Todas as Imagens" no conteúdo (carrossel)
- [x] Prompt visível e editável ao clicar na imagem
- [x] Prompt serve como referência para upload ou edição
- [x] Opção de upload de imagem própria

## Upload de Foto no Influenciador (18/12/2024)
- [x] Permitir upload de foto própria na criação de influenciador por foto
- [x] Usar a foto como referência visual para a IA
- [x] Rota genérica de upload de imagem para S3

## Templates Visuais BrandsDecoded (18/12/2024)
- [x] Criar componente SlidePreview que aplica os 12 templates visuais
- [x] Permitir selecionar template visual ao criar conteúdo
- [x] Aplicar estilos (overlay, posição do texto, cores neon) automaticamente
- [x] Preview em tempo real do template selecionado
- [x] Seletor de cor de destaque (8 cores neon)

## Mais Templates e Template Automático (18/12/2024)
- [x] Adicionar mais variedades de templates visuais (24 templates)
- [x] Implementar seleção automática de template com IA
- [x] IA analisa texto/conteúdo e escolhe template adequado
- [x] Opção "Automático" no seletor de templates
- [x] Filtro por categoria de template
- [x] Botão "Ver mais" para expandir lista de templates

## Templates Visuais Completos (18/12/2024)
- [x] Criar 20+ templates com layouts profissionais completos (24 templates)
- [x] Layouts variados: split horizontal, split vertical, card, full bleed, minimal, bold, editorial
- [x] Design diagramado com posicionamento fixo de texto
- [x] Sistema de paleta de cores customizável (12 paletas)
- [x] Kit de marca: upload de logo para incluir nos templates
- [x] Download renderizado em PNG/JPG com template aplicado
- [x] Template automático varia entre slides do carrossel (IA escolhe templates diferentes)

## Extração Automática de Logo (18/12/2024)
- [x] Ao analisar link (Instagram, TikTok, etc.), identificar imagem de perfil
- [x] Usar IA para analisar se é logo ou foto pessoal
- [x] Se for logo, indicar detecção e razão
- [x] Mostrar notificação de logo detectada no fluxo de criação
- [x] Indicar no step final que logo foi detectada para configurar no kit de marca

## Refatoração de Templates Visuais (18/12/2024)
- [x] Cada template com textStyle completo (posição, alinhamento, fonte, cor, sombra, área máxima)
- [x] SlideRenderer com moldura/quadro real (CSS object-fit: cover, overflow: hidden)
- [x] Imagem fica contida no quadro, pode ser ajustada para enquadrar
- [x] Salvar designTemplateId por slide no banco de dados
- [x] Template não muda ao navegar entre slides
- [x] Reforçar prompt: imagens SEM TEXTO, apenas visual (6 regras obrigatórias)
- [x] Corrigir bug do texto duplicado - verificado e não há duplicação no código
- [x] Formatação de texto automática baseada no template selecionado

## Correção de Variedade de Templates (18/12/2024)
- [x] Verificar IDs de templates no fallback da rota selectVariedTemplates
- [x] Adicionar botão "Automático para Todo Carrossel" no ContentEdit
- [x] Garantir carregamento de designTemplateId e colorPaletteId por slide
- [x] Aplicar cores da paleta selecionada no SlideRenderer
- [x] Testar variedade de templates no carrossel

## Refazer Variedade de Templates - SIMPLES (18/12/2024)
- [x] Verificar estado atual do botão "Automático para Todo Carrossel"
- [x] Garantir que cada slide recebe um template DIFERENTE
- [x] Garantir que cada slide recebe uma COR DIFERENTE da paleta
- [x] Testar e validar variedade visual - CONFIRMADO:
  - Slide 1: Full + Texto Central + Roxo Escuro
  - Slide 2: Storytelling + Verde Escuro
  - Slide 3: Declaração Bold + Azul Escuro
  - Cada slide com template E cor diferentes

## Correções Urgentes (18/12/2024)
- [x] Cores não estão aparecendo visualmente diferentes nos slides - CORRIGIDO: paletas agora têm fundos coloridos distintos
- [x] Permitir edição de texto no SlideComposer para templates automáticos - IMPLEMENTADO: botão "Editar Visual" abre o SlideComposer

## Bug SlideComposer (18/12/2024)
- [x] SlideComposer não respeita o layout do template selecionado - CORRIGIDO: agora usa imageFrame do template

## Unificação de Renderização (18/12/2024)
- [x] Criar função downloadSlide unificada no SlideRenderer
- [x] Usar proxy de imagens para evitar erro CORS no download
- [x] Corrigir posicionamento de texto (não cortar no topo)
- [x] Aumentar padding do template Declaração Bold (32px → 48px)
- [x] Garantir que texto nunca comece acima do padding mínimo
- [x] Download do SlideComposer usa função unificada
- [x] Preview, Editor Visual e Download mostram a mesma coisa

## Bug SlideComposer - Edição não funciona (18/12/2024)
- [x] Controles do SlideComposer não atualizam o preview em tempo real - CORRIGIDO: removido useEffect que resetava o estado
- [x] Preview parece uma foto estática que não responde às edições - CORRIGIDO: preview customizado usa localStyle
- [x] Corrigir conexão entre controles e preview - CORRIGIDO: download agora usa customColors
- [x] Download aplica as cores customizadas do editor - CORRIGIDO: passa textColor e backgroundColor para downloadSlide

## Nova Abordagem - Download via html2canvas (18/12/2024)
- [ ] Instalar html2canvas para capturar preview como imagem
- [ ] Modificar SlideComposer para usar html2canvas no download
- [ ] Garantir que download seja exatamente igual ao preview do editor
- [ ] Remover lógica duplicada de renderização

## Salvamento de Edições do SlideComposer (18/12/2024)
- [x] Campo style (JSON) já existe na tabela slides
- [x] Rota slides.update já aceita campo style
- [x] Adicionar botão "Salvar Edição" no SlideComposer - IMPLEMENTADO
- [x] Carregar estilos salvos ao abrir o editor de um slide - IMPLEMENTADO
- [x] Indicador de "mudanças não salvas" com asterisco - IMPLEMENTADO
- [x] Edições persistem ao navegar entre slides - TESTADO E FUNCIONANDO
- [ ] Download em lote usa estilos salvos de cada slide

## Bugs e Melhorias Reportadas (18/12/2024)
- [x] Download não funcionava - CORRIGIDO: usando Canvas API nativo com proxy
- [x] Controles de margem esquerda/direita adicionados
- [x] Layout mais compacto com preview fixo no topo
- [x] Botões de ação fixos na parte inferior

## Bugs e Melhorias Reportadas (18/12/2024)
- [ ] Download do SlideComposer não está funcionando
- [ ] Adicionar controle de margem esquerda no SlideComposer
- [ ] Adicionar controle de margem direita no SlideComposer
- [ ] Controle de padding atual não é suficiente para posicionar texto com precisão

## Melhorias de Layout do SlideComposer (18/12/2024)
- [ ] Compactar controles para ocupar menos espaço
- [ ] Preview fixo ou lado a lado para ver alterações ao vivo
- [ ] Sliders e inputs mais compactos
- [ ] Agrupar controles relacionados

## Bug Crítico - Preview vs Download (18/12/2024)
- [x] Preview no editor mostra layout diferente do download - CORRIGIDO: getTextStyles() agora usa positionY diretamente
- [x] Download veio sem imagem - RESOLVIDO: imagem está aparecendo corretamente
- [x] Unificar renderização para que preview e download sejam idênticos - CORRIGIDO: preview e download usam positionY
- [x] Correção baseada no arquivo enviado pelo usuário: preview usa top: ${positionY}%, download usa textY = height * positionY / 100

## Novo Editor Visual - Drag and Drop (19/12/2024)

### Conceito Base
- [ ] Canvas = Parede (100% da área)
- [ ] Imagem = Quadro móvel (pode ser posicionado e redimensionado)
- [ ] Texto = Post-it móvel (pode ser posicionado e redimensionado)
- [ ] Template define posição INICIAL, mas usuário pode ajustar

### Funcionalidades de Imagem
- [ ] Arrastar imagem com toque/mouse para reposicionar
- [ ] Redimensionar imagem (pinça no mobile, handles no desktop)
- [ ] Posição X e Y ajustáveis (0-100%)
- [ ] Tamanho/altura ajustável (% do canvas)

### Funcionalidades de Texto
- [ ] Arrastar texto com toque/mouse para reposicionar
- [ ] Suporte a MÚLTIPLOS blocos de texto
- [ ] Botão "Adicionar Texto" para criar novos blocos
- [ ] Cada bloco com posição, tamanho e cor independentes
- [ ] Botão deletar para remover blocos de texto

### Interface
- [ ] Botões +/- para ajustar tamanhos (em vez de sliders)
- [ ] Miniaturas de slides menores (ocupar menos espaço)
- [ ] Preview grande e interativo
- [ ] Controles compactos

### Garantia Preview = Download
- [ ] Mesma lógica de renderização para preview e download
- [ ] Posições em % do canvas (não depende de template)
- [ ] Download usa Canvas API com as mesmas coordenadas do preview



## Novo Editor Visual - Drag and Drop (19/12/2024)
- [x] Criar componente SlideComposerNew com drag-and-drop
- [x] Imagem arrastável (toque/mouse)
- [x] Texto arrastável (toque/mouse)
- [x] Suporte a múltiplos blocos de texto
- [x] Botões +/- para tamanho (imagem e texto)
- [ ] Testar em dispositivo real (sandbox tem viewport muito grande)
- [ ] Garantir que preview = download
- [ ] Integrar com sistema de salvamento de estilos

## Bugs Reportados - Editor Novo (19/12/2024)
- [ ] Download vem sem imagem (só fundo roxo com texto) - CORRIGIR
- [ ] Editor de texto muito básico - adicionar todas as opções do editor antigo:
  - [ ] Tamanho da fonte
  - [ ] Cor do texto
  - [ ] Cor de fundo do texto
  - [ ] Alinhamento (esquerda, centro, direita)
  - [ ] Sombra do texto
  - [ ] Espaçamento entre letras
  - [ ] Altura da linha
  - [ ] Borda/contorno
  - [ ] Efeito glow


## Novo Editor Visual - SlideComposerNew (19/12/2024)
- [x] Criar componente SlideComposerNew com drag-and-drop
- [x] Imagem arrastável (toque/mouse)
- [x] Texto arrastável (toque/mouse)
- [x] Suporte a múltiplos blocos de texto
- [x] Botões +/- para tamanho (imagem e texto)
- [x] Download com imagem funcionando
- [x] Todas as opções de edição de texto:
  - [x] Tamanho da fonte
  - [x] Cor do texto
  - [x] Cor de fundo do slide
  - [x] Alinhamento (esquerda, centro, direita)
  - [x] Sombra do texto (cor, blur, offset)
  - [x] Contorno/borda (cor, espessura)
  - [x] Efeito glow (cor, intensidade)
  - [x] Espaçamento entre letras
  - [x] Altura da linha
  - [x] Fundo do texto (cor, padding)
  - [x] Fonte (várias opções)
  - [x] Peso (normal, bold)
- [x] Remover editor antigo (SlideComposer)
- [x] Renomear botão para "Editar Visual"
- [ ] Testar em dispositivo rea- [ ] Salvar posições no banco

## Correção do Botão Baixar (19/12/2024)
- [x] Remover botão "Baixar" do header roxo (usa sistema antigo sem imagem)
- [x] Manter apenas os botões "Com Texto" e "Sem Texto" dentro do editor visualnco de dados


## Bugs Reportados - Editor Novo (19/12/2024) - URGENTE
- [ ] Download continua sem imagem (só fundo roxo + texto) - CORRIGIR URGENTE
- [ ] Layout ruim no mobile: botões de download ocupam espaço dos controles
- [ ] Reorganizar: controles de edição logo abaixo da imagem
- [ ] Mover botões de download para header ou menu separado


## Download Corrigido - Imagem 100% (19/12/2024)
- [x] Download agora mostra imagem cobrindo 100% do canvas (igual ao Gerador 2)
- [x] Texto fica por cima da imagem com sombra para legibilidade
- [x] Layout do editor reorganizado: botões de download no topo, controles abaixo do preview
- [x] Múltiplos blocos de texto suportados
- [x] Drag-and-drop para mover texto
- [x] Todas as opções de edição de texto (tamanho, cor, sombra, contorno, glow, etc.)


## Bugs Reportados - Editor (19/12/2024)
- [x] Texto comprimido no meio - adicionado controles de margem esquerda/direita
- [x] Tela rola junto ao arrastar texto no mobile - bloqueado scroll durante drag com useEffect


## Correção do Proxy de Imagem (19/12/2024)
- [x] Corrigido URL do proxy: /api/image-proxy (não /api/proxy-image)
- [x] Download agora funciona com imagem cobrindo 100% do canvas
- [x] Bloqueio de scroll ao arrastar texto implementado
- [x] Controles de margem esquerda/direita já existem no código


## Imagem como Objeto + Handles de Redimensionamento (19/12/2024)
- [ ] Refatorar imagem como OBJETO (não background)
  - [ ] Imagem tem posição X e Y (pode ser movida)
  - [ ] Imagem tem largura e altura (pode ser redimensionada)
  - [ ] Imagem fica sobre o fundo, não É o fundo
- [ ] Implementar handles de redimensionamento (estilo Canva)
  - [ ] Quadradinhos nos 4 cantos
  - [ ] Arrastar canto = redimensionar mantendo proporção
  - [ ] Arrastar centro = mover objeto
- [ ] Aplicar handles tanto para imagem quanto para texto
- [ ] Atualizar função de download para desenhar imagem como objeto na posição/tamanho definidos
- [ ] Garantir que preview = download (mesma lógica de renderização)


## Imagem como Objeto + Handles de Redimensionamento - IMPLEMENTADO (19/12/2024)
- [x] Refatorar imagem como objeto (não background)
- [x] Posição X e Y ajustáveis para imagem
- [x] Largura e altura ajustáveis para imagem
- [x] Handles nos 4 cantos para redimensionar imagem
- [x] Handles nos 4 cantos para redimensionar texto
- [x] Manter proporção ao redimensionar imagem
- [x] Atualizar função de download para desenhar imagem como objeto
- [x] Bloqueio de scroll ao arrastar elementos
- [x] URL do proxy corrigida: /api/image-proxy
- [x] Download funcionando com imagem como objeto (60% topo, 40% texto)


## Bugs Reportados - Editor (19/12/2024) - Sessão 2
- [ ] Tamanho da fonte inconsistente no download: segunda linha fica maior que as outras
- [ ] Handles não redimensionam o conteúdo (fonte/imagem), só a área/moldura
- [ ] Handles da imagem estão fora da área visível do preview


## Bugs CRÍTICOS - Editor Visual (19/12/2024)
- [ ] Edição de um slide está copiando para todos os outros slides
- [ ] Texto do primeiro slide está sendo repetido em todos os slides
- [ ] Download de todos os slides baixa apenas o primeiro slide repetido
- [ ] Cada slide deve ter estado independente (texto, posição, estilo)


## Editor Estilo Canva Mobile (19/12/2024)
- [ ] Criar componente SlideEditorCanva com layout mobile
- [ ] Canvas em tela cheia (ocupa quase toda a tela)
- [ ] Header fino com navegação (← 1/7 →) + Salvar + Baixar
- [ ] Barra de ferramentas fixa embaixo (ícones: Texto, Imagem, Cor, Fonte)
- [ ] Painel desliza de baixo ao clicar em ferramenta
- [ ] Arrastar imagem e texto (igual Canva)
- [ ] Redimensionar com handles nos cantos
- [ ] Botão Salvar: salva configuração do slide no banco
- [ ] Botão Baixar: menu com opções (este slide, todos, com/sem texto)
- [ ] Baixar Todos: usa configurações salvas de cada slide
- [ ] Carregar configuração salva ao abrir cada slide


## Editor Estilo Canva Mobile - IMPLEMENTADO (19/12/2024)
- [x] Canvas em tela cheia (imagem ocupa quase toda a tela)
- [x] Header fino (navegação + Salvar + Baixar)
- [x] Barra de ferramentas fixa embaixo (ícones: Texto, Imagem, Cor)
- [x] Painel desliza de baixo quando clica num ícone
- [x] Botão Baixar com menu (Este slide com/sem texto, Todos com/sem texto)
- [x] Botão Salvar (salva configuração no banco)
- [x] Navegação entre slides funcionando (cada slide com seu texto/imagem)
- [x] Download funcionando com imagem + texto
- [x] Proxy de imagem para evitar CORS
- [ ] Baixar Todos (usa configurações salvas de cada slide)


## Melhorias Editor Canva Mobile (19/12/2024)
- [ ] Botões Texto/Imagem/Cor acima da imagem (não na frente)
- [ ] Painel de controles sempre embaixo da imagem
- [ ] Adicionar controles completos de texto:
  - [ ] Borda/contorno (cor, espessura)
  - [ ] Sombra (cor, blur, offset)
  - [ ] Glow (cor, intensidade)
  - [ ] Espaçamento entre letras
  - [ ] Altura da linha
- [ ] Remover handles de redimensionar (quadradinhos brancos)
- [ ] Usar controles de tamanho no painel em vez de handles

- [x] Duplo toque no texto para editar diretamente (abre campo de input)

- [x] BUG: Página rolando junto quando arrasta o texto no editor

- [x] BUG: Painel de controles tampando o texto quando abre (não dá pra ver o que está editando) - CORRIGIDO: painel agora fica embaixo
- [x] BUG: Imagem ficou deitada (horizontal) ao invés de vertical 1080x1350 - CORRIGIDO: aspect ratio ajustado


## Download como Print do Preview (19/12/2024)
- [ ] Implementar download usando html2canvas para capturar o preview
- [ ] Escalar a imagem capturada para 1080x1350
- [ ] Garantir que download seja exatamente igual ao preview


## Melhorias de Usabilidade - Interface de Edição (19/12/2024)
- [ ] Reorganizar barra de ferramentas do editor de forma mais intuitiva
- [ ] Simplificar menu de templates para facilitar escolha
- [ ] Remover elementos desnecessários da interface
- [ ] Melhorar feedback visual ao selecionar opções
- [ ] Deixar interface mais minimalista estilo apps de edição (Canva, InShot)
- [ ] Template padrão Full + Texto Central para todos os novos slides


## Sistema de Pagamentos e Créditos (19/12/2024)

### Stripe
- [ ] Integrar Stripe via webdev_add_feature
- [ ] Configurar produtos/preços no Stripe
- [ ] Criar página de compra de créditos
- [ ] Implementar webhook de pagamento confirmado

### Sistema de Créditos
- [ ] Criar tabela de créditos no banco de dados
- [ ] Criar tabela de transações/histórico
- [ ] Implementar lógica de débito de créditos
- [ ] Implementar lógica de crédito após pagamento
- [ ] Mostrar saldo de créditos na interface

### Ken Burns (Vídeo Local)
- [ ] Criar componente de animação Ken Burns
- [ ] Implementar zoom e pan em imagens
- [ ] Gerar vídeo MP4 a partir da animação
- [ ] Integrar com sistema de créditos (1 crédito)

### Multi-API de Imagens
- [ ] Criar estrutura de providers de imagem
- [ ] Integrar OmniInfer API (R$0,009/img - 1 crédito)
- [ ] Integrar Dezgo API (R$0,012/img - 1 crédito)
- [ ] Integrar Replicate API (R$0,019/img - 2 créditos)
- [ ] Integrar Runware API (R$0,020/img - 2 créditos)
- [ ] Manter Manus como opção (R$0,12/img - 2 créditos)
- [ ] Interface para usuário escolher provider
- [ ] Consumir créditos conforme provider escolhido

### Multi-API de Vídeos
- [ ] Criar estrutura de providers de vídeo
- [ ] Ken Burns local (R$0 - 1 crédito)
- [ ] Integrar Replicate Wan 480p (R$2,79 - 5 créditos)
- [ ] Integrar Runware HD (R$5,70 - 10 créditos)
- [ ] Integrar Runware Luma Premium (R$7,44 - 15 créditos)
- [ ] Interface para usuário escolher provider
- [ ] Consumir créditos conforme provider escolhido

### Interface de Créditos
- [ ] Página de configurações com saldo
- [ ] Histórico de transações
- [ ] Seletor de qualidade/provider na geração
- [ ] Aviso quando créditos estiverem baixos


## Sistema de Pagamentos e Créditos (19/12/2024)
- [x] Integrar Stripe para pagamentos
- [x] Criar schema de créditos (userCredits, creditTransactions, creditPackages)
- [x] Criar funções de DB para créditos
- [x] Criar página de créditos (/credits)
- [x] Criar rotas de créditos (getBalance, getTransactions, getPackages, getProviders)
- [x] Testes do sistema de créditos
- [ ] Configurar produtos no Stripe
- [ ] Webhook do Stripe para confirmar pagamentos
- [ ] Interface de checkout funcional

## Sistema Multi-API de Imagens (19/12/2024)
- [x] Criar estrutura de providers (index.ts)
- [x] Provider OmniInfer (econômico - R$0,01/img)
- [x] Provider Dezgo (econômico - R$0,01/img)
- [x] Provider Replicate (padrão - R$0,02/img)
- [x] Provider Runware (padrão - R$0,02/img)
- [x] Provider Manus (premium - incluso)
- [x] Serviço unificado de imagens (imageService.ts)
- [ ] Interface para escolher provider
- [ ] Dedução de créditos ao gerar

## Sistema de Vídeo (19/12/2024)
- [x] Ken Burns (local, gratuito) - componente frontend
- [x] Ken Burns - configurações e presets
- [x] Serviço de vídeo (videoService.ts)
- [ ] Provider Replicate Wan 480p (R$2,79/vídeo)
- [ ] Provider Replicate Wan 720p HD (R$5,70/vídeo)
- [ ] Provider Runware Luma (R$7,44/vídeo)
- [ ] Interface de geração de vídeo
- [ ] Preview de Ken Burns no frontend
- [ ] Exportação de Ken Burns como MP4

## Tabela de Preços por Crédito
| Serviço | Créditos | Custo Real |
|---------|----------|------------|
| Imagem OmniInfer | 1 | R$0,01 |
| Imagem Dezgo | 1 | R$0,01 |
| Imagem Replicate | 2 | R$0,02 |
| Imagem Runware | 2 | R$0,02 |
| Imagem Manus | 2 | ~R$0,12 |
| Ken Burns | 3 | R$0,00 |
| Vídeo Wan 480p | 15 | R$2,79 |
| Vídeo Wan 720p | 30 | R$5,70 |
| Vídeo Luma | 40 | R$7,44 |

## Pacotes de Créditos
| Pacote | Créditos | Preço | Margem |
|--------|----------|-------|--------|
| Starter | 30 | R$39,90 | ~150%+ |
| Popular | 100 | R$99,90 | ~150%+ |
| Pro | 300 | R$249,90 | ~150%+ |


## Galeria de Mídia Unificada (19/12/2024)
- [x] Schema userMedia (uploads + geradas)
- [x] Funções de DB para mídia
- [x] Rotas de mídia (upload, list, delete)
- [x] Página de Galeria (/media)
- [x] Diferenciar visualmente: upload vs gerada (badge)
- [x] Upload: preview simples ao clicar
- [x] Gerada: ImageLightbox com prompt ao clicar
- [ ] Botão "Usar esta imagem" para aplicar no conteúdo
- [x] Botão de upload destacado (componente UploadButton)
- [x] Indicador "Upload = 0 créditos" vs "Gerar = X créditos"
- [x] Atalho no menu para Galeria
- [x] Otimizar layout mobile


## Interface de Geração de Vídeo (19/12/2024)
- [x] Componente VideoGeneratorSelector (escolher tipo de vídeo)
- [x] Opção Ken Burns (3 créditos) - animação de imagem estática
- [x] Opção Vídeo IA Básico (10 créditos) - Replicate Wan
- [x] Opção Vídeo IA Premium (25 créditos) - Runware Luma
- [x] Botão "Gerar Vídeo" nas telas de edição de conteúdo
- [x] Preview de vídeo Ken Burns em tempo real
- [x] Indicador de créditos por tipo de vídeo
- [ ] Salvar vídeos gerados na galeria de mídia
- [x] Permitir download de vídeos gerados


## Termos de Uso e Upload (19/12/2024)
- [x] Página de Termos de Uso (/terms)
- [x] Página de Política de Privacidade (/privacy)
- [ ] Links no rodapé para Termos e Privacidade
- [x] Melhorar destaque do upload nas telas de criação
- [x] Botão "Usar esta imagem" na galeria
- [x] Indicador visual "Upload = 0 créditos" mais proeminente
