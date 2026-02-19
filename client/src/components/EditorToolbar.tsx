import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Palette, Move, Image, Square, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Type, Monitor, Smartphone, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useIsVideo } from "@/components/VideoBackground";

export type DeviceMode = "mobile" | "desktop";

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
  paddingTop?: number;
  paddingBottom?: number;
  imageUrl?: string;
  imageSize?: number;
  textColor?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  borderRadius?: number;
  buttonText?: string;
  iconSize?: number;
  cardHeight?: number;
  labelText?: string;
  sectionHeight?: number;
  spacerHeight?: number;
  visible?: boolean;
}

export function getDeviceKey(elementId: string, device: DeviceMode): string {
  return device === "desktop" ? `${elementId}-desktop` : elementId;
}

export function resolveStyle(styles: PageStyles, elementId: string, isMobile: boolean): ElementStyle {
  const baseStyle = styles[elementId] || {};
  const desktopStyle = styles[`${elementId}-desktop`] || {};
  if (isMobile) return baseStyle;
  const merged = { ...baseStyle, ...desktopStyle };
  return merged;
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
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
}

export function EditorToolbar({ 
  selectedElement, 
  styles, 
  onStyleChange, 
  onSave, 
  onClose,
  onClearSelection,
  deviceMode,
  onDeviceModeChange
}: EditorToolbarProps) {
  const [activeTab, setActiveTab] = useState<"background" | "shadow" | "position" | "image" | "text">("background");
  const [toolbarPosition, setToolbarPosition] = useState<"bottom" | "top">("bottom");
  const effectiveKey = selectedElement ? getDeviceKey(selectedElement, deviceMode) : null;
  const currentStyle = effectiveKey ? (styles[effectiveKey] || {}) : {};
  const previewIsVideo = useIsVideo(currentStyle.imageUrl);
  
  const updateStyle = (updates: Partial<ElementStyle>) => {
    if (!effectiveKey) return;
    onStyleChange(effectiveKey, { ...currentStyle, ...updates });
  };

  const tabs = [
    { id: "background", icon: Palette, label: "Fondo" },
    { id: "shadow", icon: Square, label: "Sombra" },
    { id: "position", icon: Move, label: "Posición" },
    { id: "image", icon: Image, label: "Imagen" },
    { id: "text", icon: Type, label: "Texto" },
  ] as const;

  const positionClasses = toolbarPosition === "bottom" 
    ? "bottom-4 left-1/2 -translate-x-1/2" 
    : "top-4 left-1/2 -translate-x-1/2";

  return (
    <motion.div
      initial={{ opacity: 0, y: toolbarPosition === "bottom" ? 50 : -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: toolbarPosition === "bottom" ? 50 : -50 }}
      className={`fixed ${positionClasses} z-50 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-cyan-500/30 shadow-2xl p-3 sm:p-4 w-[95vw] sm:w-auto sm:min-w-[340px] max-w-[400px]`}
      data-testid="editor-toolbar"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-white font-medium text-xs sm:text-sm truncate flex-1">
          {selectedElement ? `${selectedElement}` : "Selecciona elemento"}
        </span>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setToolbarPosition(p => p === "bottom" ? "top" : "bottom")} 
            className="text-cyan-400 hover:text-cyan-300 h-7 w-7 sm:h-8 sm:w-8" 
            title={toolbarPosition === "bottom" ? "Mover arriba" : "Mover abajo"}
            data-testid="button-move-toolbar"
          >
            {toolbarPosition === "bottom" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onSave} className="text-green-400 hover:text-green-300 h-7 w-7 sm:h-8 sm:w-8" data-testid="button-save-styles">
            <Save className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8" data-testid="button-close-editor">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-2 sm:mb-3">
        <span className="text-gray-400 text-[10px] mr-1">Vista:</span>
        <Button
          size="sm"
          variant={deviceMode === "mobile" ? "default" : "ghost"}
          className={`h-6 px-2 text-[10px] ${deviceMode === "mobile" ? "bg-cyan-600" : "text-gray-400"}`}
          onClick={() => onDeviceModeChange("mobile")}
          data-testid="device-mobile"
        >
          <Smartphone className="w-3 h-3 mr-1" />
          Móvil
        </Button>
        <Button
          size="sm"
          variant={deviceMode === "desktop" ? "default" : "ghost"}
          className={`h-6 px-2 text-[10px] ${deviceMode === "desktop" ? "bg-cyan-600" : "text-gray-400"}`}
          onClick={() => onDeviceModeChange("desktop")}
          data-testid="device-desktop"
        >
          <Monitor className="w-3 h-3 mr-1" />
          PC
        </Button>
        <span className="text-gray-500 text-[9px] ml-1">{deviceMode === "mobile" ? "Editando móvil" : "Editando PC"}</span>
      </div>

      {selectedElement && (
        <>
          <div className="flex gap-1 mb-2 sm:mb-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`${activeTab === tab.id ? "bg-cyan-600" : "text-gray-400"} h-7 px-2 text-[10px] whitespace-nowrap flex-shrink-0`}
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
                      className="flex-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
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
                      className="h-8 text-xs bg-gray-800 border-gray-700 text-white"
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
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={currentStyle.imageUrl || ""}
                      onChange={(e) => updateStyle({ imageUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="h-8 text-xs bg-gray-800 border-gray-700 text-white"
                      data-testid="input-bg-image-url"
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
                        data-testid="slider-bg-image-size"
                      />
                      <span className="text-white text-xs w-10">{currentStyle.imageSize || 100}%</span>
                    </div>
                  </div>
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
                    className="flex-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
                    data-testid="input-shadow-color"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Borde:</span>
                  <Slider
                    value={[currentStyle.borderRadius || 0]}
                    onValueChange={([val]) => updateStyle({ borderRadius: val })}
                    min={0}
                    max={50}
                    step={1}
                    className="flex-1"
                    data-testid="slider-border-radius"
                  />
                  <span className="text-white text-xs w-10">{currentStyle.borderRadius || 0}px</span>
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
                {(selectedElement?.startsWith("card-") || selectedElement?.startsWith("title-") || selectedElement?.startsWith("btn-") || selectedElement?.startsWith("desc-") || selectedElement?.startsWith("icon-")) && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                    <span className="text-gray-400 text-xs w-16">Altura:</span>
                    <Slider
                      value={[currentStyle.cardHeight || 120]}
                      onValueChange={([val]) => updateStyle({ cardHeight: val })}
                      min={60}
                      max={600}
                      step={5}
                      className="flex-1"
                      data-testid="slider-card-height"
                    />
                    <span className="text-white text-xs w-10">{currentStyle.cardHeight || 120}px</span>
                  </div>
                )}
                {(selectedElement?.startsWith("spacer-") || selectedElement?.includes("section") || selectedElement === "hero-section") && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-16">Altura:</span>
                      <Slider
                        value={[currentStyle.sectionHeight || (selectedElement?.startsWith("spacer-") ? 20 : 200)]}
                        onValueChange={([val]) => updateStyle({ sectionHeight: val })}
                        min={0}
                        max={1500}
                        step={10}
                        className="flex-1"
                        data-testid="slider-section-height"
                      />
                      <span className="text-white text-xs w-10">{currentStyle.sectionHeight || (selectedElement?.startsWith("spacer-") ? 20 : 200)}px</span>
                    </div>
                    {selectedElement?.startsWith("spacer-") && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-16">Visible:</span>
                        <Button
                          size="sm"
                          variant={currentStyle.visible !== false ? "default" : "outline"}
                          onClick={() => updateStyle({ visible: true })}
                          className="flex-1 text-xs"
                          data-testid="spacer-visible"
                        >
                          Sí
                        </Button>
                        <Button
                          size="sm"
                          variant={currentStyle.visible === false ? "default" : "outline"}
                          onClick={() => updateStyle({ visible: false })}
                          className="flex-1 text-xs"
                          data-testid="spacer-hidden"
                        >
                          Oculto
                        </Button>
                      </div>
                    )}
                    <p className="text-gray-500 text-[9px]">
                      <Minus className="w-3 h-3 inline mr-1" />
                      Configura {deviceMode === "mobile" ? "móvil" : "PC"} por separado
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-2">
                <Input
                  type="text"
                  value={currentStyle.imageUrl || ""}
                  onChange={(e) => updateStyle({ imageUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="h-8 text-xs bg-gray-800 border-gray-700 text-white"
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
                {(selectedElement?.startsWith("icon-btn-") || selectedElement?.startsWith("card-") || selectedElement?.startsWith("icon-")) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-16">Icono:</span>
                    <Slider
                      value={[currentStyle.iconSize || 50]}
                      onValueChange={([val]) => updateStyle({ iconSize: val })}
                      min={10}
                      max={150}
                      step={2}
                      className="flex-1"
                      data-testid="slider-icon-size"
                    />
                    <span className="text-white text-xs w-12">{currentStyle.iconSize || 50}px</span>
                  </div>
                )}
                {currentStyle.imageUrl && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                    {previewIsVideo ? (
                      <video 
                        src={currentStyle.imageUrl} 
                        autoPlay loop muted playsInline
                        className="w-full h-20 object-cover rounded mb-1"
                      />
                    ) : (
                      <img 
                        src={currentStyle.imageUrl} 
                        alt="Preview" 
                        className="w-full h-20 object-cover rounded mb-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="truncate">{currentStyle.imageUrl}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Texto:</span>
                  <textarea
                    value={currentStyle.buttonText ?? ""}
                    onChange={(e) => {
                      updateStyle({ buttonText: e.target.value });
                    }}
                    placeholder="Vacío = usa traducción automática"
                    className="flex-1 min-h-[32px] text-xs bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 resize-y"
                    rows={2}
                    data-testid="input-button-text"
                  />
                  {currentStyle.buttonText && (
                    <button
                      onClick={() => {
                        const { buttonText, ...rest } = currentStyle;
                        if (effectiveKey) onStyleChange(effectiveKey, rest);
                      }}
                      className="text-red-400 text-xs px-1 hover:text-red-300"
                      title="Limpiar texto"
                      data-testid="button-clear-text"
                    >✕</button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Color:</span>
                  <Input
                    type="color"
                    value={currentStyle.textColor || "#000000"}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                    className="w-12 h-8 p-0 border-0"
                    data-testid="input-text-color"
                  />
                  <Input
                    type="text"
                    value={currentStyle.textColor || ""}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                    placeholder="#000000"
                    className="flex-1 h-8 text-xs bg-gray-800 border-gray-700 text-white"
                    data-testid="input-text-color-hex"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-16">Tamaño:</span>
                  <Slider
                    value={[currentStyle.fontSize || 16]}
                    onValueChange={([val]) => updateStyle({ fontSize: val })}
                    min={10}
                    max={72}
                    step={1}
                    className="flex-1"
                    data-testid="slider-font-size"
                  />
                  <span className="text-white text-xs w-10">{currentStyle.fontSize || 16}px</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={currentStyle.textAlign === "left" ? "default" : "outline"}
                    onClick={() => updateStyle({ textAlign: "left" })}
                    className="flex-1 text-xs"
                    data-testid="btn-align-left"
                  >
                    Izquierda
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStyle.textAlign === "center" ? "default" : "outline"}
                    onClick={() => updateStyle({ textAlign: "center" })}
                    className="flex-1 text-xs"
                    data-testid="btn-align-center"
                  >
                    Centro
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStyle.textAlign === "right" ? "default" : "outline"}
                    onClick={() => updateStyle({ textAlign: "right" })}
                    className="flex-1 text-xs"
                    data-testid="btn-align-right"
                  >
                    Derecha
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={currentStyle.fontWeight === "normal" ? "default" : "outline"}
                    onClick={() => updateStyle({ fontWeight: "normal" })}
                    className="flex-1 text-xs"
                    data-testid="btn-weight-normal"
                  >
                    Normal
                  </Button>
                  <Button
                    size="sm"
                    variant={currentStyle.fontWeight === "bold" ? "default" : "outline"}
                    onClick={() => updateStyle({ fontWeight: "bold" })}
                    className="flex-1 text-xs font-bold"
                    data-testid="btn-weight-bold"
                  >
                    Negrita
                  </Button>
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
