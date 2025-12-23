// Tipos para o editor mobile-first

export type ElementType = 'text' | 'shape' | 'image';
export type ShapeType = 'circle' | 'square' | 'triangle';
export type TextAlign = 'left' | 'center' | 'right';

export interface EditorElement {
  id: string;
  type: ElementType;
  
  // Posição e transformação
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  
  // Propriedades específicas
  content?: string;           // Para texto
  shapeType?: ShapeType;      // Para formas
  imageUrl?: string;          // Para imagens
  
  // Estilos
  fill?: string;              // Cor de preenchimento
  stroke?: string;            // Cor da borda
  strokeWidth?: number;       // Espessura da borda
  opacity?: number;           // Opacidade (0-1)
  fontSize?: number;          // Tamanho da fonte (texto)
  fontFamily?: string;        // Fonte (texto)
  textAlign?: TextAlign;      // Alinhamento (texto)
  fontWeight?: number;        // Peso da fonte
  
  // Ordem (z-index)
  zIndex: number;
}

export interface EditorState {
  // Elementos do slide
  elements: EditorElement[];
  
  // Elemento selecionado
  selectedElementId: string | null;
  
  // Zoom do canvas
  zoom: number; // 0.5 a 2.0
  
  // Histórico (undo/redo)
  history: EditorElement[][];
  historyIndex: number;
  
  // Imagem de fundo
  backgroundImageUrl: string | null;
  backgroundColor: string;
}

export interface MoveableEvent {
  target: HTMLElement | SVGElement;
  transform: string;
}

export interface DragEvent extends MoveableEvent {
  left: number;
  top: number;
  beforeTranslate: number[];
  translate: number[];
}

export interface ResizeEvent extends MoveableEvent {
  width: number;
  height: number;
  delta: number[];
}

export interface RotateEvent extends MoveableEvent {
  rotate: number;
  beforeRotate: number;
}
