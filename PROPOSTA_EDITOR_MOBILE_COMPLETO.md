# 📱 Proposta: Editor Mobile-First Completo (Inspirado no Canva)

## 🎯 Objetivo

Criar um editor de slides **100% otimizado para mobile**, onde o usuário edita rapidamente (10 minutinhos) usando apenas os dedos, sem depender de mouse ou desktop.

---

## 🔧 Tecnologia Escolhida: react-moveable

**Biblioteca:** `react-moveable` (10.6k ⭐ no GitHub)  
**Por quê:**
- ✅ Drag, Resize, Rotate, Pinch - tudo touch-friendly
- ✅ Suporte SVG (para formas geométricas)
- ✅ Snappable (alinhamento automático)
- ✅ Groupable (mover múltiplos elementos)
- ✅ Mantida ativamente, usada em produção
- ✅ Funciona perfeitamente no mobile

---

## 🎨 Layout Mobile-First

```
┌─────────────────────────────────┐
│  [←] Título do Slide      [✓]   │ ← Header fixo (voltar + salvar)
├─────────────────────────────────┤
│                                 │
│                                 │
│         PREVIEW GRANDE          │ ← 60% da tela
│      (Canvas Interativo)        │   Touch: arrastar, resize, rotate
│                                 │   Pinch to zoom
│     [Texto editável aqui]       │   Toque para selecionar
│                                 │
│                                 │
├─────────────────────────────────┤
│ [+] [T] [□] [○] [△] [🖼️] [🎨]  │ ← Barra de ferramentas inferior
├─────────────────────────────────┤
│                                 │
│   Controles Contextuais         │ ← 40% da tela (scroll vertical)
│   (Mudam conforme seleção)      │   
│                                 │   Exemplo: Texto selecionado →
│   Fonte: [Inter ▼]              │   - Fonte
│   Tamanho: [32 ━━●━━━ 72]      │   - Tamanho (slider)
│   Cor: [⚫ ⚪ 🔴 🔵 🟢]         │   - Cor (paleta)
│   Alinhamento: [◧ ■ ◨]         │   - Alinhamento
│                                 │
└─────────────────────────────────┘
```

---

## ✅ Funcionalidades Implementadas

### 1. Preview Interativo (Canvas Touch)

**Elementos manipuláveis:**
- Texto
- Imagem de fundo
- Formas geométricas (círculo, quadrado, triângulo)

**Gestos touch:**
- **Arrastar:** Toque + arraste com 1 dedo
- **Redimensionar:** Handles nos cantos (grandes, touch-friendly)
- **Rotacionar:** Toque em 2 dedos + gire
- **Pinch to zoom:** Pinça com 2 dedos (zoom in/out do canvas)
- **Selecionar:** Toque simples no elemento
- **Desselecionar:** Toque fora do elemento

---

### 2. Barra de Ferramentas Inferior

**Botões principais (sempre visíveis):**
- **[+]** Adicionar elemento (abre submenu)
- **[T]** Adicionar texto
- **[□]** Adicionar quadrado
- **[○]** Adicionar círculo
- **[△]** Adicionar triângulo
- **[🖼️]** Trocar imagem de fundo
- **[🎨]** Estilos rápidos (templates)

**Submenu "Adicionar" (slide up):**
```
┌─────────────────────────────────┐
│  Adicionar Elemento             │
│                                 │
│  📝 Texto                        │
│  🖼️  Imagem                      │
│  ⬛ Formas                       │
│     • Quadrado                  │
│     • Círculo                   │
│     • Triângulo                 │
│  ❌ Cancelar                     │
└─────────────────────────────────┘
```

---

### 3. Controles Contextuais (Dinâmicos)

#### Quando TEXTO está selecionado:
```
┌─────────────────────────────────┐
│  Editar Texto                   │
│                                 │
│  [Digite aqui...]               │ ← Input inline
│                                 │
│  Fonte                          │
│  [Inter ▼]                      │ ← Dropdown
│                                 │
│  Tamanho                        │
│  [━━━●━━━] 32px                 │ ← Slider grande (touch-friendly)
│                                 │
│  Cor do Texto                   │
│  [⚫ ⚪ 🔴 🔵 🟢 🟡 🟣 🟠]       │ ← Paleta de cores
│                                 │
│  Alinhamento                    │
│  [◧] [■] [◨]                   │ ← Botões grandes
│  Esq Centro Dir                │
│                                 │
│  Efeitos                        │
│  [Sombra] [Contorno] [Brilho]   │ ← Toggles
│                                 │
│  [🗑️ Deletar] [📋 Duplicar]     │ ← Ações
└─────────────────────────────────┘
```

#### Quando FORMA está selecionada:
```
┌─────────────────────────────────┐
│  Editar Forma                   │
│                                 │
│  Cor de Preenchimento           │
│  [⚫ ⚪ 🔴 🔵 🟢 🟡 🟣 🟠]       │
│                                 │
│  Cor da Borda                   │
│  [⚫ ⚪ 🔴 🔵 🟢 🟡 🟣 🟠]       │
│                                 │
│  Espessura da Borda             │
│  [━━●━━━] 2px                   │
│                                 │
│  Opacidade                      │
│  [━━━━●━] 80%                   │
│                                 │
│  [🗑️ Deletar] [📋 Duplicar]     │
└─────────────────────────────────┘
```

#### Quando IMAGEM DE FUNDO está selecionada:
```
┌─────────────────────────────────┐
│  Editar Imagem                  │
│                                 │
│  [📤 Upload Nova Imagem]         │ ← Botão grande
│  [✨ Gerar com IA]               │
│                                 │
│  Filtros                        │
│  [Original] [P&B] [Sépia] [...]  │
│                                 │
│  Brilho                         │
│  [━━━●━━━] 100%                 │
│                                 │
│  Contraste                      │
│  [━━━●━━━] 100%                 │
└─────────────────────────────────┘
```

#### Quando NADA está selecionado:
```
┌─────────────────────────────────┐
│  Configurações do Slide         │
│                                 │
│  Cor de Fundo                   │
│  [⚫ ⚪ 🔴 🔵 🟢 🟡 🟣 🟠]       │
│                                 │
│  Gradiente                      │
│  [Nenhum ▼]                     │
│                                 │
│  [🔄 Desfazer] [↩️ Refazer]      │
└─────────────────────────────────┘
```

---

## 🎯 Fluxo de Uso (Exemplo Real)

### Cenário: Usuário quer adicionar texto e uma forma

1. **Abre o editor** → Preview grande aparece com imagem de fundo
2. **Toca em [T]** (botão Texto) → Texto "Toque para editar" aparece no centro
3. **Toca no texto** → Controles de texto aparecem embaixo
4. **Digita "Promoção!"** no input inline
5. **Arrasta slider de tamanho** → Texto fica maior em tempo real
6. **Toca em cor vermelha** → Texto fica vermelho
7. **Toca fora do texto** → Texto é desselecionado
8. **Toca em [○]** (botão Círculo) → Círculo amarelo aparece
9. **Arrasta círculo** com o dedo → Posiciona atrás do texto
10. **Toca no handle do canto** → Redimensiona círculo
11. **Toca em [✓]** no header → Salva automaticamente (sem toast)

**Tempo total: ~2 minutos** ⚡

---

## 🔧 Implementação Técnica

### Estrutura de Componentes

```
MobileSlideEditor/
├── MobileEditorLayout.tsx          ← Container fullscreen
├── PreviewCanvas.tsx                ← Canvas interativo (react-moveable)
│   ├── TextElement.tsx              ← Texto editável
│   ├── ShapeElement.tsx             ← Formas SVG
│   └── BackgroundImage.tsx          ← Imagem de fundo
├── ToolbarBottom.tsx                ← Barra de ferramentas inferior
└── ContextualControls.tsx           ← Controles dinâmicos
    ├── TextControls.tsx
    ├── ShapeControls.tsx
    ├── ImageControls.tsx
    └── SlideControls.tsx
```

### Estado do Editor

```typescript
interface EditorState {
  // Elementos do slide
  elements: Element[];
  
  // Elemento selecionado
  selectedElementId: string | null;
  
  // Zoom do canvas
  zoom: number; // 0.5 a 2.0
  
  // Histórico (undo/redo)
  history: Element[][];
  historyIndex: number;
}

interface Element {
  id: string;
  type: 'text' | 'shape' | 'image';
  
  // Posição e transformação
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  
  // Propriedades específicas
  content?: string;           // Para texto
  shapeType?: 'circle' | 'square' | 'triangle'; // Para formas
  imageUrl?: string;          // Para imagens
  
  // Estilos
  fill?: string;              // Cor de preenchimento
  stroke?: string;            // Cor da borda
  strokeWidth?: number;       // Espessura da borda
  opacity?: number;           // Opacidade
  fontSize?: number;          // Tamanho da fonte (texto)
  fontFamily?: string;        // Fonte (texto)
  textAlign?: 'left' | 'center' | 'right'; // Alinhamento (texto)
  
  // Ordem (z-index)
  zIndex: number;
}
```

### Integração com react-moveable

```tsx
import Moveable from 'react-moveable';

<Moveable
  target={selectedElement}
  
  // Funcionalidades habilitadas
  draggable={true}
  resizable={true}
  rotatable={true}
  pinchable={true}        // Pinch to zoom
  
  // Touch-friendly
  origin={false}
  edge={false}
  
  // Handles grandes para dedos
  renderDirections={['nw', 'ne', 'sw', 'se']}
  
  // Snap/alinhamento
  snappable={true}
  snapThreshold={5}
  
  // Callbacks
  onDrag={handleDrag}
  onResize={handleResize}
  onRotate={handleRotate}
  onPinch={handlePinch}
/>
```

---

## 📊 Comparação: Editor Atual vs. Novo

| Aspecto | Editor Atual | Novo Editor Mobile |
|---------|--------------|-------------------|
| Preview mobile | 200px (25%) | 90vw (60-70%) |
| Manipulação | Apenas texto | Texto + Formas + Imagem |
| Gestos touch | Nenhum | Drag, Resize, Rotate, Pinch |
| Redimensionar | Não funciona | Handles grandes touch-friendly |
| Adicionar formas | Não | Sim (círculo, quadrado, triângulo) |
| Controles | Tabs fixas | Contextuais dinâmicos |
| Salvamento | Toast a cada toque | Silencioso com debounce |
| Undo/Redo | Não | Sim |
| UX Mobile | Ruim | Excelente (Canva-like) |

---

## ⏱️ Estimativa de Implementação

### Fase 1: Setup e Layout (1h)
- [ ] Instalar `react-moveable` e `@types/react-moveable`
- [ ] Criar estrutura de componentes
- [ ] Implementar layout fullscreen mobile
- [ ] Preview grande + barra inferior

### Fase 2: Manipulação de Texto (1.5h)
- [ ] Adicionar texto no canvas
- [ ] Arrastar texto com react-moveable
- [ ] Redimensionar texto
- [ ] Rotacionar texto
- [ ] Controles contextuais de texto (fonte, cor, tamanho)

### Fase 3: Formas Geométricas (1.5h)
- [ ] Adicionar círculo, quadrado, triângulo (SVG)
- [ ] Arrastar formas
- [ ] Redimensionar formas
- [ ] Rotacionar formas
- [ ] Controles contextuais de formas (cor, borda, opacidade)

### Fase 4: Gestos Touch Avançados (1h)
- [ ] Pinch to zoom no canvas
- [ ] Snap/alinhamento automático
- [ ] Handles grandes touch-friendly
- [ ] Feedback visual (sombras, highlights)

### Fase 5: Undo/Redo e Salvamento (1h)
- [ ] Implementar histórico de alterações
- [ ] Botões Desfazer/Refazer
- [ ] Salvamento silencioso com debounce (800ms)
- [ ] Integração com backend (salvar JSON do estado)

### Fase 6: Testes e Ajustes (1h)
- [ ] Testar em iPhone (Safari)
- [ ] Testar em Android (Chrome)
- [ ] Ajustar tamanhos de handles
- [ ] Ajustar sensibilidade de gestos
- [ ] Performance (60fps no mobile)

**Total: ~7 horas**

---

## 🚀 Resultado Esperado

✅ Preview grande e claro no celular  
✅ Arrastar, redimensionar, rotacionar com dedos  
✅ Adicionar texto e formas facilmente  
✅ Controles contextuais intuitivos  
✅ Pinch to zoom para precisão  
✅ Undo/Redo para corrigir erros  
✅ Salvamento silencioso (sem toast irritante)  
✅ Edição rápida (10 minutinhos)  
✅ UX profissional como Canva  
✅ Download continua funcionando (usa Canvas API)

---

## 💡 Melhorias Futuras (Opcional)

1. **Camadas** - Reordenar elementos (trazer para frente/enviar para trás)
2. **Duplicar** - Copiar elemento com um toque
3. **Agrupar** - Mover múltiplos elementos juntos
4. **Stickers/Emojis** - Biblioteca de elementos prontos
5. **Filtros de imagem** - P&B, Sépia, Vintage, etc.
6. **Animações** - Entrada/saída de elementos (para vídeos)
7. **Colaboração** - Editar com outra pessoa em tempo real

---

## ⚠️ Limitações Conhecidas

1. **Não substitui Photoshop** - É um editor simples para slides de Instagram/TikTok
2. **Formas básicas apenas** - Círculo, quadrado, triângulo (sem polígonos complexos)
3. **Sem edição de imagem avançada** - Crop, filtros básicos apenas
4. **Performance** - Limite de ~20 elementos por slide para manter 60fps

---

## 🎯 Conclusão

Este editor mobile-first transforma a experiência de edição de slides no celular, tornando-a **rápida, intuitiva e profissional** como o Canva. O usuário consegue criar conteúdo de qualidade em 10 minutinhos usando apenas os dedos, sem depender de desktop.

**Pronto para implementar?** 🚀
