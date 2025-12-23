import { Plus, Type } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

interface ToolbarBottomProps {
  onAddText: () => void;
}

export function ToolbarBottom({ onAddText }: ToolbarBottomProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="relative">
      {/* Submenu Adicionar */}
      {showAddMenu && (
        <div className="absolute bottom-full left-0 right-0 bg-background border-t border-border shadow-lg">
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-semibold mb-3">Adicionar Elemento</h3>
            
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => {
                onAddText();
                setShowAddMenu(false);
              }}
            >
              <Type className="w-5 h-5 mr-3" />
              Texto
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowAddMenu(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Barra Principal */}
      <div className="flex items-center justify-around p-2 bg-background">
        <Button
          variant="ghost"
          size="lg"
          className="flex-col h-auto py-2 px-4"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-xs">Adicionar</span>
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          className="flex-col h-auto py-2 px-6"
          onClick={onAddText}
        >
          <Type className="w-6 h-6 mb-1" />
          <span className="text-xs">Texto</span>
        </Button>
      </div>
    </div>
  );
}
