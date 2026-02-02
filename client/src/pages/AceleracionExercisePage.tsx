import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Upload, Play, Pause, X, FileText, Trash2, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";

// PDF.js will be loaded from CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface PDFFile {
  id: string;
  name: string;
  data: string;
  words?: string[];
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
  const [showExercise, setShowExercise] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [localSpeed, setLocalSpeed] = useState(200);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    setLocalSpeed(velocidadPPM);
  }, [velocidadPPM]);

  useEffect(() => {
    const stored = localStorage.getItem(`aceleracion_pdfs_${itemId}`);
    if (stored) {
      setPdfs(JSON.parse(stored));
    }
  }, [itemId]);

  useEffect(() => {
    localStorage.setItem(`aceleracion_pdfs_${itemId}`, JSON.stringify(pdfs));
  }, [pdfs, itemId]);

  // Load PDF.js from CDN if not loaded
  const loadPdfJs = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const extractTextFromPdf = async (pdfData: string): Promise<string[]> => {
    try {
      const pdfjsLib = await loadPdfJs();
      const loadingTask = pdfjsLib.getDocument(pdfData);
      const pdf = await loadingTask.promise;
      let allText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        allText += pageText + " ";
      }

      // Split into words and filter empty strings
      const extractedWords = allText
        .split(/\s+/)
        .filter(word => word.trim().length > 0);

      return extractedWords;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      return [];
    }
  };

  const handleBack = () => {
    playSound("iphone");
    if (showExercise) {
      setShowExercise(false);
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else if (selectedPdf) {
      setSelectedPdf(null);
      setWords([]);
    } else {
      window.history.back();
    }
  };

  const handleClose = () => {
    playSound("iphone");
    setShowExercise(false);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const pdfData = event.target?.result as string;
      setIsExtracting(true);
      
      const extractedWords = await extractTextFromPdf(pdfData);
      
      const newPdf: PDFFile = {
        id: `pdf_${Date.now()}`,
        name: file.name,
        data: pdfData,
        words: extractedWords,
        createdAt: Date.now()
      };
      setPdfs(prev => [...prev, newPdf]);
      setShowUploader(false);
      setIsExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePdf = (pdfId: string) => {
    setPdfs(prev => prev.filter(p => p.id !== pdfId));
    if (selectedPdf?.id === pdfId) {
      setSelectedPdf(null);
      setWords([]);
    }
  };

  const handleSelectPdf = async (pdf: PDFFile) => {
    playSound("card");
    setSelectedPdf(pdf);
    
    if (pdf.words && pdf.words.length > 0) {
      setWords(pdf.words);
    } else {
      setIsExtracting(true);
      const extractedWords = await extractTextFromPdf(pdf.data);
      setWords(extractedWords);
      // Update stored PDF with words
      setPdfs(prev => prev.map(p => 
        p.id === pdf.id ? { ...p, words: extractedWords } : p
      ));
      setIsExtracting(false);
    }
    setCurrentWordIndex(0);
  };

  const handleStartExercise = () => {
    playSound("iphone");
    setShowExercise(true);
    setCurrentWordIndex(0);
  };

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSpeedChange = (delta: number) => {
    setLocalSpeed(prev => Math.max(50, Math.min(1000, prev + delta)));
  };

  const handlePrevWord = () => {
    setCurrentWordIndex(prev => Math.max(0, prev - 10));
  };

  const handleNextWord = () => {
    setCurrentWordIndex(prev => Math.min(words.length - 1, prev + 10));
  };

  // Word animation effect
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const interval = (60 / localSpeed) * 1000; // ms per word
      
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isPlaying, localSpeed, words.length]);

  const modeTitle = modo === "golpe" ? "Golpe de Vista" : "Desplazamiento";
  const progress = words.length > 0 ? Math.round((currentWordIndex / words.length) * 100) : 0;

  // Exercise view - Golpe de Vista style
  if (showExercise && selectedPdf) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Turquoise-blue gradient header */}
        <header 
          className="px-4 py-3"
          style={{ 
            background: "linear-gradient(135deg, #00C9A7 0%, #00B4D8 100%)"
          }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-lg">
              Acelera al máximo tu Lectura
            </h1>
            <button
              onClick={handleClose}
              className="text-white p-2 rounded-full hover:bg-white/20 transition-colors"
              data-testid="button-close-exercise"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main exercise area */}
        <main className="flex-1 flex flex-col items-center justify-between px-4 py-8">
          {/* Top section - Labels and speed */}
          <div className="text-center">
            <span className="text-blue-500 font-semibold text-sm tracking-wider">
              JUEGO
            </span>
            <h2 className="text-gray-800 font-bold text-2xl mt-1">
              {modeTitle}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => handleSpeedChange(-50)}
                className="text-gray-400 hover:text-gray-600 p-1"
                data-testid="button-speed-down"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-800 font-bold text-2xl min-w-[180px]">
                {localSpeed} palabras /min.
              </span>
              <button
                onClick={() => handleSpeedChange(50)}
                className="text-gray-400 hover:text-gray-600 p-1"
                data-testid="button-speed-up"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center - Word display with vertical line guide */}
          <div className="flex-1 flex items-center justify-center w-full max-w-md">
            <div className="relative w-full h-64 flex flex-col items-center justify-center">
              {/* Top vertical line */}
              <div className="w-0.5 h-16 bg-gray-300" />
              
              {/* Word display */}
              <div className="py-6 px-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.1 }}
                    className="text-gray-800 font-medium text-2xl"
                    data-testid="text-current-word"
                  >
                    {words[currentWordIndex] || "—"}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Bottom vertical line */}
              <div className="w-0.5 h-16 bg-gray-300" />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="w-full max-w-md">
            {/* Progress indicator */}
            <div className="text-center text-gray-400 text-sm mb-4">
              {currentWordIndex + 1} / {words.length} palabras
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4">
              {/* Previous button - gray */}
              <button
                onClick={handlePrevWord}
                className="w-14 h-14 rounded-2xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shadow-md"
                data-testid="button-prev"
              >
                <ChevronsLeft className="w-6 h-6 text-gray-600" />
              </button>

              {/* Continue/Play button - orange */}
              <button
                onClick={togglePlay}
                className="px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                style={{ 
                  background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)"
                }}
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Continuar
                  </>
                )}
              </button>

              {/* Next button - gray */}
              <button
                onClick={handleNextWord}
                className="w-14 h-14 rounded-2xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shadow-md"
                data-testid="button-next"
              >
                <ChevronsRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // PDF preview view - after selecting a PDF
  if (selectedPdf && !showExercise) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Purple header with PDF name */}
        <header 
          className="px-4 py-3"
          style={{ 
            background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
          }}
        >
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
                <Eye className="w-5 h-5 text-white" />
                <h1 className="text-white font-bold text-lg truncate max-w-[200px]">
                  {selectedPdf.name}
                </h1>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowUploader(true)}
              data-testid="button-upload-header"
            >
              <Upload className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 flex flex-col">
          {/* PDF Preview */}
          <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden shadow-inner mb-6">
            <object
              data={selectedPdf.data}
              type="application/pdf"
              className="w-full h-full min-h-[350px]"
            >
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Vista previa no disponible</p>
                  <p className="text-gray-400 text-sm mt-1">{selectedPdf.name}</p>
                </div>
              </div>
            </object>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border-2 border-purple-200 text-purple-600 font-semibold transition-colors hover:bg-purple-50"
              data-testid="button-select-other"
            >
              Seleccionar
            </button>
            <button
              onClick={handleStartExercise}
              disabled={isExtracting || words.length === 0}
              className="flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ 
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
              }}
              data-testid="button-start-exercise"
            >
              {isExtracting ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">Progreso:</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${progress}%`,
                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                }}
              />
            </div>
            <span className="text-purple-600 font-semibold text-sm">{progress}%</span>
          </div>

          {/* Word count info */}
          {words.length > 0 && (
            <p className="text-center text-gray-400 text-sm mt-3">
              {words.length} palabras detectadas
            </p>
          )}
        </main>
      </div>
    );
  }

  // PDF list view - main page style
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Clean header with logo */}
      <header className="px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img 
            src="/logo.png" 
            alt="IQ" 
            className="h-10 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 px-4 py-2">
        {isLoadingConfig && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Cargando...</p>
            </div>
          </div>
        )}

        {!isLoadingConfig && (
          <div className="max-w-md mx-auto">
            {/* Title section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {modeTitle}
                </h1>
                <p className="text-gray-500 text-sm">
                  {modo === "golpe" 
                    ? "Entrena tu campo visual para capturar más palabras"
                    : "Practica la lectura continua siguiendo el ritmo"
                  }
                </p>
              </div>
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Main action button */}
            <button
              onClick={() => pdfs.length > 0 ? null : setShowUploader(true)}
              className="w-full py-4 rounded-full text-white font-bold text-lg shadow-lg transition-transform active:scale-98 mb-6"
              style={{ 
                background: "linear-gradient(135deg, #00C9A7 0%, #00B4D8 100%)"
              }}
              data-testid="button-main-action"
            >
              {pdfs.length > 0 ? "Selecciona un PDF" : "Subir PDF"}
            </button>

            {/* Instructions card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Instrucciones</h3>
                  <p className="text-gray-500 text-sm">
                    Sube un PDF y practica la lectura rápida
                  </p>
                </div>
              </div>
            </div>

            {/* PDF list */}
            {pdfs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">
                  Tus documentos
                </h3>
                {pdfs.map((pdf) => (
                  <motion.div
                    key={pdf.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100"
                    onClick={() => handleSelectPdf(pdf)}
                    data-testid={`card-pdf-${pdf.id}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{pdf.name}</p>
                      <p className="text-xs text-gray-400">
                        {pdf.words?.length || 0} palabras · {new Date(pdf.createdAt).toLocaleDateString()}
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

                {/* Add more button */}
                <button
                  onClick={() => setShowUploader(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-gray-300 hover:text-gray-600 transition-colors"
                  data-testid="button-add-more-pdf"
                >
                  <Upload className="w-4 h-4" />
                  Agregar otro PDF
                </button>
              </div>
            )}

            {/* Config info */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Configuración actual
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Velocidad:</span>
                  <span className="font-semibold text-purple-600">{velocidadPPM} PPM</span>
                </div>
                {modo === "golpe" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Área visible:</span>
                    <span className="font-semibold text-purple-600">{modoGolpePorcentaje}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upload modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isExtracting ? (
                  <>
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">
                      Procesando documento...
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-1">
                      Haz clic para seleccionar
                    </p>
                    <p className="text-gray-400 text-sm">
                      Solo archivos PDF
                    </p>
                  </>
                )}
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
