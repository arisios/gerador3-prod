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
  onSave: (text: string, elements: EditorElement[]) => void;
  onClose: () => void;
}

export function MobileSlideEditor({
  slideId,
  initialText,
  initialImageUrl,
  onSave,
  onClose,
}: MobileSlideEditorProps) {
  // Ref para o canvas
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Estado de zoom do canvas
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasScale, setCanvasScale] = useState(1);
  
  // Estado do editor
  const [editorState, setEditorState] = useState<EditorState>(() => ({
    elements: [
      {
        id: 'text-1',
        type: 'text',
        x: 50,
        y: 200,
        width: 300,
        height: 100,
        rotation: 0,
        content: initialText || 'Toque para editar',
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: 700,
        fill: '#000000',
        textAlign: 'center',
        zIndex: 1,
        opacity: 1,
      },
    ],
    selectedElementId: null,
    zoom: 1,
    history: [],
    historyIndex: -1,
    backgroundImageUrl: initialImageUrl,
    backgroundColor: '#ffffff',
  }));

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
    // Pinça: zoom do canvas
    onPinch: useCallback((scale: number) => {
      setCanvasScale(prevScale => {
        const newScale = Math.max(0.5, Math.min(2, prevScale * scale));
        return newScale;
      });
    }, []),

    // Rotação com 2 dedos: rotacionar elemento selecionado
    onRotate: useCallback((angleDelta: number) => {
      setEditorState(prev => {
        if (!prev.selectedElementId) return prev;
        
        const element = prev.elements.find(el => el.id === prev.selectedElementId);
        if (!element) return prev;
        
        const newRotation = (element.rotation + angleDelta) % 360;
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

      {/* Preview Canvas */}
      <div 
        ref={canvasContainerRef}
        className="flex-1 overflow-hidden"
        style={{
          transform: `scale(${canvasScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <PreviewCanvas
          editorState={editorState}
          onUpdateElement={updateElement}
          onSelectElement={selectElement}
        />
      </div>
      
      {/* Indicador de Zoom */}
      {canvasScale !== 1 && (
        <div className="absolute top-20 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {Math.round(canvasScale * 100)}%
        </div>
      )}

      {/* Toolbar Bottom */}
      <div className="flex-shrink-0 border-t border-border">
        <ToolbarBottom
          onAddText={addText}
        />
      </div>

      {/* Contextual Controls */}
      <div className="flex-shrink-0 max-h-[40vh] overflow-y-auto border-t border-border">
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
