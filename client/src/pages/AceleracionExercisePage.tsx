import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Upload, Play, Pause, Settings, X, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";

interface PDFFile {
  id: string;
  name: string;
  data: string;
  createdAt: number;
}

export default function AceleracionExercisePage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoria: string; itemId: string; modo: string }>();
  const categoria = params.categoria || "ninos";
  const itemId = params.itemId || "";
  const modo = params.modo || "golpe";
  const { playSound } = useSounds();

  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PDFFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [highlightWidth, setHighlightWidth] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);

  const { data, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["/api/aceleracion", itemId],
    queryFn: async () => {
      const res = await fetch(`/api/aceleracion/${itemId}`);
      if (!res.ok) throw new Error("No encontrado");
      return res.json();
    },
    enabled: !!itemId
  });

  const ejercicio = data?.ejercicio;
  const velocidadPPM = ejercicio?.velocidadPPM || 200;
  const modoGolpePorcentaje = ejercicio?.modoGolpePorcentaje || 50;

  useEffect(() => {
    const stored = localStorage.getItem(`aceleracion_pdfs_${itemId}`);
    if (stored) {
      setPdfs(JSON.parse(stored));
    }
  }, [itemId]);

  useEffect(() => {
    localStorage.setItem(`aceleracion_pdfs_${itemId}`, JSON.stringify(pdfs));
  }, [pdfs, itemId]);

  const handleBack = () => {
    playSound("iphone");
    if (selectedPdf) {
      setSelectedPdf(null);
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      window.history.back();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newPdf: PDFFile = {
        id: `pdf_${Date.now()}`,
        name: file.name,
        data: event.target?.result as string,
        createdAt: Date.now()
      };
      setPdfs(prev => [...prev, newPdf]);
      setShowUploader(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePdf = (pdfId: string) => {
    setPdfs(prev => prev.filter(p => p.id !== pdfId));
    if (selectedPdf?.id === pdfId) {
      setSelectedPdf(null);
    }
  };

  const handleSelectPdf = (pdf: PDFFile) => {
    playSound("card");
    setSelectedPdf(pdf);
    setCurrentPosition(0);
  };

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const step = 100 / (velocidadPPM / 60);
      
      const animate = () => {
        setCurrentPosition(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + step * 0.016;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying, velocidadPPM]);

  const modeTitle = modo === "golpe" ? "Golpe de Vista" : "Desplazamiento";
  const modeIcon = modo === "golpe" ? "👁️" : "📖";
  const modeColor = modo === "golpe" ? "#8a3ffc" : "#06b6d4";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 px-4 py-3" style={{ background: `linear-gradient(to right, ${modeColor}, ${modo === "golpe" ? "#6b2ed9" : "#0891b2"})` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
              data-testid="button-back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{modeIcon}</span>
              <h1 className="text-white font-bold text-lg">
                {selectedPdf ? selectedPdf.name : modeTitle}
              </h1>
            </div>
          </div>
          {!selectedPdf && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowUploader(true)}
              data-testid="button-upload-pdf"
            >
              <Upload className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      <div className="sticky z-40" style={{ top: "56px" }}>
        <svg viewBox="0 0 400 30" className="w-full h-8 -mb-1">
          <path d="M0,0 C100,30 300,30 400,0 L400,30 L0,30 Z" fill="white" />
        </svg>
      </div>

      <main className="flex-1 px-4 py-6">
        {isLoadingConfig && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: `${modeColor}`, borderTopColor: 'transparent' }} />
              <p className="text-gray-500 text-sm">Cargando configuración...</p>
            </div>
          </div>
        )}

        {!isLoadingConfig && (
        <>
        <AnimatePresence mode="wait">
          {!selectedPdf ? (
            <motion.div
              key="pdf-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Selecciona un PDF
                </h2>
                <p className="text-gray-500 text-sm">
                  Sube documentos PDF para practicar la lectura rápida
                </p>
              </div>

              {pdfs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No hay PDFs cargados</p>
                  <Button
                    onClick={() => setShowUploader(true)}
                    className="text-white"
                    style={{ backgroundColor: modeColor }}
                    data-testid="button-add-first-pdf"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir PDF
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pdfs.map((pdf) => (
                    <motion.div
                      key={pdf.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSelectPdf(pdf)}
                      data-testid={`card-pdf-${pdf.id}`}
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${modeColor}20` }}>
                        <FileText className="w-6 h-6" style={{ color: modeColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{pdf.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(pdf.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePdf(pdf.id);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        data-testid={`button-delete-pdf-${pdf.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-8 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuración Actual
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Velocidad:</span>
                    <span className="font-medium" style={{ color: modeColor }}>{velocidadPPM} PPM</span>
                  </div>
                  {modo === "golpe" && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Área visible:</span>
                      <span className="font-medium" style={{ color: modeColor }}>{modoGolpePorcentaje}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <div className="relative w-full h-[60vh] bg-gray-100 rounded-xl overflow-hidden">
                <object
                  data={selectedPdf.data}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500 text-center px-4">
                      No se puede mostrar el PDF directamente.
                      <br />
                      <span className="text-sm">{selectedPdf.name}</span>
                    </p>
                  </div>
                </object>

                {modo === "golpe" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div 
                      className="absolute inset-0 bg-black/85"
                      style={{
                        clipPath: `polygon(
                          0 0, 100% 0, 100% ${currentPosition}%,
                          ${(100 - modoGolpePorcentaje) / 2}% ${currentPosition}%,
                          ${(100 - modoGolpePorcentaje) / 2}% ${Math.min(currentPosition + 15, 100)}%,
                          ${50 + modoGolpePorcentaje / 2}% ${Math.min(currentPosition + 15, 100)}%,
                          ${50 + modoGolpePorcentaje / 2}% ${currentPosition}%,
                          100% ${currentPosition}%, 100% 100%, 0 100%
                        )`
                      }}
                    />
                    <div
                      className="absolute border-4 rounded-lg"
                      style={{
                        borderColor: modeColor,
                        width: `${modoGolpePorcentaje}%`,
                        height: "15%",
                        left: `${(100 - modoGolpePorcentaje) / 2}%`,
                        top: `${currentPosition}%`,
                        boxShadow: `0 0 20px ${modeColor}, inset 0 0 20px ${modeColor}30`
                      }}
                    />
                  </div>
                )}

                {modo === "desplazamiento" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className="absolute w-full h-1"
                      style={{
                        backgroundColor: modeColor,
                        top: `${currentPosition}%`,
                        boxShadow: `0 0 15px ${modeColor}, 0 0 30px ${modeColor}50`
                      }}
                    />
                    <div
                      className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: "50%",
                        top: `${currentPosition}%`,
                        backgroundColor: modeColor,
                        borderRadius: "50%",
                        boxShadow: `0 0 15px ${modeColor}`
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  size="lg"
                  onClick={() => {
                    setCurrentPosition(0);
                    setIsPlaying(false);
                  }}
                  variant="outline"
                  className="border-gray-300"
                  data-testid="button-reset"
                >
                  Reiniciar
                </Button>
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="text-white px-8"
                  style={{ backgroundColor: modeColor }}
                  data-testid="button-play-pause"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-sm text-gray-500">Progreso:</span>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-100"
                    style={{
                      width: `${currentPosition}%`,
                      backgroundColor: modeColor
                    }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: modeColor }}>
                  {Math.round(currentPosition)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
        )}
      </main>

      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploader(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Subir PDF</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">
                  Haz clic para seleccionar
                </p>
                <p className="text-gray-400 text-sm">
                  Solo archivos PDF
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                data-testid="input-file-pdf"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
