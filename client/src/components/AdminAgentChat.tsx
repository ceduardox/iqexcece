import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Trash2, Bot, User, Loader2, AlertCircle, X, Image, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Search, FileText, Database, Globe, Undo2, ScrollText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentStep {
  type: string;
  description: string;
  status: "running" | "success" | "error" | "warning";
  detail?: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  filesModified?: string[] | null;
  steps?: AgentStep[] | null;
  createdAt?: string | null;
}

interface AdminAgentChatProps {
  adminToken: string;
}

function StepIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5";
  switch (type) {
    case "readFile": return <FileText className={cls} />;
    case "searchFiles": return <Search className={cls} />;
    case "editFile": return <FileText className={cls} />;
    case "writeFile": return <FileText className={cls} />;
    case "listFiles": return <FolderOpen className={cls} />;
    case "httpRequest": return <Globe className={cls} />;
    case "dbQuery": return <Database className={cls} />;
    case "undoEdit": return <Undo2 className={cls} />;
    case "readLogs": return <ScrollText className={cls} />;
    default: return <FileText className={cls} />;
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "error":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case "warning":
      return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
    default:
      return <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
  }
}

function StepsAccordion({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(false);
  const successCount = steps.filter(s => s.status === "success").length;
  const errorCount = steps.filter(s => s.status === "error").length;
  const warningCount = steps.filter(s => s.status === "warning").length;

  return (
    <div className="mt-2 border border-white/10 rounded-lg overflow-hidden" data-testid="steps-accordion">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-white/5 transition-colors"
        data-testid="button-toggle-steps"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-white/50" /> : <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
        <span className="text-white/70 font-medium">Proceso ({steps.length} pasos)</span>
        <div className="flex items-center gap-1.5 ml-auto">
          {successCount > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{successCount}</span>
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-0.5 text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              <span>{warningCount}</span>
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-0.5 text-red-400">
              <XCircle className="w-3 h-3" />
              <span>{errorCount}</span>
            </span>
          )}
        </div>
      </button>
      {expanded && (
        <div className="divide-y divide-white/5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs" data-testid={`step-${i}`}>
              <StatusBadge status={step.status} />
              <span className="text-white/40">
                <StepIcon type={step.type} />
              </span>
              <span className="text-white/70 flex-1 truncate">{step.description}</span>
              {step.detail && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  step.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                  step.status === "error" ? "bg-red-500/10 text-red-400" :
                  step.status === "warning" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>
                  {step.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAgentChat({ adminToken }: AdminAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<AgentStep[]>([]);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const playNotification = useCallback(() => {
    try {
      const audio = new Audio("/iphone.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingSteps]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/admin/agent/history", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
  };

  const clearHistory = async () => {
    try {
      await fetch("/api/admin/agent/history", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setMessages([]);
    } catch {}
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          setPastedImage(base64);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pastedImage) || loading) return;
    const userMsg = input.trim();
    setInput("");
    setError("");
    setLoadingSteps([]);

    const newUserMsg: Message = { role: "user", content: userMsg || "(imagen)", image: pastedImage || undefined };
    setMessages((prev) => [...prev, newUserMsg]);
    const currentImage = pastedImage;
    setPastedImage(null);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const body: any = { message: userMsg || "Analiza esta imagen", history };
      if (currentImage) {
        body.image = currentImage;
      }

      const res = await fetch("/api/admin/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error communicating with agent");
        return;
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
        filesModified: data.filesModified,
        steps: data.steps && data.steps.length > 0 ? data.steps : null,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      playNotification();
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
      setLoadingSteps([]);
      textareaRef.current?.focus();
    }
  };

  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lines = part.split("\n");
        const lang = lines[0].replace("```", "").trim();
        const code = lines.slice(1, -1).join("\n");
        return (
          <div key={i} className="my-2 rounded-lg overflow-hidden">
            {lang && (
              <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1">
                {lang}
              </div>
            )}
            <pre className="bg-gray-900 text-green-400 text-xs p-3 overflow-x-auto whitespace-pre-wrap break-all">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      const segments = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i}>
          {segments.map((seg, j) => {
            if (seg.startsWith("**") && seg.endsWith("**")) {
              return (
                <strong key={j} className="text-white font-semibold">
                  {seg.slice(2, -2)}
                </strong>
              );
            }
            return seg.split("\n").map((line, k, arr) => (
              <span key={`${j}-${k}`}>
                {line}
                {k < arr.length - 1 && <br />}
              </span>
            ));
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Agente IA</h2>
          <span className="text-xs text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
        <Button
          onClick={clearHistory}
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400"
          data-testid="button-clear-agent-history"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3">
            <Bot className="w-12 h-12" />
            <p className="text-center text-sm max-w-xs">
              Soy tu agente de desarrollo. Puedo leer, analizar, modificar archivos, probar endpoints y verificar datos en la base de datos.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "Analiza la estructura del proyecto",
                "Busca donde se usa 'adminToken' en el codigo",
                "Lee GestionPage.tsx y explicame que hace",
                "Cambia el titulo de la pagina principal a 'Mi App'",
                "Muestra el schema de la base de datos",
                "Consulta cuantos usuarios hay en la base de datos",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-white/60 transition-colors"
                  data-testid={`suggestion-${suggestion.slice(0, 10)}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600/30 text-white"
                  : "bg-white/5 text-white/80"
              }`}
            >
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Imagen pegada"
                  className="max-w-full max-h-48 rounded-md mb-2 object-contain"
                  data-testid={`msg-image-${i}`}
                />
              )}
              {msg.role === "assistant" ? formatContent(msg.content) : (msg.content !== "(imagen)" ? msg.content : null)}
              {msg.steps && msg.steps.length > 0 && (
                <StepsAccordion steps={msg.steps} />
              )}
              {msg.filesModified && msg.filesModified.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-emerald-400 font-medium mb-1">
                    Archivos modificados:
                  </p>
                  {msg.filesModified.map((f, j) => (
                    <span
                      key={j}
                      className="inline-block text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded mr-1 mb-1"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 max-w-[85%]">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-xs text-white/40">Analizando y ejecutando...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {pastedImage && (
        <div className="mb-2 relative inline-block">
          <img
            src={pastedImage}
            alt="Preview"
            className="max-h-32 rounded-lg border border-white/20 object-contain"
            data-testid="pasted-image-preview"
          />
          <button
            onClick={() => setPastedImage(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
            data-testid="button-remove-pasted-image"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onPaste={handlePaste}
            placeholder="Escribe un mensaje o pega una imagen (Ctrl+V)..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-md px-3 py-2 text-sm resize-none min-h-[38px] max-h-[120px] focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            disabled={loading}
            rows={1}
            data-testid="input-agent-message"
          />
          {pastedImage && (
            <Image className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          )}
        </div>
        <Button
          onClick={sendMessage}
          disabled={loading || (!input.trim() && !pastedImage)}
          className="bg-emerald-600 min-h-[38px]"
          data-testid="button-send-agent"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
