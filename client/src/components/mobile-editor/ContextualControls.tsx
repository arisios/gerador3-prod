import { EditorElement } from '../../types/mobileEditor';
import { Trash2, Copy, Bold, Italic, Underline } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

interface ContextualControlsProps {
  selectedElement: EditorElement | undefined;
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

export function ContextualControls({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}: ContextualControlsProps) {
  if (!selectedElement) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold">Configurações do Slide</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um elemento para editá-lo
        </p>
      </div>
    );
  }

  // Controles de Texto
  if (selectedElement.type === 'text') {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold">Editar Texto</h3>
        
        {/* Conteúdo */}
        <div className="space-y-2">
          <Label htmlFor="text-content">Texto</Label>
          <Input
            id="text-content"
            value={selectedElement.content || ''}
            onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
            placeholder="Digite o texto..."
            className="h-12"
          />
        </div>
        
        {/* Tamanho */}
        <div className="space-y-2">
          <Label>Tamanho: {selectedElement.fontSize}px</Label>
          <Slider
            value={[selectedElement.fontSize || 32]}
            onValueChange={([value]) => onUpdateElement(selectedElement.id, { fontSize: value })}
            min={12}
            max={72}
            step={1}
            className="py-4"
          />
        </div>
        
        {/* Largura do Texto (Margem Externa) - MOVIDO PARA CÁ */}
        <div className="space-y-2">
          <Label>Largura do Texto: {Math.round((selectedElement.width || 300) / 400 * 100)}%</Label>
          <Slider
            value={[selectedElement.width || 300]}
            onValueChange={([value]) => onUpdateElement(selectedElement.id, { width: value })}
            min={150}
            max={400}
            step={10}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            💡 Diminua a largura para posicionar o texto onde quiser
          </p>
        </div>
        
        {/* Cor */}
        <div className="space-y-2">
          <Label>Cor do Texto</Label>
          <div className="flex gap-2 flex-wrap">
            {['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#FFA500'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateElement(selectedElement.id, { fill: color })}
                className="w-10 h-10 rounded-full border-2 border-border"
                style={{
                  backgroundColor: color,
                  borderColor: selectedElement.fill === color ? '#000' : '#e5e7eb',
                  borderWidth: selectedElement.fill === color ? '3px' : '2px',
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Alinhamento */}
        <div className="space-y-2">
          <Label>Alinhamento</Label>
          <div className="flex gap-2">
            <Button
              variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'left' })}
            >
              Esquerda
            </Button>
            <Button
              variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'center' })}
            >
              Centro
            </Button>
            <Button
              variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'right' })}
            >
              Direita
            </Button>
          </div>
        </div>
        
        {/* Estilos de Texto */}
        <div className="space-y-2">
          <Label>Estilos</Label>
          <div className="flex gap-2">
            <Button
              variant={selectedElement.fontWeight === 'bold' || selectedElement.fontWeight === 700 ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onUpdateElement(selectedElement.id, { 
                fontWeight: selectedElement.fontWeight === 'bold' || selectedElement.fontWeight === 700 ? 'normal' : 'bold' 
              })}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedElement.fontStyle === 'italic' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onUpdateElement(selectedElement.id, { 
                fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
              })}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={selectedElement.textDecoration === 'underline' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => onUpdateElement(selectedElement.id, { 
                textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' 
              })}
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Sombra */}
        <div className="space-y-2">
          <Label>Sombra</Label>
          <div className="flex gap-2">
            <Button
              variant={!selectedElement.textShadow ? 'default' : 'outline'}
              className="flex-1 h-10"
              onClick={() => onUpdateElement(selectedElement.id, { textShadow: undefined })}
            >
              Nenhuma
            </Button>
            <Button
              variant={selectedElement.textShadow === '2px 2px 4px rgba(0,0,0,0.5)' ? 'default' : 'outline'}
              className="flex-1 h-10"
              onClick={() => onUpdateElement(selectedElement.id, { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' })}
            >
              Leve
            </Button>
            <Button
              variant={selectedElement.textShadow === '4px 4px 8px rgba(0,0,0,0.7)' ? 'default' : 'outline'}
              className="flex-1 h-10"
              onClick={() => onUpdateElement(selectedElement.id, { textShadow: '4px 4px 8px rgba(0,0,0,0.7)' })}
            >
              Forte
            </Button>
          </div>
        </div>
        
        {/* Contorno/Borda */}
        <div className="space-y-2">
          <Label>Contorno</Label>
          <div className="flex gap-2">
            <Button
              variant={!selectedElement.textStroke ? 'default' : 'outline'}
              className="flex-1 h-10"
              onClick={() => onUpdateElement(selectedElement.id, { textStroke: undefined })}
            >
              Nenhum
            </Button>
            <Button
              variant={selectedElement.textStroke === '1px #000000' ? 'default' : 'outline'}
              className="flex-1 h-10"
              onClick={() => onUpdateElement(selectedElement.id, { textStroke: '1px #000000' })}
            >
              Fino
            </Button>
            <Button
              variant={selectedElement.textStroke === '2px #000000' ? 'default' : 'outline'}
              className="flex-1 h-10"
              onClick={() => onUpdateElement(selectedElement.id, { textStroke: '2px #000000' })}
            >
              Grosso
            </Button>
          </div>
        </div>
        
        {/* Espaçamento entre Linhas */}
        <div className="space-y-2">
          <Label>Espaçamento entre Linhas: {(selectedElement.lineHeight || 1.2).toFixed(1)}</Label>
          <Slider
            value={[selectedElement.lineHeight || 1.2]}
            onValueChange={([value]) => onUpdateElement(selectedElement.id, { lineHeight: value })}
            min={0.8}
            max={3.0}
            step={0.1}
            className="py-4"
          />
        </div>
        
        {/* Espaçamento entre Caracteres */}
        <div className="space-y-2">
          <Label>Espaçamento entre Caracteres: {selectedElement.letterSpacing || 0}px</Label>
          <Slider
            value={[selectedElement.letterSpacing || 0]}
            onValueChange={([value]) => onUpdateElement(selectedElement.id, { letterSpacing: value })}
            min={-2}
            max={10}
            step={0.5}
            className="py-4"
          />
        </div>
        
        {/* Ações */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => onDuplicateElement(selectedElement.id)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-12"
            onClick={() => onDeleteElement(selectedElement.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>
    );
  }

  // Controles de Forma
  if (selectedElement.type === 'shape') {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold">Editar Forma</h3>
        
        {/* Cor de Preenchimento */}
        <div className="space-y-2">
          <Label>Cor de Preenchimento</Label>
          <div className="flex gap-2 flex-wrap">
            {['#FFD700', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#FFA500', '#000000'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateElement(selectedElement.id, { fill: color })}
                className="w-10 h-10 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor: selectedElement.fill === color ? '#000' : '#e5e7eb',
                  borderWidth: selectedElement.fill === color ? '3px' : '2px',
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Cor da Borda */}
        <div className="space-y-2">
          <Label>Cor da Borda</Label>
          <div className="flex gap-2 flex-wrap">
            {['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#FFA500'].map((color) => (
              <button
                key={color}
                onClick={() => onUpdateElement(selectedElement.id, { stroke: color })}
                className="w-10 h-10 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor: selectedElement.stroke === color ? '#000' : '#e5e7eb',
                  borderWidth: selectedElement.stroke === color ? '3px' : '2px',
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Espessura da Borda */}
        <div className="space-y-2">
          <Label>Espessura da Borda: {selectedElement.strokeWidth}px</Label>
          <Slider
            value={[selectedElement.strokeWidth || 2]}
            onValueChange={([value]) => onUpdateElement(selectedElement.id, { strokeWidth: value })}
            min={0}
            max={10}
            step={1}
            className="py-4"
          />
        </div>
        
        {/* Opacidade */}
        <div className="space-y-2">
          <Label>Opacidade: {Math.round((selectedElement.opacity || 1) * 100)}%</Label>
          <Slider
            value={[(selectedElement.opacity || 1) * 100]}
            onValueChange={([value]) => onUpdateElement(selectedElement.id, { opacity: value / 100 })}
            min={0}
            max={100}
            step={5}
            className="py-4"
          />
        </div>
        
        {/* Ações */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => onDuplicateElement(selectedElement.id)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-12"
            onClick={() => onDeleteElement(selectedElement.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
