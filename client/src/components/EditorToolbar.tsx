import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Palette, Move, Image, Square, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export interface ElementStyle {
  background?: string;
  backgroundType?: "color" | "gradient" | "image";
  boxShadow?: string;
  shadowBlur?: number;
  shadowColor?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  imageUrl?: string;
  imageSize?: number;
}

export interface PageStyles {
  [elementId: string]: ElementStyle;
}

interface EditorToolbarProps {
  selectedElement: string | null;
  styles: PageStyles;
  onStyleChange: (elementId: string, style: ElementStyle) => void;
  onSave: () => void;
  onClose: () => void;
  onClearSelection: () => void;
}

export function EditorToolbar({ 
  selectedElement, 
  styles, 
  onStyleChange, 
  onSave, 
  onClose,
  onClearSelection 
}: EditorToolbarProps) {
  const [activeTab, setActiveTab] = useState<"background" | "shadow" | "position" | "image">("background");
  const currentStyle = selectedElement ? (styles[selectedElement] || {}) : {};
  
  const updateStyle = (updates: Partial<ElementStyle>) => {
    if (!selectedElement) return;
    onStyleChange(selectedElement, { ...currentStyle, ...updates });
  };

  const tabs = [
    { id: "background", icon: Palette, label: "Fondo" },
    { id: "shadow", icon: Square, label: "Sombra" },
    { id: "position", icon: Move, label: "Posición" },
    { id: "image", icon: Image, label: "Imagen" },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-cyan-500/30 shadow-2xl p-4 min-w-[320px] max-w-[90vw]"
      data-testid="editor-toolbar"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium text-sm">
          {selectedElement ? `Editando: ${selectedElement}` : "Selecciona un elemento"}
        </span>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={onSave} className="text-green-400 hover:text-green-300" data-testid="button-save-styles">
            <Save className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white" data-testid="button-close-editor">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedElement && (
        <>
          <div className="flex gap-1 mb-3">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={activeTab === tab.id ? "bg-cyan-600" : "text-gray-400"}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-3 h-3 mr-1" />
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTab === "background" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={currentStyle.backgroundType === "color" ? "default" : "outline"}
                    onClick={() => updateStyle({ backgroundType: "color" })}
                    className="flex-1 text-xs"
                    data-testid="bg-type-color"
                  >
                    Color
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStyle.backgroundType === "gradient" ? "default" : "outline"}
                    onClick={() => updateStyle({ backgroundType: "gradient" })}
                    className="flex-1 text-xs"
                    data-testid="bg-type-gradient"
                  >
                    Gradiente
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStyle.backgroundType === "image" ? "default" : "outline"}
                    onClick={() => updateStyle({ backgroundType: "image" })}
                    className="flex-1 text-xs"
                    data-testid="bg-type-image"
                  >
                    Imagen
                  </Button>
                </div>
                
                {currentStyle.backgroundType === "color" && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-16">Color:</span>
                    <Input
                      type="color"
                      value={currentStyle.background?.startsWith("#") ? currentStyle.background : "#8a3ffc"}
                      onChange={(e) => updateStyle({ background: e.target.value })}
                      className="w-12 h-8 p-0 border-0"
                      data-testid="input-bg-color"
                    />
                    <Input
                      type="text"
                      value={currentStyle.background || ""}
                      onChange={(e) => updateStyle({ background: e.target.value })}
                      placeholder="#8a3ffc"
                      className="flex-1 h-8 text-xs bg-gray-800 border-gray-700"
                      data-testid="input-bg-color-text"
                    />
                  </div>
                )}
                
                {currentStyle.backgroundType === "gradient" && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={currentStyle.background || ""}
                      onChange={(e) => updateStyle({ background: e.target.value })}
                      placeholder="linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)"
                      className="h-8 text-xs bg-gray-800 border-gray-700"
                      data-testid="input-gradient"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => updateStyle({ background: "linear-gradient(135deg, #8a3ffc 0%, #00d9ff 100%)" })}
                        data-testid="preset-gradient-1"
                      >
                        Purple→Cyan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => updateStyle({ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)" })}
                        data-testid="preset-gradient-2"
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentStyle.backgroundType === "image" && (
                  <Input
                    type="text"
                    value={currentStyle.background || ""}
                    onChange={(e) => updateStyle({ background: e.target.value })}
                    placeholder="url('/path/to/image.png')"
                    className="h-8 text-xs bg-gray-800 border-gray-700"
                    data-testid="input-bg-image"
                  />
                )}
              </div>
            )}

            {activeTab === "shadow" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Blur:</span>
                  <Slider
                    value={[currentStyle.shadowBlur || 0]}
                    onValueChange={([val]) => {
                      const color = currentStyle.shadowColor || "rgba(0,0,0,0.3)";
                      updateStyle({ 
                        shadowBlur: val,
                        boxShadow: val > 0 ? `0 4px ${val}px ${color}` : "none"
                      });
                    }}
                    max={50}
                    step={1}
                    className="flex-1"
                    data-testid="slider-shadow-blur"
                  />
                  <span className="text-white text-xs w-8">{currentStyle.shadowBlur || 0}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Color:</span>
                  <Input
                    type="text"
                    value={currentStyle.shadowColor || "rgba(0,0,0,0.3)"}
                    onChange={(e) => {
                      const blur = currentStyle.shadowBlur || 10;
                      updateStyle({ 
                        shadowColor: e.target.value,
                        boxShadow: `0 4px ${blur}px ${e.target.value}`
                      });
                    }}
                    placeholder="rgba(0,0,0,0.3)"
                    className="flex-1 h-8 text-xs bg-gray-800 border-gray-700"
                    data-testid="input-shadow-color"
                  />
                </div>
              </div>
            )}

            {activeTab === "position" && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 w-32 mx-auto">
                  <div />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateStyle({ marginTop: (currentStyle.marginTop || 0) - 4 })}
                    className="h-8 w-8"
                    data-testid="button-move-up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <div />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateStyle({ marginLeft: (currentStyle.marginLeft || 0) - 4 })}
                    className="h-8 w-8"
                    data-testid="button-move-left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateStyle({ marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 })}
                    className="h-8 w-8"
                    data-testid="button-reset-position"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateStyle({ marginLeft: (currentStyle.marginLeft || 0) + 4 })}
                    className="h-8 w-8"
                    data-testid="button-move-right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateStyle({ marginTop: (currentStyle.marginTop || 0) + 4 })}
                    className="h-8 w-8"
                    data-testid="button-move-down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <div />
                </div>
                <div className="text-center text-gray-400 text-xs">
                  Margen: T:{currentStyle.marginTop || 0} L:{currentStyle.marginLeft || 0}
                </div>
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={currentStyle.imageUrl || ""}
                  onChange={(e) => updateStyle({ imageUrl: e.target.value })}
                  placeholder="URL de la imagen"
                  className="h-8 text-xs bg-gray-800 border-gray-700"
                  data-testid="input-image-url"
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Tamaño:</span>
                  <Slider
                    value={[currentStyle.imageSize || 100]}
                    onValueChange={([val]) => updateStyle({ imageSize: val })}
                    min={20}
                    max={200}
                    step={5}
                    className="flex-1"
                    data-testid="slider-image-size"
                  />
                  <span className="text-white text-xs w-10">{currentStyle.imageSize || 100}%</span>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-gray-400"
            onClick={onClearSelection}
            data-testid="button-clear-selection"
          >
            Deseleccionar
          </Button>
        </>
      )}
    </motion.div>
  );
}
