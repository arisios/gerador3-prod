# 📋 Proposta de Correção: Editor Mobile

## 🚨 Problemas Identificados

### 1. Preview Diferente do Editor

**Causa Raiz:**
- Slides antigos (criados antes da implementação) têm `style: null` no banco
- Preview usa renderização antiga (imagem + texto sobreposto simples)
- Editor cria elemento padrão porque não tem `initialStyle`
- **Resultado:** Preview mostra texto sobreposto, Editor mostra elemento posicionável

**Impacto:** Usuário vê uma coisa no preview e outra completamente diferente no editor

---

### 2. Pinça (Pinch) MUITO Sensível

**Causa Raiz (linha 188 do MobileSlideEditor.tsx):**
```typescript
const newFontSize = Math.round(element.fontSize * scale);
```

**Problema:**
- `scale` é aplicado ao `fontSize` ATUAL a cada frame
- Se scale = 1.2, fontSize vai de 32 → 38px
- No próximo frame, se scale = 1.2 de novo, vai de 38 → 45px
- **Efeito cascata:** Crescimento exponencial!

**Exemplo:**
- Frame 1: 32px * 1.2 = 38px
- Frame 2: 38px * 1.2 = 45px
- Frame 3: 45px * 1.2 = 54px
- **3 frames = 70% de aumento!**

---

### 3. Rotação MUITO Sensível

**Causa Raiz (linha 202 do MobileSlideEditor.tsx):**
```typescript
const newRotation = (element.rotation || 0) + angleDelta;
```

**Problema:**
- `angleDelta` é o ângulo TOTAL desde o início do gesto
- Mas está sendo SOMADO ao `rotation` atual a cada frame
- **Efeito cascata:** Rotação acumula exponencialmente!

**Exemplo:**
- Frame 1: angleDelta = 15°, rotation = 0 + 15 = 15°
- Frame 2: angleDelta = 15° (ainda), rotation = 15 + 15 = 30°
- Frame 3: angleDelta = 15° (ainda), rotation = 30 + 15 = 45°
- **Gira 3x mais rápido que deveria!**

---

### 4. Imagem Rolando Para Cima/Baixo

**Causa Raiz (linha 251 do MobileSlideEditor.tsx):**
```typescript
<div className="flex-1 overflow-y-auto bg-muted/30 flex items-center justify-center">
```

**Problema:**
- Container do canvas tem `overflow-y-auto`
- Gestos de toque no canvas podem ativar o scroll
- Canvas não precisa de scroll (já tem tamanho fixo 4:5)

---

## ✅ Soluções Propostas

### 1. Preview Diferente do Editor

**Solução:** Migração automática de slides antigos

```typescript
// No InfluencerContentEdit.tsx, ao carregar slide:
useEffect(() => {
  if (currentSlide && !currentSlide.style && currentSlide.text) {
    // Criar style padrão para slides antigos
    const defaultStyle = [{
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 350,
      width: 300,
      fontSize: 32,
      content: currentSlide.text,
      fill: '#ffffff',
      // ... outros campos
    }];
    
    // Salvar automaticamente
    updateSlide.mutate({
      id: currentSlide.id,
      style: defaultStyle
    });
  }
}, [currentSlide]);
```

**Impacto:**
- ✅ Slides antigos ganham `style` automaticamente
- ✅ Preview fica igual ao editor
- ⚠️ Primeira vez que abrir o slide, vai salvar automaticamente

---

### 2. Pinça (Pinch) Suavizada

**Solução:** Salvar fontSize inicial e aplicar scale relativo

```typescript
// Adicionar ao gestureStateRef:
const gestureStateRef = useRef({
  initialFontSize: 0,  // NOVO
  // ... outros campos
});

// No onPinch:
onPinch: useCallback((scale: number) => {
  setEditorState(prev => {
    if (!prev.selectedElementId) return prev;
    
    const element = prev.elements.find(el => el.id === prev.selectedElementId);
    if (!element || element.type !== 'text' || !element.fontSize) return prev;
    
    // Se é o primeiro frame, salvar fontSize inicial
    if (gestureStateRef.current.initialFontSize === 0) {
      gestureStateRef.current.initialFontSize = element.fontSize;
    }
    
    // Aplicar scale relativo ao tamanho INICIAL
    const newFontSize = Math.max(12, Math.min(120, 
      Math.round(gestureStateRef.current.initialFontSize * scale)
    ));
    
    return {
      ...prev,
      elements: prev.elements.map(el =>
        el.id === prev.selectedElementId
          ? { ...el, fontSize: newFontSize }
          : el
      ),
    };
  });
}, []),

// No touchEnd, resetar:
if (e.touches.length === 0) {
  gestureStateRef.current.initialFontSize = 0;
}
```

**Impacto:**
- ✅ Pinça suave e controlada
- ✅ Scale sempre relativo ao tamanho inicial
- ✅ Sem crescimento exponencial

---

### 3. Rotação Suavizada

**Solução:** Salvar rotation inicial e aplicar angleDelta relativo

```typescript
// Adicionar ao gestureStateRef:
const gestureStateRef = useRef({
  initialRotation: 0,  // NOVO
  // ... outros campos
});

// No onRotate:
onRotate: useCallback((angleDelta: number) => {
  setEditorState(prev => {
    if (!prev.selectedElementId) return prev;
    
    const element = prev.elements.find(el => el.id === prev.selectedElementId);
    if (!element) return prev;
    
    // Se é o primeiro frame, salvar rotation inicial
    if (gestureStateRef.current.initialRotation === 0) {
      gestureStateRef.current.initialRotation = element.rotation || 0;
    }
    
    // Aplicar angleDelta relativo à rotação INICIAL
    let newRotation = gestureStateRef.current.initialRotation + angleDelta;
    
    // Snap a cada 15° (opcional, para facilitar alinhamento)
    newRotation = Math.round(newRotation / 15) * 15;
    
    return {
      ...prev,
      elements: prev.elements.map(el =>
        el.id === prev.selectedElementId
          ? { ...el, rotation: newRotation }
          : el
      ),
    };
  });
}, []),

// No touchEnd, resetar:
if (e.touches.length === 0) {
  gestureStateRef.current.initialRotation = 0;
}
```

**Impacto:**
- ✅ Rotação suave e controlada
- ✅ AngleDelta sempre relativo à rotação inicial
- ✅ Sem rotação exponencial
- ✅ Snap a cada 15° para facilitar alinhamento

---

### 4. Remover Scroll Indesejado

**Solução:** Remover `overflow-y-auto` do container do canvas

```typescript
// Linha 251 do MobileSlideEditor.tsx
// ANTES:
<div className="flex-1 overflow-y-auto bg-muted/30 flex items-center justify-center">

// DEPOIS:
<div className="flex-1 overflow-hidden bg-muted/30 flex items-center justify-center">
```

**Impacto:**
- ✅ Canvas não rola mais
- ✅ Gestos de toque não ativam scroll
- ✅ Canvas sempre visível completo

---

## 🎯 Resumo das Mudanças

| Arquivo | Mudanças | Risco |
|---------|----------|-------|
| `MobileSlideEditor.tsx` | Adicionar `initialFontSize` e `initialRotation` ao gestureStateRef | ⚠️ Baixo |
| `MobileSlideEditor.tsx` | Modificar callbacks `onPinch` e `onRotate` | ⚠️ Baixo |
| `MobileSlideEditor.tsx` | Mudar `overflow-y-auto` para `overflow-hidden` | ✅ Nenhum |
| `InfluencerContentEdit.tsx` | Adicionar migração automática de slides antigos | ⚠️ Médio |

---

## ⚠️ Riscos Identificados

1. **Migração automática:** Pode salvar `style` sem usuário perceber
   - **Mitigação:** Só migra na primeira vez que abrir o slide

2. **Mudança no gestureStateRef:** Pode afetar outros gestos
   - **Mitigação:** Apenas adiciona campos novos, não remove existentes

3. **Remover overflow:** Canvas pode ficar cortado em telas muito pequenas
   - **Mitigação:** Canvas já tem `max-h-[55vh]`, deve caber na maioria das telas

---

## 📝 Checklist de Implementação

- [ ] Adicionar `initialFontSize` e `initialRotation` ao gestureStateRef
- [ ] Modificar callback `onPinch` para usar fontSize inicial
- [ ] Modificar callback `onRotate` para usar rotation inicial
- [ ] Resetar valores iniciais no `touchEnd`
- [ ] Mudar `overflow-y-auto` para `overflow-hidden`
- [ ] Adicionar migração automática de slides antigos (opcional)
- [ ] Testar pinça: deve ser suave e controlada
- [ ] Testar rotação: deve ser suave e controlada
- [ ] Testar scroll: não deve rolar
- [ ] Testar preview: deve ficar igual ao editor após migração

---

## 🤔 Dúvidas para o Usuário

1. **Migração automática:** Quer que slides antigos sejam migrados automaticamente ou prefere migrar manualmente?
2. **Snap de rotação:** Quer manter o snap a cada 15° ou prefere rotação livre?
3. **Ordem de implementação:** Quer que eu implemente tudo de uma vez ou uma correção por vez?
