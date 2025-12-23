import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Plus, Type, Square, Circle, Triangle } from 'lucide-react';
import { Button } from './ui/button';
import { EditorState, EditorElement } from '../types/mobileEditor';
import { PreviewCanvas } from './mobile-editor/PreviewCanvas';
import { ToolbarBottom } from './mobile-editor/ToolbarBottom';
import { ContextualControls } from './mobile-editor/ContextualControls';
import { useGestures } from '../hooks/useGestures';

interface MobileSlideEditorProps {
  slideId: number;
  initialText: string;
  initialImageUrl: string | null;
  initialStyle?: EditorElement[];
  onSave: (text: string, elements: EditorElement[]) => void;
  onClose: () => void;
}

export function MobileSlideEditor({
  slideId,
  initialText,
  initialImageUrl,
  initialStyle,
  onSave,
  onClose,
}: MobileSlideEditorProps) {
  // Ref para o canvas
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Ref para salvar valores iniciais dos gestos (pinça e rotação)
  const gestureInitialValuesRef = useRef<{
    fontSize: number;
    rotation: number;
  }>({ fontSize: 0, rotation: 0 });
  
  // Estado do editor
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // Se tem initialStyle salvo, usar ele
    if (initialStyle && initialStyle.length > 0) {
      return {
        elements: initialStyle,
        selectedElementId: null,
        zoom: 1,
        history: [],
        historyIndex: -1,
        backgroundImageUrl: initialImageUrl,
        backgroundColor: '#ffffff',
      };
    }
    
    // Senão, criar elemento padrão com initialText
    // Layout padrão: imagem FULL + texto embaixo à esquerda (SEM overlay)
    return {
      elements: [
        {
          id: 'text-1',
          type: 'text',
          x: 24, // Margem esquerda 24px
          y: 400, // Parte de baixo (canvas 540px altura)
          width: 352, // Largura total menos margens (400 - 48)
          height: 116, // Altura suficiente para texto
          rotation: 0,
          content: initialText || 'Toque para editar',
          fontSize: 18, // text-lg do Tailwind
          fontFamily: 'Inter',
          fontWeight: 700,
          fill: '#FFFFFF', // Texto branco (sem overlay, precisa contrastar)
          textAlign: 'left', // Alinhado à esquerda
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)', // Sombra para legibilidade
          zIndex: 1,
          opacity: 1,
          lineHeight: 1.2,
        },
      ],
      selectedElementId: null,
      zoom: 1,
      history: [],
      historyIndex: -1,
      backgroundImageUrl: initialImageUrl,
      backgroundColor: '#ffffff',
    };
  });

  const [hasChanges, setHasChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounce para salvamento automático
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setHasChanges(false);
      // Salvar no backend (silencioso)
      const textElement = editorState.elements.find(el => el.type === 'text');
      onSave(textElement?.content || '', editorState.elements);
    }, 800);
  }, [editorState.elements, onSave]);

  // Atualizar elemento
  const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
    setHasChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  // Adicionar elemento
  const addElement = useCallback((element: EditorElement) => {
    setEditorState(prev => ({
      ...prev,
      elements: [...prev.elements, element],
      selectedElementId: element.id,
    }));
    setHasChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  // Selecionar elemento
  const selectElement = useCallback((id: string | null) => {
    setEditorState(prev => ({
      ...prev,
      selectedElementId: id,
    }));
  }, []);

  // Deletar elemento
  const deleteElement = useCallback((id: string) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      selectedElementId: null,
    }));
    setHasChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  // Duplicar elemento
  const duplicateElement = useCallback((id: string) => {
    const element = editorState.elements.find(el => el.id === id);
    if (!element) return;

    const newElement: EditorElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: Math.max(...editorState.elements.map(el => el.zIndex)) + 1,
    };

    addElement(newElement);
  }, [editorState.elements, addElement]);

  // Adicionar texto
  const addText = useCallback(() => {
    const newText: EditorElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 300,
      width: 300,
      height: 80,
      rotation: 0,
      content: 'Novo texto',
      fontSize: 28,
      fontFamily: 'Inter',
      fontWeight: 600,
      fill: '#000000',
      textAlign: 'center',
      zIndex: editorState.elements.length + 1,
      opacity: 1,
    };
    addElement(newText);
  }, [editorState.elements.length, addElement]);

  // Elemento selecionado
  const selectedElement = editorState.elements.find(
    el => el.id === editorState.selectedElementId
  );

  // Gestos de toque
  useGestures(canvasContainerRef, {
    // Pinça: aumentar fontSize do texto selecionado
    onPinch: useCallback((scale: number) => {
      setEditorState(prev => {
        if (!prev.selectedElementId) return prev;
        
        const element = prev.elements.find(el => el.id === prev.selectedElementId);
        if (!element || element.type !== 'text' || !element.fontSize) return prev;
        
        // Se é o primeiro frame da pinça, salvar fontSize inicial
        if (gestureInitialValuesRef.current.fontSize === 0) {
          gestureInitialValuesRef.current.fontSize = element.fontSize;
        }
        
        // Aplicar scale relativo ao fontSize INICIAL (não ao atual)
        const newFontSize = Math.max(12, Math.min(120, 
          Math.round(gestureInitialValuesRef.current.fontSize * scale)
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

    // Rotação com 2 dedos: rotacionar elemento selecionado
    onRotate: useCallback((angleDelta: number) => {
      setEditorState(prev => {
        if (!prev.selectedElementId) return prev;
        
        const element = prev.elements.find(el => el.id === prev.selectedElementId);
        if (!element) return prev;
        
        // Se é o primeiro frame da rotação, salvar rotation inicial
        if (gestureInitialValuesRef.current.rotation === 0) {
          gestureInitialValuesRef.current.rotation = element.rotation || 0;
        }
        
        // Aplicar angleDelta relativo à rotation INICIAL (não à atual)
        let newRotation = gestureInitialValuesRef.current.rotation + angleDelta;
        
        // Normalizar para 0-360°
        newRotation = ((newRotation % 360) + 360) % 360;
        
        // Snap a cada 15° para facilitar alinhamento
        const snappedRotation = Math.round(newRotation / 15) * 15;
        
        return {
          ...prev,
          elements: prev.elements.map(el =>
            el.id === prev.selectedElementId
              ? { ...el, rotation: snappedRotation }
              : el
          ),
        };
      });
    }, []),

    // Gesto terminou: resetar valores iniciais
    onGestureEnd: useCallback(() => {
      gestureInitialValuesRef.current.fontSize = 0;
      gestureInitialValuesRef.current.rotation = 0;
    }, []),

    // Toque duplo: focar no input de texto
    onDoubleTap: useCallback((point: { x: number; y: number }) => {
      if (selectedElement && selectedElement.type === 'text') {
        // Focar no input de texto (será implementado no ContextualControls)
        const textInput = document.getElementById('text-content') as HTMLInputElement;
        if (textInput) {
          textInput.focus();
          textInput.select();
        }
      }
    }, [selectedElement]),
  });

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 h-14 border-b border-border flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h2 className="text-sm font-semibold truncate">
          Editar Slide
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const textElement = editorState.elements.find(el => el.type === 'text');
            onSave(textElement?.content || '', editorState.elements);
            onClose();
          }}
        >
          <Check className="w-5 h-5 text-green-600" />
        </Button>
      </div>

      {/* Preview Canvas - Container com scroll, canvas mantém tamanho natural */}
      <div 
        ref={canvasContainerRef}
        className="flex-shrink-0 max-h-[55vh] overflow-hidden flex items-center justify-center bg-muted/10"
      >
        <PreviewCanvas
          editorState={editorState}
          onUpdateElement={updateElement}
          onSelectElement={selectElement}
        />
      </div>

      {/* Toolbar Bottom */}
      <div className="flex-shrink-0 border-t border-border">
        <ToolbarBottom
          onAddText={addText}
        />
      </div>

      {/* Contextual Controls - Scroll independente */}
      <div className="flex-1 overflow-y-auto border-t border-border">
        <ContextualControls
          selectedElement={selectedElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDuplicateElement={duplicateElement}
        />
      </div>
    </div>
  );
}
