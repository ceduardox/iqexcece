import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader2, User, Headphones, Paperclip, Download, ExternalLink } from "lucide-react";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  attachment?: { url: string; name: string; type: string };
};

type CountryDial = { iso: string; name: string; dial: string; flag: string };

const AMERICAS_DIAL_CODES: CountryDial[] = [
  { iso: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { iso: "BO", name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { iso: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { iso: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { iso: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { iso: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { iso: "CU", name: "Cuba", dial: "+53", flag: "🇨🇺" },
  { iso: "DO", name: "Rep. Dominicana", dial: "+1", flag: "🇩🇴" },
  { iso: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { iso: "SV", name: "El Salvador", dial: "+503", flag: "🇸🇻" },
  { iso: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { iso: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { iso: "GY", name: "Guyana", dial: "+592", flag: "🇬🇾" },
  { iso: "HT", name: "Haití", dial: "+509", flag: "🇭🇹" },
  { iso: "HN", name: "Honduras", dial: "+504", flag: "🇭🇳" },
  { iso: "JM", name: "Jamaica", dial: "+1", flag: "🇯🇲" },
  { iso: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { iso: "NI", name: "Nicaragua", dial: "+505", flag: "🇳🇮" },
  { iso: "PA", name: "Panamá", dial: "+507", flag: "🇵🇦" },
  { iso: "PY", name: "Paraguay", dial: "+595", flag: "🇵🇾" },
  { iso: "PE", name: "Perú", dial: "+51", flag: "🇵🇪" },
  { iso: "PR", name: "Puerto Rico", dial: "+1", flag: "🇵🇷" },
  { iso: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦" },
  { iso: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { iso: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
];

function getWidgetSessionId(site: string) {
  const key = `asesor_widget_session_${site}`;
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `w_${site}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export default function ChatWidgetPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const site = (params.get("site") || "external").toLowerCase().replace(/[^a-z0-9_-]/g, "");

  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hola, soy tu asesor. ¿En qué puedo ayudarte?" },
  ]);
  const [profileName, setProfileName] = useState("");
  const [selectedDialIso, setSelectedDialIso] = useState("BO");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sessionId = useMemo(() => getWidgetSessionId(site), [site]);
  const selectedDial = useMemo(
    () => AMERICAS_DIAL_CODES.find((c) => c.iso === selectedDialIso) || AMERICAS_DIAL_CODES[0],
    [selectedDialIso],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const code = String(d?.country_code || "").toUpperCase();
        const found = AMERICAS_DIAL_CODES.find((c) => c.iso === code);
        if (found) setSelectedDialIso(found.iso);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const startChat = async () => {
    const name = profileName.trim();
    const localDigits = profileWhatsapp.replace(/[^\d]/g, "");
    const whatsapp = `${selectedDial.dial}${localDigits}`;
    if (!name || !localDigits || profileSaving) return;

    setProfileSaving(true);
    try {
      await fetch("/api/asesor/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, site, name, whatsapp }),
      });
      setProfileReady(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } finally {
      setProfileSaving(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: ChatMsg = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/asesor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, history: nextHistory }),
      });
      const data = await res.json();
      if (data.reply) setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      else setMessages((prev) => [...prev, { role: "assistant", content: data.error || "No se pudo responder." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión con el servidor." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handlePickFile = () => {
    if (!profileReady || uploadingFile) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    const maxBytes = 7 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessages((prev) => [...prev, { role: "assistant", content: "El archivo supera el límite de 7MB." }]);
      return;
    }

    const allowed = [
      file.type.startsWith("image/"),
      file.type === "application/pdf",
      file.type.startsWith("text/"),
      file.type === "application/msword",
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file.type.startsWith("application/vnd.ms-"),
    ].some(Boolean);

    if (!allowed) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Solo se permiten imágenes o documentos." }]);
      return;
    }

    const reader = new FileReader();
    setUploadingFile(true);
    reader.onload = async () => {
      try {
        const res = await fetch("/api/asesor/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            site,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            data: String(reader.result || ""),
          }),
        });
        const data = await res.json();
        if (res.ok && data?.url) {
          const fullUrl = data.url.startsWith("http") ? data.url : `${window.location.origin}${data.url}`;
          setMessages((prev) => [
            ...prev,
            { role: "user", content: `Archivo adjunto: ${file.name}`, attachment: { url: fullUrl, name: file.name, type: file.type || "application/octet-stream" } },
          ]);
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content: data?.error || "No se pudo subir el archivo." }]);
        }
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión al subir archivo." }]);
      } finally {
        setUploadingFile(false);
      }
    };
    reader.onerror = () => {
      setUploadingFile(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "No se pudo leer el archivo." }]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen w-full bg-white text-gray-900 flex flex-col">
      <main className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {!profileReady && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
            <p className="text-sm text-gray-700 font-semibold">Antes de empezar, déjanos tus datos:</p>
            <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Tu nombre" className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <select value={selectedDialIso} onChange={(e) => setSelectedDialIso(e.target.value)} className="h-10 rounded-lg border border-gray-300 px-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-300">
                {AMERICAS_DIAL_CODES.map((c) => (
                  <option key={c.iso} value={c.iso}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <div className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 flex items-center text-sm text-gray-600">{selectedDial.flag} {selectedDial.name} ({selectedDial.dial})</div>
            </div>
            <input value={profileWhatsapp} onChange={(e) => setProfileWhatsapp(e.target.value)} placeholder="Número de WhatsApp" className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-300" />
            <button onClick={startChat} disabled={profileSaving || !profileName.trim() || !profileWhatsapp.trim()} className="w-full h-10 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">
              {profileSaving ? "Guardando..." : "Iniciar chat"}
            </button>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm flex items-start gap-2 ${m.role === "user" ? "ml-auto bg-violet-600 text-white" : "mr-auto bg-white border border-gray-200 text-gray-800"}`}>
            <span className={`mt-0.5 ${m.role === "user" ? "text-violet-100" : "text-violet-500"}`}>{m.role === "user" ? <User className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}</span>
            <div className="min-w-0">
              <div>{m.content}</div>
              {m.attachment && (
                <div className={`mt-2 rounded-lg border p-2 ${m.role === "user" ? "border-violet-300/40 bg-violet-500/20" : "border-gray-200 bg-white"}`}>
                  {m.attachment.type.startsWith("image/") ? (
                    <img src={m.attachment.url} alt={m.attachment.name} className="w-full max-h-44 object-contain rounded-md bg-white" />
                  ) : m.attachment.type === "application/pdf" ? (
                    <iframe src={m.attachment.url} title={m.attachment.name} className="w-full h-40 rounded-md bg-white" />
                  ) : null}
                  <div className="mt-2 text-xs break-all">{m.attachment.name}</div>
                  <div className="mt-2 flex gap-2">
                    <a href={m.attachment.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline"><ExternalLink className="w-3 h-3" /> Ver</a>
                    <a href={m.attachment.url} download={m.attachment.name} className="inline-flex items-center gap-1 text-xs underline"><Download className="w-3 h-3" /> Descargar</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mr-auto bg-white border border-gray-200 text-gray-600 rounded-xl px-3 py-2 text-sm flex items-center gap-2">
            <Headphones className="w-4 h-4 text-violet-500" />
            <Loader2 className="w-4 h-4 animate-spin" />
            Pensando...
          </div>
        )}

        {uploadingFile && (
          <div className="mr-auto bg-white border border-gray-200 text-gray-600 rounded-xl px-3 py-2 text-sm flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-violet-500" />
            <Loader2 className="w-4 h-4 animate-spin" />
            Subiendo archivo...
          </div>
        )}
      </main>

      <footer className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx" className="hidden" onChange={handleFileChange} />
          <button onClick={handlePickFile} disabled={!profileReady || uploadingFile} className="h-10 w-10 rounded-lg border border-gray-300 text-gray-600 grid place-items-center disabled:opacity-50" title="Adjuntar archivo (máx 7MB)">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && profileReady) sendMessage();
            }}
            placeholder="Escribe tu mensaje..."
            className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            disabled={!profileReady}
          />
          <button onClick={sendMessage} disabled={!profileReady || loading || uploadingFile || !input.trim()} className="h-10 px-3 rounded-lg bg-violet-600 text-white disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
