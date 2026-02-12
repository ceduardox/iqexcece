import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Upload, Play, Pause, X, FileText, Trash2, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Type, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";
import { apiRequest } from "@/lib/queryClient";
import html2canvas from "html2canvas";
import { LanguageButton } from "@/components/LanguageButton";

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

const MAX_PDF_SIZE_MB = 20;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

const DB_NAME = "aceleracion_pdfs_db";
const DB_VERSION = 1;
const STORE_NAME = "pdfs";

function openPdfDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key: string): Promise<PDFFile[] | undefined> {
  const db = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: PDFFile[]): Promise<void> {
  const db = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
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
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [localSpeed, setLocalSpeed] = useState(600);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  
  // Desplazamiento mode specific states
  const textContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollPositionRef = useRef(0);
  const [totalScrollDistance, setTotalScrollDistance] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Get session info
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("iq_session_id") : null;
  const isPwa = typeof window !== "undefined" 
    ? window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    : false;

  // Mutation to save training results
  const saveResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      return apiRequest("POST", "/api/training-results", resultData);
    }
  });

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
    const loadFromIDB = async () => {
      try {
        const oldStored = localStorage.getItem(`aceleracion_pdfs_${itemId}`);
        if (oldStored) {
          const oldPdfs = JSON.parse(oldStored);
          setPdfs(oldPdfs);
          await idbSet(`aceleracion_pdfs_${itemId}`, oldPdfs);
          localStorage.removeItem(`aceleracion_pdfs_${itemId}`);
          return;
        }
        const stored = await idbGet(`aceleracion_pdfs_${itemId}`);
        if (stored) {
          setPdfs(stored);
        }
      } catch (err) {
        console.error("Error loading PDFs:", err);
      }
    };
    loadFromIDB();
  }, [itemId]);

  useEffect(() => {
    idbSet(`aceleracion_pdfs_${itemId}`, pdfs).catch(err =>
      console.error("Error saving PDFs to IndexedDB:", err)
    );
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setUploadError(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). El máximo permitido es ${MAX_PDF_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const pdfData = event.target?.result as string;
        setIsExtracting(true);
        
        const extractedWords = await extractTextFromPdf(pdfData);
        
        if (extractedWords.length === 0) {
          setUploadError("No se pudo extraer texto del PDF. Verifica que el archivo no esté protegido o sea solo imágenes.");
          setIsExtracting(false);
          return;
        }

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
      } catch (err) {
        console.error("Error processing PDF:", err);
        setUploadError("Error al procesar el PDF. Intenta con otro archivo.");
        setIsExtracting(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Error al leer el archivo. Intenta de nuevo.");
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    setShowResults(false);
    setCurrentWordIndex(0);
    setResultSaved(false);
    setStartTime(Date.now());
    setTotalReadingTime(0);
    // Reset scroll for desplazamiento mode
    setScrollPosition(0);
    scrollPositionRef.current = 0;
    setTotalScrollDistance(0);
  };

  const handleRestartExercise = () => {
    // "Intentar otro test" - goes back to PDF selection
    playSound("iphone");
    setShowResults(false);
    setShowExercise(false);
    setSelectedPdf(null);
    setWords([]);
    setCurrentWordIndex(0);
    setScrollPosition(0);
    scrollPositionRef.current = 0;
    setResultSaved(false);
  };

  const handleBackToSelection = () => {
    // "Volver al inicio" - goes back to game mode selection (Golpe/Desplazamiento)
    playSound("iphone");
    navigate(`/aceleracion/${categoria}/${itemId}`);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSpeedDecrease = () => {
    playSound("iphone");
    if (modo === "desplazamiento") {
      setLocalSpeed(prev => Math.max(200, prev - 50));
    } else {
      setLocalSpeed(prev => Math.max(50, prev - 10));
    }
  };

  const handleSpeedIncrease = () => {
    playSound("iphone");
    if (modo === "desplazamiento") {
      setLocalSpeed(prev => Math.min(1200, prev + 50));
    } else {
      setLocalSpeed(prev => Math.min(920, prev + 10));
    }
  };

  // Share functionality - capture screen as image and share
  const handleShare = async () => {
    if (isSharing || !resultsRef.current) return;
    setIsSharing(true);
    playSound("iphone");
    
    const shareText = `Mi resultado en ${modeTitle} - IQEXPONENCIAL\nVelocidad: ${localSpeed} PPM\n\nEntrena tu cerebro en: https://iqexponencial.app`;
    
    try {
      // Pre-load the logo image as base64 to avoid CORS issues
      const logoImg = resultsRef.current.querySelector('img[alt="IQEXPONENCIAL"]') as HTMLImageElement;
      if (logoImg) {
        try {
          const response = await fetch(logoImg.src);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          logoImg.src = base64;
          // Wait a bit for the image to update
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.log('Could not convert logo to base64');
        }
      }
      
      // Capture the results screen as image
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png', 1.0);
      });
      
      const file = new File([blob], 'resultado-iqexponencial.png', { type: 'image/png' });
      
      // Check if Web Share API with files is supported
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Resultado ${modeTitle} - IQEXPONENCIAL`,
          text: shareText,
          files: [file]
        });
      } else if (navigator.share) {
        // Fallback: share without image
        await navigator.share({
          title: `Resultado ${modeTitle} - IQEXPONENCIAL`,
          text: shareText,
          url: 'https://iqexponencial.app'
        });
      } else {
        // Desktop fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-iqexponencial.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Imagen descargada');
      }
    } catch (err) {
      console.log('Share error:', err);
      // Fallback: try text only
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Resultado ${modeTitle} - IQEXPONENCIAL`,
            text: shareText,
            url: 'https://iqexponencial.app'
          });
        } else {
          await navigator.clipboard.writeText(shareText);
          alert('Resultado copiado al portapapeles');
        }
      } catch {
        console.log('Share cancelled');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle exercise completion
  const handleExerciseComplete = useCallback(() => {
    setIsPlaying(false);
    let readingTime = 0;
    if (startTime) {
      readingTime = Date.now() - startTime;
      setTotalReadingTime(readingTime);
    }
    setShowResults(true);
    
    // Save result to database
    if (!resultSaved) {
      const tipoEjercicio = modo === "golpe" ? "aceleracion_golpe" : "aceleracion_desplazamiento";
      const ejercicioTitulo = modo === "golpe" ? "Golpe de Vista" : "Desplazamiento";
      const performancePercent = Math.min(100, Math.round((localSpeed / 920) * 100));
      
      const stars = Math.max(1, Math.min(5, Math.ceil(performancePercent / 20)));
      saveResultMutation.mutate({
        sessionId: sessionId || null,
        categoria,
        tipoEjercicio,
        ejercicioTitulo,
        puntaje: performancePercent,
        nivelAlcanzado: stars,
        tiempoSegundos: Math.round(readingTime / 1000),
        palabrasPorMinuto: localSpeed,
        respuestasCorrectas: words.length,
        respuestasTotales: words.length,
        datosExtra: JSON.stringify({ palabras: words.length, ppm: localSpeed, estrellas: stars, modo }),
        isPwa
      });
      setResultSaved(true);
    }
  }, [startTime, resultSaved, modo, localSpeed, sessionId, categoria, saveResultMutation, words.length, isPwa]);

  // Calculate scroll distance when text container is rendered (for desplazamiento mode)
  useEffect(() => {
    if (modo === "desplazamiento" && showExercise && textContainerRef.current && viewportRef.current) {
      const textHeight = textContainerRef.current.scrollHeight;
      const vpHeight = viewportRef.current.clientHeight;
      setViewportHeight(vpHeight);
      // Total distance = text height + viewport height (so text scrolls completely out)
      setTotalScrollDistance(textHeight + vpHeight);
    }
  }, [modo, showExercise, words]);

  // Desplazamiento mode scroll animation
  useEffect(() => {
    if (modo !== "desplazamiento" || !isPlaying || words.length === 0 || totalScrollDistance === 0) {
      if (animationRef.current && modo === "desplazamiento") {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Calculate duration based on WPM
    // durationSeconds = (wordCount / wpm) * 60
    const durationMs = (words.length / localSpeed) * 60 * 1000;
    // Pixels per millisecond
    const pixelsPerMs = totalScrollDistance / durationMs;
    
    lastUpdateRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastUpdateRef.current;
      lastUpdateRef.current = currentTime;
      
      const newPosition = scrollPositionRef.current + (pixelsPerMs * elapsed);
      
      if (newPosition >= totalScrollDistance) {
        scrollPositionRef.current = totalScrollDistance;
        setScrollPosition(totalScrollDistance);
        handleExerciseComplete();
        return;
      }
      
      scrollPositionRef.current = newPosition;
      setScrollPosition(newPosition);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [modo, isPlaying, localSpeed, words.length, totalScrollDistance, handleExerciseComplete]);

  // Word animation effect for Golpe de Vista mode
  useEffect(() => {
    if (modo === "desplazamiento" || !isPlaying || words.length === 0) {
      if (animationRef.current && modo !== "desplazamiento") {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const msPerWord = (60 / localSpeed) * 1000;
    lastUpdateRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastUpdateRef.current;
      
      if (elapsed >= msPerWord) {
        lastUpdateRef.current = currentTime;
        
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            handleExerciseComplete();
            return prev;
          }
          return prev + 1;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [modo, isPlaying, localSpeed, words.length, handleExerciseComplete]);

  const modeTitle = modo === "golpe" ? "Golpe de Vista" : "Desplazamiento";
  const progress = words.length > 0 ? Math.round((currentWordIndex / words.length) * 100) : 0;
  const wordsRead = currentWordIndex + 1;

  // Results view - Styled like reference image with charts and animations
  if (showResults && selectedPdf) {
    const readingTimeFormatted = formatTime(totalReadingTime);
    
    // Use the speed the user configured
    const displaySpeed = localSpeed;
    
    // Calculate performance percentage (based on speed - max 1200 for desplazamiento, 920 for golpe)
    const maxSpeed = modo === "desplazamiento" ? 1200 : 920;
    const performancePercent = Math.min(100, Math.round((displaySpeed / maxSpeed) * 100));
    
    // Calculate stars (1-5) based on performance
    const stars = Math.max(1, Math.min(5, Math.ceil(performancePercent / 20)));
    
    // Circle progress animation
    const circumference = 2 * Math.PI * 58; // radius 58
    const strokeDashoffset = circumference - (performancePercent / 100) * circumference;
    
    return (
      <div ref={resultsRef} className="min-h-[100dvh] bg-white flex flex-col relative overflow-hidden">
        {/* Decorative gradient bar at top */}
        <div 
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: "linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)" }}
        />
        
        {/* Decorative background circles */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10" style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }} />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }} />

        <main className="flex-1 px-6 pt-6 pb-8 flex flex-col relative z-10">
          {/* Logo IQEXPONENCIAL */}
          <motion.div 
            className="mx-auto mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="https://iqexponencial.app/api/images/5e3b7dfb-4bda-42bf-b454-c1fe7d5833e3" 
              alt="IQEXPONENCIAL" 
              className="h-20 object-contain"
            />
          </motion.div>

          {/* Check icon */}
          <motion.div 
            className="mx-auto mb-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </motion.div>

          {/* Title with animation */}
          <motion.div 
            className="text-center mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-gray-800">
              {performancePercent >= 50 ? "¡Excelente trabajo!" : "¡Sigue practicando!"}
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            className="text-center text-purple-500 font-semibold text-sm uppercase tracking-wide mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {modeTitle}
          </motion.p>

          {/* Circular progress chart */}
          <motion.div 
            className="relative mx-auto mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative w-36 h-36">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="58"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Animated progress circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="58"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  className="text-4xl font-bold text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {performancePercent}%
                </motion.span>
                <span className="text-gray-400 text-sm">Rendimiento</span>
              </div>
              
              {/* Decorative dot on progress */}
              <motion.div 
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div 
            className="flex justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {/* Words card */}
            <div className="flex-1 max-w-[100px] bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-bold text-purple-600">{wordsRead}</p>
              <p className="text-gray-400 text-xs mt-1">Palabras</p>
            </div>
            
            {/* Speed card */}
            <div className="flex-1 max-w-[100px] bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-800">{displaySpeed}</p>
              <p className="text-gray-400 text-xs mt-1">PPM</p>
            </div>
            
            {/* Time card */}
            <div className="flex-1 max-w-[100px] bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-bold text-cyan-600">{readingTimeFormatted}</p>
              <p className="text-gray-400 text-xs mt-1">Tiempo</p>
            </div>
          </motion.div>

          {/* Star rating */}
          <motion.div 
            className="flex justify-center gap-2 mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.svg
                key={star}
                className={`w-7 h-7 ${star <= stars ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + star * 0.1 }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </motion.svg>
            ))}
          </motion.div>

          {/* Share button */}
          <motion.button
            onClick={handleShare}
            disabled={isSharing}
            className="mx-auto mb-6 flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            data-testid="button-share"
          >
            <Share2 className="w-5 h-5" />
            {isSharing ? 'Compartiendo...' : 'Compartir resultado'}
          </motion.button>

          {/* Action buttons */}
          <motion.div 
            className="mt-auto space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <button
              onClick={handleRestartExercise}
              className="w-full py-3 rounded-xl text-white font-semibold text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)" }}
              data-testid="button-restart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Intentar otro test
            </button>
            <button
              onClick={handleBackToSelection}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-base transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
              data-testid="button-back-selection"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Exercise view - DESPLAZAMIENTO mode (continuous scroll)
  if (showExercise && selectedPdf && modo === "desplazamiento") {
    const fullText = words.join(" ");
    const scrollProgress = totalScrollDistance > 0 ? Math.round((scrollPosition / totalScrollDistance) * 100) : 0;
    
    return (
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-white">
        {/* Header - pill style with gradient */}
        <header className="px-4 py-3 flex-shrink-0">
          <div 
            className="flex items-center justify-between px-4 py-2 rounded-full"
            style={{ background: "linear-gradient(90deg, #06B6D4 0%, #2563EB 100%)" }}
          >
            <span className="text-white font-semibold text-sm">
              Acelera al máximo tu Lectura
            </span>
            <div className="flex items-center gap-2">
              <LanguageButton />
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                data-testid="button-close-exercise"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Center info */}
        <div className="text-center py-4 flex-shrink-0">
          <p className="text-cyan-600 text-xs font-medium tracking-widest uppercase mb-1">
            JUEGO
          </p>
          <h1 className="text-gray-800 font-bold text-2xl mb-2">
            Desplazamiento
          </h1>
          <p className="text-gray-800 font-bold text-2xl">
            {localSpeed} palabras /min.
          </p>
        </div>

        {/* Viewport - fixed height area where text scrolls */}
        <div 
          ref={viewportRef}
          className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden relative"
          style={{ 
            background: "linear-gradient(180deg, #1E3A5F 0%, #0D1F33 100%)"
          }}
        >
          {/* Scrolling text container */}
          <div 
            ref={textContainerRef}
            className="absolute left-0 right-0 px-6 py-8"
            style={{ 
              transform: `translateY(${viewportHeight - scrollPosition}px)`,
              willChange: 'transform'
            }}
          >
            <p className="text-white text-lg leading-relaxed text-center">
              {fullText}
            </p>
          </div>
          
          {/* Reading line indicator */}
          <div 
            className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 opacity-30"
            style={{ background: "linear-gradient(90deg, transparent 0%, #06B6D4 50%, transparent 100%)" }}
          />
        </div>

        {/* Bottom controls - 3 orange buttons */}
        <div className="px-4 pb-6 flex-shrink-0">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${scrollProgress}%`,
                  background: "linear-gradient(90deg, #F97316 0%, #EA580C 100%)"
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-400 text-xs">{words.length} palabras</span>
              <span className="text-orange-500 text-xs font-medium">{scrollProgress}%</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-center gap-3">
            {/* Decrease speed button */}
            <button
              onClick={handleSpeedDecrease}
              className="w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: "#F97316" }}
              data-testid="button-speed-decrease"
            >
              <ChevronsLeft className="w-6 h-6 text-white" />
            </button>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              className="flex-1 max-w-[180px] py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              style={{ background: "#F97316" }}
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pausa</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Reanudar</span>
                </>
              )}
            </button>

            {/* Increase speed button */}
            <button
              onClick={handleSpeedIncrease}
              className="w-14 h-14 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: "#F97316" }}
              data-testid="button-speed-increase"
            >
              <ChevronsRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exercise view - Golpe de Vista style (formal & creative)
  if (showExercise && selectedPdf) {
    return (
      <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)" }}>
        {/* Elegant header with gradient accent */}
        <header className="relative px-4 pt-3 pb-4 flex-shrink-0">
          {/* Decorative gradient line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg, #06B6D4 0%, #8B5CF6 50%, #EC4899 100%)" }}
          />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400 text-[10px] sm:text-xs font-medium tracking-widest uppercase mb-0.5">
                Entrenamiento Visual
              </p>
              <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight">
                {modeTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageButton />
              <button
                onClick={handleClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-all"
                data-testid="button-close-exercise"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Main exercise area */}
        <main className="flex-1 flex flex-col items-center justify-between px-5 pb-8">
          {/* Speed display - clean without buttons */}
          <div className="w-full max-w-sm">
            <div 
              className="rounded-2xl p-4 backdrop-blur border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-gray-400 text-xs text-center mb-2 tracking-wide">
                VELOCIDAD DE LECTURA
              </p>
              <div className="text-center">
                <span className="text-white font-bold text-3xl">{localSpeed}</span>
                <span className="text-gray-400 text-sm ml-2">PPM</span>
              </div>
            </div>
          </div>

          {/* Center - Word display with elegant guide lines */}
          <div className="flex-1 flex items-center justify-center w-full max-w-md py-8">
            <div className="relative w-full flex flex-col items-center justify-center">
              {/* Top guide line with gradient */}
              <div 
                className="w-px h-20 rounded-full"
                style={{ background: "linear-gradient(180deg, transparent 0%, #06B6D4 100%)" }}
              />
              
              {/* Word display container */}
              <div 
                className="relative py-8 px-6 my-4 rounded-xl"
                style={{ 
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "0 0 60px rgba(6, 182, 212, 0.1)"
                }}
              >
                {/* Subtle side accents */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-gradient-to-b from-cyan-500 to-purple-500 opacity-50" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-gradient-to-b from-purple-500 to-pink-500 opacity-50" />
                
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                    className="text-white font-semibold text-3xl tracking-wide block text-center min-w-[200px]"
                    data-testid="text-current-word"
                  >
                    {words[currentWordIndex] || "—"}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Bottom guide line with gradient */}
              <div 
                className="w-px h-20 rounded-full"
                style={{ background: "linear-gradient(180deg, #EC4899 0%, transparent 100%)" }}
              />
            </div>
          </div>

          {/* Bottom controls - professional layout */}
          <div className="w-full max-w-sm space-y-4">
            {/* Progress bar */}
            <div className="relative">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{ 
                    background: "linear-gradient(90deg, #06B6D4 0%, #8B5CF6 100%)",
                    width: `${progress}%`
                  }}
                  initial={false}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 text-xs">{currentWordIndex + 1} de {words.length}</span>
                <span className="text-cyan-400 text-xs font-medium">{progress}%</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-3">
              {/* Decrease speed button */}
              <button
                onClick={handleSpeedDecrease}
                className="w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.08)" }}
                data-testid="button-speed-decrease"
              >
                <ChevronsLeft className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-0.5">-10</span>
              </button>

              {/* Play/Pause button - gradient */}
              <button
                onClick={togglePlay}
                className="flex-1 max-w-[180px] py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                style={{ 
                  background: isPlaying 
                    ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                    : "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)"
                }}
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Iniciar</span>
                  </>
                )}
              </button>

              {/* Increase speed button */}
              <button
                onClick={handleSpeedIncrease}
                className="w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.08)" }}
                data-testid="button-speed-increase"
              >
                <ChevronsRight className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-0.5">+10</span>
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
                <img 
                  src="https://iqexponencial.app/api/images/fcf84e41-37bb-458c-84b1-b5f5ab016009" 
                  alt="Ojo" 
                  className="w-6 h-6 object-contain"
                />
                <h1 className="text-white font-bold text-lg truncate max-w-[200px]">
                  {selectedPdf.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageButton />
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => { setUploadError(null); setShowUploader(true); }}
                data-testid="button-upload-header"
              >
                <Upload className="w-5 h-5" />
              </Button>
            </div>
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
          <LanguageButton />
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://iqexponencial.app/api/images/fcf84e41-37bb-458c-84b1-b5f5ab016009" 
                  alt="Ojo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>

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

            {/* Upload button when no PDFs */}
            {pdfs.length === 0 && (
              <button
                onClick={() => { setUploadError(null); setShowUploader(true); }}
                className="w-full py-3 mb-6 rounded-md border border-gray-300 text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                data-testid="button-upload-pdf"
              >
                <Upload className="w-4 h-4" />
                Subir PDF
              </button>
            )}

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

                {/* Add more button - minimal border radius */}
                <button
                  onClick={() => { setUploadError(null); setShowUploader(true); }}
                  className="w-full py-3 rounded-md border border-gray-300 text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
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
                      Solo archivos PDF (máx. {MAX_PDF_SIZE_MB} MB)
                    </p>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {uploadError}
                </div>
              )}

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
