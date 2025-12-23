import { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import { EditorState, EditorElement } from '../../types/mobileEditor';

interface PreviewCanvasProps {
  editorState: EditorState;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onSelectElement: (id: string | null) => void;
}

export function PreviewCanvas({
  editorState,
  onUpdateElement,
  onSelectElement,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | SVGElement | null>(null);

  const selectedElement = editorState.elements.find(
    el => el.id === editorState.selectedElementId
  );

  // Atualizar target do Moveable quando seleção mudar
  useEffect(() => {
    if (editorState.selectedElementId && canvasRef.current) {
      const element = canvasRef.current.querySelector(
        `[data-element-id="${editorState.selectedElementId}"]`
      ) as HTMLElement | SVGElement;
      setTargetElement(element);
    } else {
      setTargetElement(null);
    }
  }, [editorState.selectedElementId]);

  // Renderizar texto
  const renderText = (element: EditorElement) => {
    return (
      <div
        key={element.id}
        data-element-id={element.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(element.id);
        }}
        style={{
          position: 'absolute',
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          transform: `rotate(${element.rotation}deg)`,
          fontSize: `${element.fontSize}px`,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.textDecoration,
          color: element.fill,
          textAlign: element.textAlign,
          textShadow: element.textShadow,
          WebkitTextStroke: element.textStroke,
          padding: element.padding ? `${element.padding}px` : undefined,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
          opacity: element.opacity,
          zIndex: element.zIndex,
          cursor: 'move',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: element.textAlign === 'left' ? 'flex-start' : 
                         element.textAlign === 'right' ? 'flex-end' : 'center',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {element.content}
      </div>
    );
  };

  // Renderizar forma
  const renderShape = (element: EditorElement) => {
    const { shapeType, x, y, width, height, rotation, fill, stroke, strokeWidth, opacity, zIndex } = element;

    let shapePath = '';
    if (shapeType === 'circle') {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) / 2;
      shapePath = `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    } else if (shapeType === 'square') {
      shapePath = `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`;
    } else if (shapeType === 'triangle') {
      shapePath = `M ${width / 2},0 L ${width},${height} L 0,${height} Z`;
    }

    return (
      <svg
        key={element.id}
        data-element-id={element.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(element.id);
        }}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
          transform: `rotate(${rotation}deg)`,
          opacity,
          zIndex,
          cursor: 'move',
        }}
      >
        <path
          d={shapePath}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/20 p-4">
      {/* Canvas Container (4:5 aspect ratio) */}
      <div
        ref={canvasRef}
        onClick={() => onSelectElement(null)}
        className="relative bg-white shadow-lg"
        style={{
          width: 'min(90vw, 400px)',
          aspectRatio: '4/5',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        {editorState.backgroundImageUrl && (
          <img
            src={editorState.backgroundImageUrl}
            alt="Background"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Background Color */}
        {!editorState.backgroundImageUrl && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: editorState.backgroundColor }}
          />
        )}

        {/* Elements */}
        {editorState.elements.map((element) => {
          if (element.type === 'text') return renderText(element);
          if (element.type === 'shape') return renderShape(element);
          return null;
        })}
      </div>

      {/* Moveable */}
      {targetElement && selectedElement && (
        <Moveable
          target={targetElement}
          container={canvasRef.current}
          
          // Funcionalidades habilitadas
          draggable={true}
          resizable={true}
          rotatable={true}
          
          // Touch-friendly
          origin={false}
          edge={false}
          
          // Handles grandes para dedos
          renderDirections={['nw', 'ne', 'sw', 'se']}
          
          // Snap/alinhamento
          snappable={true}
          snapThreshold={5}
          
          // Callbacks
          onDrag={({ left, top }) => {
            onUpdateElement(selectedElement.id, {
              x: left,
              y: top,
            });
          }}
          
          onResize={({ width, height, drag }) => {
            const updates: Partial<EditorElement> = {
              width,
              height,
              x: drag.left,
              y: drag.top,
            };
            
            // Se for texto, ajustar fontSize proporcionalmente
            if (selectedElement.type === 'text' && selectedElement.fontSize) {
              const widthRatio = width / selectedElement.width;
              updates.fontSize = Math.round(selectedElement.fontSize * widthRatio);
            }
            
            onUpdateElement(selectedElement.id, updates);
          }}
          
          onRotate={({ rotate }) => {
            onUpdateElement(selectedElement.id, {
              rotation: rotate,
            });
          }}
        />
      )}
    </div>
  );
}
