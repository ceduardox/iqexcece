import { useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; content: string };

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
  const title = params.get("title") || "Asesor IA";
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hola, soy tu asesor IA. ¿En qué puedo ayudarte?" },
  ]);
  const [profileName, setProfileName] = useState("");
  const [profileWhatsapp, setProfileWhatsapp] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sessionId = useMemo(() => getWidgetSessionId(site), [site]);

  const startChat = async () => {
    const name = profileName.trim();
    const whatsapp = profileWhatsapp.trim();
    if (!name || !whatsapp || profileSaving) return;

    setProfileSaving(true);
    try {
      await fetch("/api/asesor/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          site,
          name,
          whatsapp,
        }),
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
        body: JSON.stringify({
          message: text,
          sessionId,
          history: nextHistory,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "No se pudo responder." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión con el servidor." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="h-screen w-full bg-white text-gray-900 flex flex-col">
      <header className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-cyan-500 to-violet-600 text-white flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        <div className="font-semibold text-sm">{title}</div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {!profileReady && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
            <p className="text-sm text-gray-700 font-semibold">Antes de empezar, déjanos tus datos:</p>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
            <input
              value={profileWhatsapp}
              onChange={(e) => setProfileWhatsapp(e.target.value)}
              placeholder="WhatsApp (con código país)"
              className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
            <button
              onClick={startChat}
              disabled={profileSaving || !profileName.trim() || !profileWhatsapp.trim()}
              className="w-full h-10 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {profileSaving ? "Guardando..." : "Iniciar chat"}
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[86%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-violet-600 text-white" : "mr-auto bg-white border border-gray-200 text-gray-800"}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-white border border-gray-200 text-gray-600 rounded-xl px-3 py-2 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Pensando...
          </div>
        )}
      </main>

      <footer className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
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
          <button
            onClick={sendMessage}
            disabled={!profileReady || loading || !input.trim()}
            className="h-10 px-3 rounded-lg bg-violet-600 text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
