import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Columns3, Download, Network, PencilRuler, Plus, Save, Share2, Trash2 } from "lucide-react";

type Kind = "mindmap" | "taskboard" | "whiteboard";
type Node = { id: string; x: number; y: number; text: string };
type Edge = { id: string; sourceId: string; targetId: string };
type Task = { id: string; text: string };
type TaskCols = { todo: Task[]; doing: Task[]; done: Task[] };
type Stroke = { id: string; color: string; width: number; points: { x: number; y: number }[] };
type RecordMap = { id: string; title: string; data: string; updatedAt: string };
type Data = { kind: Kind; nodes?: Node[]; edges?: Edge[]; columns?: TaskCols; strokes?: Stroke[] };

const SESSION_KEY = "iq_session_id";
const NODE_W = 170;
const NODE_H = 56;

const colsDefault = (): TaskCols => ({ todo: [], doing: [], done: [] });

function getSessionId() {
  const current = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (current) return current;
  const generated = `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  localStorage.setItem(SESSION_KEY, generated);
  sessionStorage.setItem(SESSION_KEY, generated);
  return generated;
}

function parseData(raw: string): Data {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.kind === "taskboard") return { kind: "taskboard", columns: parsed.columns || colsDefault() };
    if (parsed?.kind === "whiteboard") return { kind: "whiteboard", strokes: Array.isArray(parsed.strokes) ? parsed.strokes : [] };
    if (parsed?.kind === "mindmap") return { kind: "mindmap", nodes: parsed.nodes || [], edges: parsed.edges || [] };
    if (Array.isArray(parsed?.nodes) || Array.isArray(parsed?.edges)) return { kind: "mindmap", nodes: parsed.nodes || [], edges: parsed.edges || [] };
  } catch {
    // ignore
  }
  return { kind: "mindmap", nodes: [], edges: [] };
}

function kindLabel(kind: Kind) {
  if (kind === "mindmap") return "Mapa Mental";
  if (kind === "taskboard") return "Tablero de tareas";
  return "Pizarron";
}

export default function MindMapsPage() {
  const [, setLocation] = useLocation();
  const [shareMatch, shareParams] = useRoute("/mapas-mentales/share/:token");
  const token = shareParams ? shareParams.token : undefined;

  const [sessionId] = useState(getSessionId);
  const [maps, setMaps] = useState<RecordMap[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("Nuevo proyecto");
  const [kind, setKind] = useState<Kind | null>(null);
  const [showChooser, setShowChooser] = useState(true);
  const [stepName, setStepName] = useState("");
  const [stepKind, setStepKind] = useState<Kind | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readonly, setReadonly] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const [cols, setCols] = useState<TaskCols>(colsDefault);
  const [taskText, setTaskText] = useState("");
  const dragTask = useRef<{ from: keyof TaskCols; task: Task } | null>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [penColor, setPenColor] = useState("#7c3aed");
  const [penWidth, setPenWidth] = useState(3);
  const drawingId = useRef<string | null>(null);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  async function loadMaps() {
    const res = await fetch(`/api/mindmaps?sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error("No se pudieron cargar proyectos");
    const data = await res.json();
    setMaps(data.maps || []);
  }

  function openMap(record: RecordMap) {
    const parsed = parseData(record.data);
    setShowChooser(false);
    setActiveId(record.id);
    setTitle(record.title || "Nuevo proyecto");
    setKind(parsed.kind);
    if (parsed.kind === "mindmap") {
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      setCols(colsDefault());
      setStrokes([]);
    } else if (parsed.kind === "taskboard") {
      setCols(parsed.columns || colsDefault());
      setNodes([]);
      setEdges([]);
      setStrokes([]);
    } else {
      setStrokes(parsed.strokes || []);
      setNodes([]);
      setEdges([]);
      setCols(colsDefault());
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        if (shareMatch && token) {
          const res = await fetch(`/api/mindmaps/share/${token}`);
          if (!res.ok) throw new Error("Proyecto compartido no encontrado");
          const data = await res.json();
          setReadonly(true);
          setShowChooser(false);
          openMap(data.map);
          return;
        }
        setReadonly(false);
        setShowChooser(true);
        await loadMaps();
      } catch (e: any) {
        alert(e.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [shareMatch, token]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current || !boardRef.current || readonly || kind !== "mindmap") return;
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragRef.current.dx;
      const y = e.clientY - rect.top - dragRef.current.dy;
      setNodes((prev) =>
        prev.map((n) => (n.id === dragRef.current!.id ? { ...n, x: Math.max(0, Math.min(x, rect.width - NODE_W)), y: Math.max(0, Math.min(y, rect.height - NODE_H)) } : n)),
      );
    };
    const up = () => {
      dragRef.current = null;
      drawingId.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [kind, readonly]);

  function payload(): Data | null {
    if (!kind) return null;
    if (kind === "mindmap") return { kind, nodes, edges };
    if (kind === "taskboard") return { kind, columns: cols };
    return { kind, strokes };
  }

  async function saveProject() {
    if (readonly || !kind) return;
    try {
      setSaving(true);
      const body = { sessionId, title, data: payload() };
      if (activeId) {
        const res = await fetch(`/api/mindmaps/${activeId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("No se pudo actualizar");
      } else {
        const res = await fetch("/api/mindmaps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("No se pudo crear");
        const data = await res.json();
        setActiveId(data.map?.id || null);
      }
      await loadMaps();
    } catch (e: any) {
      alert(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: string) {
    if (readonly || !confirm("Eliminar este proyecto?")) return;
    const res = await fetch(`/api/mindmaps/${id}?sessionId=${encodeURIComponent(sessionId)}`, { method: "DELETE" });
    if (!res.ok) return alert("No se pudo eliminar");
    if (id === activeId) setKind(null);
    await loadMaps();
  }

  async function shareProject(id?: string) {
    if (readonly) return;
    const target = id || activeId;
    if (!target) return;
    const res = await fetch(`/api/mindmaps/${target}/share`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
    if (!res.ok) return alert("No se pudo compartir");
    const data = await res.json();
    setShareUrl(data.shareUrl || "");
    if (data.shareUrl && navigator.clipboard) await navigator.clipboard.writeText(data.shareUrl);
  }

  function newProject() {
    if (readonly) return;
    setShowChooser(true);
    setKind(null);
    setActiveId(null);
    setStepName("");
    setStepKind(null);
    setTitle("Nuevo proyecto");
    setNodes([]);
    setEdges([]);
    setCols(colsDefault());
    setStrokes([]);
    setShareUrl("");
  }

  function handleBack() {
    if (!showChooser && !readonly) {
      newProject();
      return;
    }
    setLocation("/");
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="relative min-h-screen bg-white pb-24 md:pb-8">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-purple-100 px-3 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button onClick={handleBack} className="p-2 rounded-lg border border-purple-100 bg-white text-purple-700"><ArrowLeft className="w-4 h-4" /></button>
          {!showChooser && <input value={title} disabled={readonly} onChange={(e) => setTitle(e.target.value)} className="flex-1 min-w-0 h-10 rounded-xl border border-purple-100 px-3 text-sm font-semibold text-gray-800 bg-white" />}
          {!readonly && !showChooser && <button onClick={saveProject} disabled={saving} className="h-10 px-3 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shrink-0 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.35)" }}><Save className="w-4 h-4" /><span className="hidden sm:inline">{saving ? "Guardando..." : "Guardar"}</span></button>}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 md:p-4 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-3 md:gap-4">
        <aside className="rounded-2xl bg-white border border-purple-100 p-3 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
          {!readonly && <div className="flex items-center gap-2 mb-3"><button onClick={newProject} className="h-9 px-3 rounded-lg border border-purple-200 text-sm font-medium text-purple-700 bg-white flex items-center gap-2"><Plus className="w-4 h-4" />Nuevo</button>{!showChooser && <button onClick={() => { const blob = new Blob([JSON.stringify({ title, ...payload() }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${title || "proyecto"}.json`; a.click(); URL.revokeObjectURL(url); }} className="h-9 px-3 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700 bg-white flex items-center gap-2"><Download className="w-4 h-4" />JSON</button>}</div>}
          <div className="space-y-2 max-h-[40vh] md:max-h-[65vh] overflow-auto pr-1">
            {!readonly && maps.length === 0 && <p className="text-xs text-gray-500">Aun no tienes proyectos creados.</p>}
            {!readonly && maps.map((m) => { const d = parseData(m.data); return <div key={m.id} className={`rounded-xl border p-2 ${activeId === m.id ? "border-purple-400 bg-purple-50" : "border-purple-100 bg-white"}`}><button className="w-full text-left" onClick={() => openMap(m)}><p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p><p className="text-[11px] text-gray-500">{kindLabel(d.kind)} - {new Date(m.updatedAt).toLocaleString("es-BO")}</p></button><div className="mt-2 flex items-center gap-2"><button className="h-7 px-2 rounded-md border border-cyan-200 text-xs text-cyan-700 bg-white flex items-center gap-1" onClick={() => shareProject(m.id)}><Share2 className="w-3.5 h-3.5" />Compartir</button><button className="h-7 px-2 rounded-md border border-rose-200 text-xs text-rose-700 flex items-center gap-1" onClick={() => deleteProject(m.id)}><Trash2 className="w-3.5 h-3.5" />Eliminar</button></div></div>; })}
          </div>
          {shareUrl && <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50/60 p-2"><p className="text-[11px] text-cyan-700 break-all">{shareUrl}</p></div>}
        </aside>

        <section className="rounded-2xl border border-purple-100 bg-white overflow-hidden shadow-[0_10px_30px_rgba(17,24,39,0.09)]">
          {showChooser ? (
            <div className="p-5 md:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs mr-2">1</span>Ingresa el nombre de tu proyecto</p>
              <input value={stepName} onChange={(e) => setStepName(e.target.value)} className="w-full h-11 rounded-xl border border-purple-100 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white mb-5" placeholder="Proyecto de estudio" />
              <p className="text-sm font-semibold text-gray-700 mb-3"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs mr-2">2</span>Elige tu punto de partida:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[{ id: "mindmap" as const, label: "Mapa Mental", Icon: Network }, { id: "taskboard" as const, label: "Tablero de tareas", Icon: Columns3 }, { id: "whiteboard" as const, label: "Pizarron", Icon: PencilRuler }].map((o) => {
                  const selectedClass = o.id === "mindmap"
                    ? "border-cyan-400 bg-gradient-to-br from-cyan-200/80 to-sky-200/80 shadow-[0_10px_24px_rgba(6,182,212,0.28)]"
                    : o.id === "taskboard"
                    ? "border-amber-400 bg-gradient-to-br from-amber-100 to-orange-200/80 shadow-[0_10px_24px_rgba(245,158,11,0.26)]"
                    : "border-violet-400 bg-gradient-to-br from-violet-100 to-fuchsia-200/80 shadow-[0_10px_24px_rgba(139,92,246,0.26)]";

                  const iconClass = o.id === "mindmap"
                    ? "bg-gradient-to-br from-cyan-500 to-sky-600"
                    : o.id === "taskboard"
                    ? "bg-gradient-to-br from-amber-500 to-orange-600"
                    : "bg-gradient-to-br from-violet-500 to-fuchsia-600";

                  return (
                    <button key={o.id} onClick={() => setStepKind(o.id)} className={`rounded-xl border p-3 text-left transition ${stepKind === o.id ? selectedClass : "border-purple-100 bg-white hover:bg-purple-50/40"}`}>
                      <div className={`w-10 h-10 rounded-lg ${iconClass} flex items-center justify-center mb-2`}>
                        <o.Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{o.label}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-end"><button onClick={() => { if (!stepName.trim()) return; if (!stepKind) { alert("Selecciona una opcion para continuar."); return; } setShowChooser(false); setTitle(stepName.trim()); setKind(stepKind); if (stepKind === "mindmap") { setNodes([]); setEdges([]); } if (stepKind === "taskboard") setCols(colsDefault()); if (stepKind === "whiteboard") setStrokes([]); }} disabled={!stepName.trim()} className="h-11 px-8 rounded-full text-white font-bold disabled:opacity-50" style={{ background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 45%, #7c3aed 100%)", boxShadow: "0 10px 24px rgba(79,70,229,0.38)" }}>SIGUIENTE</button></div>
            </div>
          ) : kind === "mindmap" ? (
            <>
              {!readonly && <div className="border-b border-purple-100 p-2 flex flex-wrap items-center gap-2"><button onClick={() => { if (!boardRef.current) return; const rect = boardRef.current.getBoundingClientRect(); const node = { id: `node_${Date.now()}`, x: rect.width / 2 - NODE_W / 2, y: rect.height / 2 - NODE_H / 2, text: `Idea ${nodes.length + 1}` }; setNodes((p) => [...p, node]); setSelectedNodeId(node.id); }} className="h-9 px-3 rounded-lg text-white text-sm font-semibold flex items-center gap-2" style={{ background: "linear-gradient(135deg, #00d9ff 0%, #8a3ffc 100%)" }}><Plus className="w-4 h-4" />Nodo</button><button onClick={() => setConnectFromId(selectedNodeId)} disabled={!selectedNodeId} className="h-9 px-3 rounded-lg border border-purple-200 text-sm font-medium text-purple-700 disabled:opacity-50">{connectFromId ? "Toca nodo destino..." : "Conectar nodos"}</button><button onClick={() => { if (!selectedNodeId) return; setNodes((p) => p.filter((n) => n.id !== selectedNodeId)); setEdges((p) => p.filter((e) => e.sourceId !== selectedNodeId && e.targetId !== selectedNodeId)); setSelectedNodeId(null); }} disabled={!selectedNodeId} className="h-9 px-3 rounded-lg border border-rose-200 text-sm font-medium text-rose-700 disabled:opacity-50">Eliminar nodo</button><input value={selectedNode?.text || ""} disabled={!selectedNode} onChange={(e) => setNodes((p) => p.map((n) => (n.id === selectedNodeId ? { ...n, text: e.target.value } : n)))} className="h-9 min-w-[210px] flex-1 rounded-lg border border-purple-100 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white" placeholder="Texto del nodo" /></div>}
              <div ref={boardRef} className="relative w-full h-[66vh] md:h-[74vh] bg-[radial-gradient(circle,_rgba(124,58,237,0.16)_1px,_transparent_1px)] bg-[length:18px_18px] touch-none">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">{edges.map((e) => { const s = nodes.find((n) => n.id === e.sourceId); const t = nodes.find((n) => n.id === e.targetId); if (!s || !t) return null; return <line key={e.id} x1={s.x + NODE_W / 2} y1={s.y + NODE_H / 2} x2={t.x + NODE_W / 2} y2={t.y + NODE_H / 2} stroke="#7c3aed" strokeWidth="2" strokeOpacity="0.75" />; })}</svg>
                {nodes.map((n) => <button key={n.id} onClick={() => { if (connectFromId && connectFromId !== n.id) { const exists = edges.some((e) => (e.sourceId === connectFromId && e.targetId === n.id) || (e.sourceId === n.id && e.targetId === connectFromId)); if (!exists) setEdges((p) => [...p, { id: `edge_${Date.now()}`, sourceId: connectFromId, targetId: n.id }]); setConnectFromId(null); } setSelectedNodeId(n.id); }} onPointerDown={(e) => { const rect = boardRef.current?.getBoundingClientRect(); if (!rect) return; dragRef.current = { id: n.id, dx: e.clientX - rect.left - n.x, dy: e.clientY - rect.top - n.y }; }} className={`absolute px-3 py-2 rounded-xl border text-left shadow-sm select-none ${selectedNodeId === n.id ? "border-purple-500 bg-purple-50" : "border-purple-200 bg-white/95"}`} style={{ left: n.x, top: n.y, width: NODE_W, minHeight: NODE_H }}><span className="text-xs font-semibold text-gray-700 line-clamp-2">{n.text || "Nodo"}</span></button>)}
              </div>
            </>
          ) : kind === "taskboard" ? (
            <div className="p-3 min-h-[66vh] md:min-h-[74vh]">
              {!readonly && <div className="flex gap-2 mb-3"><input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Nueva tarea" className="h-9 flex-1 rounded-lg border border-purple-100 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white" /><button onClick={() => { if (!taskText.trim()) return; setCols((p) => ({ ...p, todo: [...p.todo, { id: `task_${Date.now()}`, text: taskText.trim() }] })); setTaskText(""); }} className="h-9 px-3 rounded-lg text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #00d9ff 0%, #8a3ffc 100%)" }}>Agregar</button></div>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {([{ id: "todo" as const, title: "Por hacer" }, { id: "doing" as const, title: "En proceso" }, { id: "done" as const, title: "Hecho" }]).map((c) => <div key={c.id} className="rounded-xl border border-purple-100 p-2" onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragTask.current) { const task = dragTask.current.task; const from = dragTask.current.from; setCols((p) => ({ ...p, [from]: p[from].filter((t) => t.id !== task.id), [c.id]: [...p[c.id], task] })); dragTask.current = null; } }}><p className="text-sm font-bold text-purple-700 mb-2">{c.title}</p><div className="space-y-2">{cols[c.id].map((t) => <div key={t.id} draggable={!readonly} onDragStart={() => { dragTask.current = { from: c.id, task: t }; }} className="rounded-lg border border-purple-100 bg-white p-2"><p className="text-sm text-gray-700">{t.text}</p>{!readonly && <button className="mt-2 h-6 px-2 rounded border border-rose-200 text-xs text-rose-700" onClick={() => setCols((p) => ({ ...p, [c.id]: p[c.id].filter((x) => x.id !== t.id) }))}>Eliminar</button>}</div>)}</div></div>)}
              </div>
            </div>
          ) : (
            <div className="min-h-[66vh] md:min-h-[74vh]">
              {!readonly && <div className="border-b border-purple-100 p-2 flex items-center gap-2">{["#7c3aed", "#00bcd4", "#ef4444", "#111827"].map((c) => <button key={c} onClick={() => setPenColor(c)} className={`w-7 h-7 rounded-full border ${penColor === c ? "border-gray-800" : "border-white"}`} style={{ backgroundColor: c }} />)}<input type="range" min={1} max={8} value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))} /><button onClick={() => setStrokes([])} className="h-8 px-3 rounded border border-rose-200 text-rose-700 text-sm">Limpiar</button></div>}
              <div ref={boardRef} className="relative w-full h-[66vh] md:h-[74vh] bg-white touch-none" onPointerDown={(e) => { if (readonly || !boardRef.current) return; const rect = boardRef.current.getBoundingClientRect(); const s = { id: `s_${Date.now()}`, color: penColor, width: penWidth, points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }] }; drawingId.current = s.id; setStrokes((p) => [...p, s]); }} onPointerMove={(e) => { if (readonly || !drawingId.current || !boardRef.current) return; const rect = boardRef.current.getBoundingClientRect(); const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }; setStrokes((p) => p.map((s) => (s.id === drawingId.current ? { ...s, points: [...s.points, pt] } : s))); }} onPointerUp={() => { drawingId.current = null; }}>
                <svg className="absolute inset-0 w-full h-full">{strokes.map((s) => <polyline key={s.id} fill="none" stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} />)}</svg>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


