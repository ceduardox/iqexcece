import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, Columns3, Download, ImagePlus, Lightbulb, Network, PencilRuler, Plus, RotateCw, Save, Settings2, Share2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type Kind = "mindmap" | "taskboard" | "whiteboard";
type Node = { id: string; x: number; y: number; text: string; imageUrl?: string };
type Edge = { id: string; sourceId: string; targetId: string };
type TaskChecklistItem = { id: string; text: string; done: boolean };
type Task = { id: string; text: string; checklist?: TaskChecklistItem[] };
type TaskCol = { id: string; title: string; tasks: Task[] };
type TaskCols = TaskCol[];
type Stroke = { id: string; color: string; width: number; points: { x: number; y: number }[] };
type RecordMap = { id: string; title: string; data: string; updatedAt: string };
type Data = { kind: Kind; nodes?: Node[]; edges?: Edge[]; columns?: TaskCols; strokes?: Stroke[] };
type AiIdea = { title: string; children: string[]; note?: string; imageHint?: string; imageUrl?: string };
type AiMap = { centralTopic: string; ideas: AiIdea[] };

const SESSION_KEY = "iq_session_id";
const NODE_W = 170;
const NODE_H = 56;
const WORLD_W = 2600;
const WORLD_H = 1800;

const colsDefault = (): TaskCols => [
  { id: "todo", title: "Por hacer", tasks: [] },
  { id: "doing", title: "En proceso", tasks: [] },
  { id: "done", title: "Hecho", tasks: [] },
];

function normalizeTaskColumns(input: any): TaskCols {
  if (Array.isArray(input)) {
    return input
      .filter((c) => c && typeof c.id === "string" && typeof c.title === "string")
      .map((c) => ({
        id: c.id,
        title: c.title,
        tasks: Array.isArray(c.tasks)
          ? c.tasks.map((t: any) => ({
              id: String(t.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
              text: String(t.text || ""),
              checklist: Array.isArray(t.checklist)
                ? t.checklist.map((it: any) => ({
                    id: String(it.id || `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                    text: String(it.text || ""),
                    done: Boolean(it.done),
                  }))
                : [],
            }))
          : [],
      }));
  }

  if (input && typeof input === "object") {
    const keys = Object.keys(input);
    if (keys.length > 0) {
      return keys.map((k) => ({
        id: k,
        title: k === "todo" ? "Por hacer" : k === "doing" ? "En proceso" : k === "done" ? "Hecho" : k,
        tasks: Array.isArray(input[k])
          ? input[k].map((t: any) => ({
              id: String(t.id || `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
              text: String(t.text || ""),
              checklist: Array.isArray(t.checklist)
                ? t.checklist.map((it: any) => ({
                    id: String(it.id || `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                    text: String(it.text || ""),
                    done: Boolean(it.done),
                  }))
                : [],
            }))
          : [],
      }));
    }
  }

  return colsDefault();
}

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
    if (parsed?.kind === "taskboard") return { kind: "taskboard", columns: normalizeTaskColumns(parsed.columns) };
    if (parsed?.kind === "whiteboard") return { kind: "whiteboard", strokes: Array.isArray(parsed.strokes) ? parsed.strokes : [] };
    if (parsed?.kind === "mindmap") return { kind: "mindmap", nodes: parsed.nodes || [], edges: parsed.edges || [] };
    if (Array.isArray(parsed?.nodes) || Array.isArray(parsed?.edges)) return { kind: "mindmap", nodes: parsed.nodes || [], edges: parsed.edges || [] };
  } catch {
    // ignore
  }
  return { kind: "mindmap", nodes: [], edges: [] };
}

export default function MindMapsPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [shareMatch, shareParams] = useRoute("/mapas-mentales/share/:token");
  const token = shareParams ? shareParams.token : undefined;
  const { toast } = useToast();

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
  const [showAiIdeas, setShowAiIdeas] = useState(true);
  const [aiTopic, setAiTopic] = useState("");
  const [aiResultMode, setAiResultMode] = useState<"ideas" | "explicar">("ideas");
  const [aiConfigMode, setAiConfigMode] = useState<"basico" | "profundo">("basico");
  const [aiIncludeImages, setAiIncludeImages] = useState(false);
  const [aiIncludeNotes, setAiIncludeNotes] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [boardZoom, setBoardZoom] = useState(1);
  const [boardOffset, setBoardOffset] = useState({ x: 0, y: 0 });
  const [mobileLandscape, setMobileLandscape] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState<boolean>(() =>
    typeof window === "undefined" ? true : window.matchMedia("(max-width: 1023px)").matches,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [cols, setCols] = useState<TaskCols>(colsDefault);
  const [taskText, setTaskText] = useState("");
  const [newColTitle, setNewColTitle] = useState("");
  const [taskColId, setTaskColId] = useState("todo");
  const [checkDrafts, setCheckDrafts] = useState<Record<string, string>>({});
  const dragTask = useRef<{ fromColId: string; task: Task } | null>(null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [penColor, setPenColor] = useState("#7c3aed");
  const [penWidth, setPenWidth] = useState(3);
  const drawingId = useRef<string | null>(null);
  const kindLabel = (value: Kind) => {
    if (value === "mindmap") return t("mindmaps.typeMindmap");
    if (value === "taskboard") return t("mindmaps.typeTaskboard");
    return t("mindmaps.typeWhiteboard");
  };

  const chooserOptions = [
    { id: "mindmap" as const, label: t("mindmaps.typeMindmap"), Icon: Network },
    { id: "taskboard" as const, label: t("mindmaps.typeTaskboard"), Icon: Columns3 },
    { id: "whiteboard" as const, label: t("mindmaps.typeWhiteboard"), Icon: PencilRuler },
  ];

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  function clampOffset(nextX: number, nextY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: nextX, y: nextY };

    const scaledW = WORLD_W * boardZoom;
    const scaledH = WORLD_H * boardZoom;

    const minX = scaledW > rect.width ? rect.width - scaledW : (rect.width - scaledW) / 2;
    const maxX = scaledW > rect.width ? 0 : (rect.width - scaledW) / 2;
    const minY = scaledH > rect.height ? rect.height - scaledH : (rect.height - scaledH) / 2;
    const maxY = scaledH > rect.height ? 0 : (rect.height - scaledH) / 2;

    return {
      x: Math.max(minX, Math.min(nextX, maxX)),
      y: Math.max(minY, Math.min(nextY, maxY)),
    };
  }

  function toWorldCoords(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - boardOffset.x) / boardZoom,
      y: (clientY - rect.top - boardOffset.y) / boardZoom,
    };
  }

  async function loadMaps() {
    const res = await fetch(`/api/mindmaps?sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error("No se pudieron cargar proyectos");
    const data = await res.json();
    setMaps(data.maps || []);
  }

  function openMap(record: RecordMap) {
    const parsed = parseData(record.data);
    setShowChooser(false);
    setBoardZoom(1);
    setBoardOffset({ x: 0, y: 0 });
    setActiveId(record.id);
    setTitle(record.title || "Nuevo proyecto");
    setKind(parsed.kind);
    if (parsed.kind === "mindmap") {
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      setCols(colsDefault());
      setStrokes([]);
    } else if (parsed.kind === "taskboard") {
      const normalized = normalizeTaskColumns(parsed.columns);
      setCols(normalized);
      setTaskColId(normalized[0]?.id || "todo");
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
        toast({ title: "Error", description: e.message || "Error", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [shareMatch, token]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (kind !== "mindmap") return;
      if (panRef.current) {
        const nx = panRef.current.ox + (e.clientX - panRef.current.startX);
        const ny = panRef.current.oy + (e.clientY - panRef.current.startY);
        setBoardOffset(clampOffset(nx, ny));
        return;
      }
      const dragging = dragRef.current;
      if (!dragging || !boardRef.current || readonly) return;
      const world = toWorldCoords(e.clientX, e.clientY);
      const x = world.x - dragging.dx;
      const y = world.y - dragging.dy;
      const dragId = dragging.id;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragId
            ? { ...n, x: Math.max(0, Math.min(x, WORLD_W - NODE_W)), y: Math.max(0, Math.min(y, WORLD_H - NODE_H)) }
            : n,
        ),
      );
    };
    const clearPointers = () => {
      dragRef.current = null;
      panRef.current = null;
      drawingId.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", clearPointers);
    window.addEventListener("pointercancel", clearPointers as EventListener);
    window.addEventListener("blur", clearPointers);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", clearPointers);
      window.removeEventListener("pointercancel", clearPointers as EventListener);
      window.removeEventListener("blur", clearPointers);
    };
  }, [kind, readonly, boardZoom]);

  useEffect(() => {
    setBoardOffset((prev) => clampOffset(prev.x, prev.y));
  }, [boardZoom, kind]);

  useEffect(() => {
    if (kind !== "taskboard") return;
    if (!cols.length) return;
    const exists = cols.some((c) => c.id === taskColId);
    if (!exists) setTaskColId(cols[0].id);
  }, [cols, taskColId, kind]);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setMobileLandscape(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsCompactLayout(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (!isCompactLayout) {
      setMobileSidebarOpen(false);
      setMobileOptionsOpen(false);
    }
  }, [isCompactLayout]);

  function payload(): Data | null {
    if (!kind) return null;
    if (kind === "mindmap") return { kind, nodes, edges };
    if (kind === "taskboard") return { kind, columns: cols };
    return { kind, strokes };
  }

  function applyAiMapToBoard(aiMap: AiMap) {
    const rect = boardRef.current?.getBoundingClientRect();
    const viewportW = (rect?.width || 1100) / boardZoom;
    const viewportH = (rect?.height || 700) / boardZoom;
    const centerX = Math.max(0, Math.min((-boardOffset.x) / boardZoom + viewportW / 2 - NODE_W / 2, WORLD_W - NODE_W));
    const centerY = Math.max(0, Math.min((-boardOffset.y) / boardZoom + viewportH / 2 - NODE_H / 2, WORLD_H - NODE_H));

    const now = Date.now();
    const centralId = `node_ai_central_${now}`;
    const nextNodes: Node[] = [{ id: centralId, x: centerX, y: centerY, text: aiMap.centralTopic || aiTopic.trim() || "Tema principal" }];
    const nextEdges: Edge[] = [];

    const mainIdeas = (aiMap.ideas || []).slice(0, 7);
    const radius = Math.max(170, Math.min(Math.min(viewportW, viewportH) * 0.32, 280));

    mainIdeas.forEach((idea, idx) => {
      const angle = (Math.PI * 2 * idx) / Math.max(1, mainIdeas.length) - Math.PI / 2;
      const mainX = centerX + Math.cos(angle) * radius;
      const mainY = centerY + Math.sin(angle) * radius;
      const mainId = `node_ai_main_${now}_${idx}`;

        nextNodes.push({
          id: mainId,
          x: Math.max(0, Math.min(mainX, WORLD_W - NODE_W)),
          y: Math.max(0, Math.min(mainY, WORLD_H - NODE_H)),
          text: idea.title,
        });
      nextEdges.push({ id: `edge_ai_root_${now}_${idx}`, sourceId: centralId, targetId: mainId });

      const children = (idea.children || []).slice(0, 4);
      children.forEach((child, childIdx) => {
        const childX = mainX + 40 + childIdx * 30;
        const childY = mainY + 84 + childIdx * 40;
        const childId = `node_ai_child_${now}_${idx}_${childIdx}`;
        nextNodes.push({
          id: childId,
          x: Math.max(0, Math.min(childX, WORLD_W - NODE_W)),
          y: Math.max(0, Math.min(childY, WORLD_H - NODE_H)),
          text: child,
        });
        nextEdges.push({ id: `edge_ai_child_${now}_${idx}_${childIdx}`, sourceId: mainId, targetId: childId });
      });

      if (aiIncludeNotes && idea.note) {
        const noteId = `node_ai_note_${now}_${idx}`;
        nextNodes.push({
          id: noteId,
          x: Math.max(0, Math.min(mainX - 90, WORLD_W - NODE_W)),
          y: Math.max(0, Math.min(mainY + 78, WORLD_H - NODE_H)),
          text: `Nota: ${idea.note}`,
        });
        nextEdges.push({ id: `edge_ai_note_${now}_${idx}`, sourceId: mainId, targetId: noteId });
      }

      if (aiIncludeImages && (idea.imageHint || idea.imageUrl)) {
        const imgId = `node_ai_img_${now}_${idx}`;
        const imageUrl =
          (idea.imageUrl || "").trim() ||
          `https://picsum.photos/seed/${encodeURIComponent(idea.imageHint || idea.title)}/600/400`;
        nextNodes.push({
          id: imgId,
          x: Math.max(0, Math.min(mainX + 98, WORLD_W - NODE_W)),
          y: Math.max(0, Math.min(mainY - 78, WORLD_H - NODE_H)),
          text: idea.imageHint || idea.title,
          imageUrl,
        });
        nextEdges.push({ id: `edge_ai_img_${now}_${idx}`, sourceId: mainId, targetId: imgId });
      }
    });

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(centralId);
  }

  async function generateAiIdeas() {
    if (!aiTopic.trim() || readonly || kind !== "mindmap") return;
    let progressTimer: ReturnType<typeof setInterval> | null = null;
    try {
      setAiBusy(true);
      setAiProgress(8);
      progressTimer = setInterval(() => {
        setAiProgress((prev) => (prev >= 90 ? prev : prev + 7));
      }, 400);
      const res = await fetch("/api/mindmaps/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          resultMode: aiResultMode,
          configMode: aiConfigMode,
          includeImages: aiIncludeImages,
          includeNotes: aiIncludeNotes,
        }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        if (text.includes("<!DOCTYPE")) {
          throw new Error("El servidor devolvio HTML. Reinicia el servidor y verifica que exista la ruta /api/mindmaps/ideas.");
        }
        throw new Error("Respuesta invalida del servidor");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo generar ideas");
      if (!data?.map?.centralTopic || !Array.isArray(data?.map?.ideas)) throw new Error("Respuesta invalida de IA");

      const generated: AiMap = {
        centralTopic: String(data.map.centralTopic),
        ideas: data.map.ideas.map((i: any) => ({
          title: String(i.title || "").trim(),
          children: Array.isArray(i.children) ? i.children.map((c: any) => String(c).trim()).filter(Boolean) : [],
          note: i.note ? String(i.note) : "",
          imageHint: i.imageHint ? String(i.imageHint) : "",
          imageUrl: i.imageUrl ? String(i.imageUrl) : "",
        })).filter((i: AiIdea) => i.title),
      };

      applyAiMapToBoard(generated);
      if (!title.trim() || title === "Nuevo proyecto") setTitle(aiTopic.trim());
      setAiProgress(100);
    } catch (e: any) {
      toast({ title: "No se pudo generar", description: e.message || "Intenta nuevamente.", variant: "destructive" });
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      setTimeout(() => setAiProgress(0), 450);
      setAiBusy(false);
    }
  }

  async function toggleMobileLandscape() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;
    try {
      const orientation = (screen as any).orientation;
      if (!mobileLandscape) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        if (orientation?.lock) await orientation.lock("landscape");
        setMobileLandscape(true);
      } else {
        if (orientation?.unlock) orientation.unlock();
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setMobileLandscape(false);
      }
    } catch {
      toast({ title: "Orientacion no disponible", description: "Tu navegador no permite bloqueo de orientacion. Puedes girar el movil manualmente.", variant: "destructive" });
    }
  }

  function handleNodeImageUpload(file?: File | null) {
    if (!file || !selectedNodeId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      setNodes((prev) => prev.map((n) => (n.id === selectedNodeId ? { ...n, imageUrl: result } : n)));
    };
    reader.readAsDataURL(file);
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
      toast({ title: "Error al guardar", description: e.message || "Intenta nuevamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: string) {
    if (readonly || !confirm("Eliminar este proyecto?")) return;
    const res = await fetch(`/api/mindmaps/${id}?sessionId=${encodeURIComponent(sessionId)}`, { method: "DELETE" });
    if (!res.ok) {
      toast({ title: "No se pudo eliminar", description: "Intenta nuevamente.", variant: "destructive" });
      return;
    }
    if (id === activeId) setKind(null);
    await loadMaps();
  }

  async function shareProject(id?: string) {
    if (readonly) return;
    const target = id || activeId;
    if (!target) return;
    const res = await fetch(`/api/mindmaps/${target}/share`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
    if (!res.ok) {
      toast({ title: "No se pudo compartir", description: "Intenta nuevamente.", variant: "destructive" });
      return;
    }
    const data = await res.json();
    setShareUrl(data.shareUrl || "");
    if (data.shareUrl && navigator.clipboard) {
      await navigator.clipboard.writeText(data.shareUrl);
      toast({ title: "Enlace copiado", description: "Se copio el enlace para compartir." });
    }
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
    setTaskColId("todo");
    setNewColTitle("");
    setCheckDrafts({});
    setStrokes([]);
    setShareUrl("");
    setBoardZoom(1);
    setBoardOffset({ x: 0, y: 0 });
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
    <div className="mindmaps-page relative min-h-screen bg-white pb-24 md:pb-8">
      <style>{`
        .mindmaps-page {
          --btn-radius: 14px;
          --btn-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
          --btn-shadow-hover: 0 10px 22px rgba(15, 23, 42, 0.16);
          --btn-shadow-press: 0 3px 8px rgba(15, 23, 42, 0.12);
        }
        .mindmaps-page button {
          border-radius: var(--btn-radius);
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: transform 0.14s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
          box-shadow: var(--btn-shadow);
        }
        .mindmaps-page button:hover {
          box-shadow: var(--btn-shadow-hover);
          filter: brightness(1.02);
        }
        .mindmaps-page button:active {
          transform: scale(0.97);
          box-shadow: var(--btn-shadow-press);
        }
        .mindmaps-page button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.24), var(--btn-shadow-hover);
        }
        .mindmaps-page button:disabled {
          cursor: not-allowed;
          box-shadow: none;
          filter: grayscale(0.05);
        }
        .mindmaps-page .app-btn-primary {
          color: #fff;
          background-image:
            linear-gradient(135deg, #11c6ea 0%, #09afe6 42%, #72dee6 100%),
            radial-gradient(120% 120% at 95% -5%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 28%, transparent 56%),
            linear-gradient(155deg, rgba(255, 255, 255, 0.16) 0%, transparent 38%);
          border: 1px solid rgba(8, 145, 178, 0.35);
        }
        .mindmaps-page .app-btn-soft {
          background-image:
            linear-gradient(135deg, #f6f0ff 0%, #ede9fe 44%, #f3e8ff 100%),
            radial-gradient(125% 120% at 90% -10%, rgba(139, 92, 246, 0.26) 0%, rgba(168, 85, 247, 0.10) 32%, transparent 60%),
            linear-gradient(150deg, rgba(255, 255, 255, 0.22) 0%, transparent 36%);
          border: 1px solid rgba(124, 58, 237, 0.28);
          color: #5b21b6;
        }
        .mindmaps-page .app-btn-danger {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%);
          border: 1px solid #fecdd3;
          color: #be123c;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.12);
        }
      `}</style>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-purple-100 px-3 py-3">
        <div className="w-full px-1 md:px-3 flex items-center gap-2">
          <button onClick={handleBack} className="app-btn-soft p-2 text-purple-700"><ArrowLeft className="w-4 h-4" /></button>
          {!showChooser && <input value={title} disabled={readonly} onChange={(e) => setTitle(e.target.value)} className="flex-1 min-w-0 h-10 rounded-xl border border-purple-100 px-3 text-sm font-semibold text-gray-800 bg-white" />}
          {!readonly && !showChooser && <button onClick={saveProject} disabled={saving} className="app-btn-primary h-10 px-3 text-sm flex items-center gap-2 shrink-0 disabled:opacity-60"><Save className="w-4 h-4" /><span className="hidden sm:inline">{saving ? "Guardando..." : "Guardar"}</span></button>}
        </div>
      </header>

      <div className="w-full p-3 md:p-4 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 lg:gap-4">
        {!readonly && isCompactLayout && (
          <div className="rounded-2xl bg-white border border-purple-100 p-2 shadow-[0_6px_18px_rgba(17,24,39,0.08)] flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => { setMobileSidebarOpen((v) => !v); setMobileOptionsOpen(false); }} className="app-btn-soft h-9 px-3 text-sm text-purple-700 inline-flex items-center gap-1.5">
              Proyectos {mobileSidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => { setMobileOptionsOpen((v) => !v); setMobileSidebarOpen(false); }} className="app-btn-soft h-9 px-3 text-sm text-cyan-700 inline-flex items-center gap-1.5">
              Opciones {mobileOptionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {(!isCompactLayout || mobileSidebarOpen || mobileOptionsOpen) && (
        <aside className="rounded-2xl bg-white border border-purple-100 p-3 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
          {!readonly && (!isCompactLayout || mobileOptionsOpen) && <div className="flex items-center gap-2 mb-3"><button onClick={newProject} className="app-btn-soft h-9 px-3 text-sm text-purple-700 flex items-center gap-2"><Plus className="w-4 h-4" />Nuevo</button>{!showChooser && <button onClick={() => { const blob = new Blob([JSON.stringify({ title, ...payload() }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${title || "proyecto"}.json`; a.click(); URL.revokeObjectURL(url); }} className="app-btn-soft h-9 px-3 text-sm text-cyan-700 flex items-center gap-2"><Download className="w-4 h-4" />JSON</button>}</div>}
          {!readonly && !showChooser && kind === "mindmap" && (!isCompactLayout || mobileOptionsOpen) && (
            <div className="mb-3 rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 to-indigo-50/70 p-3">
              <button onClick={() => setShowAiIdeas((p) => !p)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-cyan-500 text-white flex items-center justify-center"><Lightbulb className="w-4 h-4" /></span>
                  <p className="text-sm font-bold text-gray-800">Generar ideas</p>
                </div>
                {showAiIdeas ? <ChevronUp className="w-4 h-4 text-cyan-700" /> : <ChevronDown className="w-4 h-4 text-cyan-700" />}
              </button>
              {showAiIdeas && (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-gray-600">Comienza tu mapa mental con IA</p>
                  <textarea value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Que quieres mapear mentalmente?" className="w-full min-h-[72px] resize-none rounded-xl border border-cyan-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 bg-white" />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1">Resultados</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAiResultMode("ideas")} className={`h-8 px-3 rounded-lg text-xs font-semibold border ${aiResultMode === "ideas" ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-gray-200 text-gray-700"}`}>Ideas</button>
                      <button onClick={() => setAiResultMode("explicar")} className={`h-8 px-3 rounded-lg text-xs font-semibold border ${aiResultMode === "explicar" ? "bg-blue-500 border-blue-500 text-white" : "bg-white border-gray-200 text-gray-700"}`}>Explicar</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1">Neuro-configuraciones</p>
                    <button onClick={() => setAiConfigMode((p) => (p === "basico" ? "profundo" : "basico"))} className="h-8 px-3 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 inline-flex items-center gap-1"><Settings2 className="w-3.5 h-3.5 text-blue-600" />{aiConfigMode === "basico" ? "Configuracion basica" : "Configuracion profunda"}</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={aiIncludeImages} onChange={(e) => setAiIncludeImages(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                      Imagenes
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={aiIncludeNotes} onChange={(e) => setAiIncludeNotes(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                      Notas
                    </label>
                  </div>
                  <button onClick={generateAiIdeas} disabled={aiBusy || !aiTopic.trim()} className="app-btn-primary w-full h-10 rounded-full text-sm font-bold disabled:opacity-50">{aiBusy ? `Generando... ${aiProgress}%` : "CREAR"}</button>
                  {aiBusy && <div className="w-full h-2 rounded-full bg-cyan-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300" style={{ width: `${aiProgress}%` }} /></div>}
                </div>
              )}
            </div>
          )}
          {(!isCompactLayout || mobileSidebarOpen) && <div className="space-y-2 max-h-[40vh] md:max-h-[65vh] overflow-auto pr-1">
            {!readonly && maps.length === 0 && <p className="text-xs text-gray-500">Aun no tienes proyectos creados.</p>}
            {!readonly && maps.map((m) => { const d = parseData(m.data); return <div key={m.id} className={`rounded-xl border p-2 ${activeId === m.id ? "border-purple-400 bg-purple-50" : "border-purple-100 bg-white"}`}><button className="w-full text-left" onClick={() => openMap(m)}><p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p><p className="text-[11px] text-gray-500">{kindLabel(d.kind)} - {new Date(m.updatedAt).toLocaleString("es-BO")}</p></button><div className="mt-2 flex items-center gap-2"><button className="h-7 px-2 rounded-md border border-cyan-200 text-xs text-cyan-700 bg-white flex items-center gap-1" onClick={() => shareProject(m.id)}><Share2 className="w-3.5 h-3.5" />Compartir</button><button className="h-7 px-2 rounded-md border border-rose-200 text-xs text-rose-700 flex items-center gap-1" onClick={() => deleteProject(m.id)}><Trash2 className="w-3.5 h-3.5" />Eliminar</button></div></div>; })}
          </div>}
          {(!isCompactLayout || mobileSidebarOpen) && shareUrl && <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50/60 p-2"><p className="text-[11px] text-cyan-700 break-all">{shareUrl}</p></div>}
        </aside>
        )}

        <section className="w-full rounded-2xl border border-purple-100 bg-white overflow-hidden shadow-[0_10px_30px_rgba(17,24,39,0.09)]">
          {showChooser ? (
            <div className="p-5 md:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs mr-2">1</span>{t("mindmaps.chooserProjectName")}</p>
              <input value={stepName} onChange={(e) => setStepName(e.target.value)} className="w-full h-11 rounded-xl border border-purple-100 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white mb-5" placeholder={t("mindmaps.chooserProjectPlaceholder")} />
              <p className="text-sm font-semibold text-gray-700 mb-3"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs mr-2">2</span>{t("mindmaps.chooserStartPoint")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {chooserOptions.map((o) => {
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
              <div className="mt-5 flex justify-end"><button onClick={() => { if (!stepName.trim()) return; if (!stepKind) { toast({ title: t("mindmaps.selectOptionTitle"), description: t("mindmaps.selectOptionDesc"), variant: "destructive" }); return; } setShowChooser(false); setTitle(stepName.trim()); setKind(stepKind); if (stepKind === "mindmap") { setNodes([]); setEdges([]); } if (stepKind === "taskboard") { const initial = colsDefault(); setCols(initial); setTaskColId(initial[0].id); } if (stepKind === "whiteboard") setStrokes([]); }} disabled={!stepName.trim()} className="app-btn-primary h-11 px-8 rounded-full font-bold disabled:opacity-50">{t("mindmaps.next")}</button></div>
            </div>
          ) : kind === "mindmap" ? (
            <>
              {!readonly && (
                <div className="border-b border-purple-100 p-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (!boardRef.current) return;
                      const rect = boardRef.current.getBoundingClientRect();
                      const wx = (-boardOffset.x + rect.width / 2) / boardZoom - NODE_W / 2;
                      const wy = (-boardOffset.y + rect.height / 2) / boardZoom - NODE_H / 2;
                      const node = {
                        id: `node_${Date.now()}`,
                        x: Math.max(0, Math.min(wx, WORLD_W - NODE_W)),
                        y: Math.max(0, Math.min(wy, WORLD_H - NODE_H)),
                        text: `Idea ${nodes.length + 1}`,
                      };
                      setNodes((p) => [...p, node]);
                      setSelectedNodeId(node.id);
                    }}
                    className="h-9 px-3 rounded-lg text-white text-sm font-semibold flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #00d9ff 0%, #8a3ffc 100%)" }}
                  >
                    <Plus className="w-4 h-4" />
                    Nodo
                  </button>
                  <button onClick={() => setConnectFromId(selectedNodeId)} disabled={!selectedNodeId} className="h-9 px-3 rounded-lg border border-purple-200 text-sm font-medium text-purple-700 disabled:opacity-50">{connectFromId ? "Toca nodo destino..." : "Conectar nodos"}</button>
                  <button onClick={() => { if (!selectedNodeId) return; setNodes((p) => p.filter((n) => n.id !== selectedNodeId)); setEdges((p) => p.filter((e) => e.sourceId !== selectedNodeId && e.targetId !== selectedNodeId)); setSelectedNodeId(null); }} disabled={!selectedNodeId} className="h-9 px-3 rounded-lg border border-rose-200 text-sm font-medium text-rose-700 disabled:opacity-50">Eliminar nodo</button>
                  <button onClick={() => setBoardZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))))} className="h-9 px-3 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700">-</button>
                  <span className="text-xs font-semibold text-gray-600 w-12 text-center">{Math.round(boardZoom * 100)}%</span>
                  <button onClick={() => setBoardZoom((z) => Math.min(2.2, Number((z + 0.1).toFixed(2))))} className="h-9 px-3 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700">+</button>
                  <button onClick={toggleMobileLandscape} className="h-9 px-3 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700 md:hidden inline-flex items-center gap-1"><RotateCw className="w-4 h-4" />Horizontal</button>
                  <label className="h-9 px-3 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700 inline-flex items-center gap-2 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    Imagen
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleNodeImageUpload(e.target.files?.[0] || null); e.currentTarget.value = ""; }} />
                  </label>
                  <button onClick={() => { if (!selectedNodeId) return; setNodes((p) => p.map((n) => (n.id === selectedNodeId ? { ...n, imageUrl: "" } : n))); }} disabled={!selectedNodeId} className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50">Quitar imagen</button>
                  <span className="text-[11px] text-gray-500">Arrastra fondo para mover el lienzo</span>
                  <input value={selectedNode?.text || ""} disabled={!selectedNode} onChange={(e) => setNodes((p) => p.map((n) => (n.id === selectedNodeId ? { ...n, text: e.target.value } : n)))} className="h-9 min-w-[210px] flex-1 rounded-lg border border-purple-100 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white" placeholder="Texto del nodo" />
                </div>
              )}
              <div
                ref={boardRef}
                className="relative w-full h-[66vh] md:h-[74vh] bg-white touch-none overflow-hidden"
                onPointerDown={(e) => {
                  if (readonly) return;
                  const target = e.target as HTMLElement;
                  if (target.closest("[data-node-card='true']")) return;
                  panRef.current = { startX: e.clientX, startY: e.clientY, ox: boardOffset.x, oy: boardOffset.y };
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const dir = e.deltaY > 0 ? -1 : 1;
                  setBoardZoom((z) => Math.max(0.45, Math.min(2.2, Number((z + dir * 0.08).toFixed(2)))));
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(124,58,237,0.16)_1px,_transparent_1px)] bg-[length:18px_18px]" />
                <div
                  className="absolute"
                  style={{
                    width: WORLD_W,
                    height: WORLD_H,
                    transform: `translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardZoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <svg className="absolute left-0 top-0 pointer-events-none" width={WORLD_W} height={WORLD_H}>
                    {edges.map((e) => {
                      const s = nodes.find((n) => n.id === e.sourceId);
                      const t = nodes.find((n) => n.id === e.targetId);
                      if (!s || !t) return null;
                      return <line key={e.id} x1={s.x + NODE_W / 2} y1={s.y + NODE_H / 2} x2={t.x + NODE_W / 2} y2={t.y + NODE_H / 2} stroke="#7c3aed" strokeWidth="2" strokeOpacity="0.75" />;
                    })}
                  </svg>
                  {nodes.map((n) => (
                    <button
                      key={n.id}
                      data-node-card="true"
                      onClick={() => {
                        if (connectFromId && connectFromId !== n.id) {
                          const exists = edges.some((e) => (e.sourceId === connectFromId && e.targetId === n.id) || (e.sourceId === n.id && e.targetId === connectFromId));
                          if (!exists) setEdges((p) => [...p, { id: `edge_${Date.now()}`, sourceId: connectFromId, targetId: n.id }]);
                          setConnectFromId(null);
                        }
                        setSelectedNodeId(n.id);
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const world = toWorldCoords(e.clientX, e.clientY);
                        dragRef.current = { id: n.id, dx: world.x - n.x, dy: world.y - n.y };
                      }}
                      className={`absolute px-3 py-2 rounded-xl border text-left shadow-sm select-none ${selectedNodeId === n.id ? "border-purple-500 bg-purple-50" : "border-purple-200 bg-white/95"}`}
                      style={{ left: n.x, top: n.y, width: NODE_W, minHeight: n.imageUrl ? 120 : NODE_H }}
                    >
                      {n.imageUrl ? (
                        <>
                          <img src={n.imageUrl} alt={n.text || "Imagen"} className="w-full h-16 object-cover rounded-md mb-1 border border-cyan-100" />
                          <span className="text-[10px] font-semibold text-gray-700 line-clamp-2">{n.text || "Nodo"}</span>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-700 line-clamp-2">{n.text || "Nodo"}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : kind === "taskboard" ? (
            <div className="p-3 min-h-[66vh] md:min-h-[74vh]">
              {!readonly && (
                <div className="space-y-2 mb-3">
                  {isCompactLayout && (
                    <div className="flex justify-end">
                      <button
                        onClick={toggleMobileLandscape}
                        className="h-9 px-3 rounded-lg border border-indigo-200 text-sm font-semibold text-indigo-700 bg-indigo-50 inline-flex items-center gap-1.5"
                      >
                        <RotateCw className="w-4 h-4" />
                        {mobileLandscape ? "Vertical" : "Horizontal"}
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Nueva tarea" className="h-9 min-w-0 flex-1 rounded-lg border border-cyan-200 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white shadow-sm" />
                    <div className="flex gap-2">
                      <select value={taskColId} onChange={(e) => setTaskColId(e.target.value)} className="h-9 min-w-0 flex-1 sm:flex-none sm:w-auto rounded-lg border border-cyan-200 px-2 text-sm font-medium text-cyan-700 bg-white">
                        {cols.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <button onClick={() => { if (!taskText.trim()) return; setCols((p) => p.map((c) => c.id === taskColId ? { ...c, tasks: [...c.tasks, { id: `task_${Date.now()}`, text: taskText.trim(), checklist: [] }] } : c)); setTaskText(""); }} className="app-btn-primary h-9 px-3 text-sm font-semibold whitespace-nowrap">Agregar</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} placeholder="Nueva columna" className="h-9 flex-1 rounded-lg border border-fuchsia-200 px-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white shadow-sm" />
                    <button onClick={() => { const name = newColTitle.trim(); if (!name) return; const id = `col_${Date.now()}`; setCols((p) => [...p, { id, title: name, tasks: [] }]); setTaskColId(id); setNewColTitle(""); }} className="app-btn-soft h-9 px-3 text-sm text-fuchsia-700">+ Columna</button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {cols.map((c) => (
                  <div
                    key={c.id}
                    className="relative shrink-0 w-[84vw] max-w-[300px] md:w-[320px] rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/80 to-white p-2 shadow-[0_8px_20px_rgba(8,145,178,0.12)] snap-start"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragTask.current) {
                        const task = dragTask.current.task;
                        const fromColId = dragTask.current.fromColId;
                        setCols((p) => p.map((col) => {
                          if (col.id === fromColId) return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
                          if (col.id === c.id) return { ...col, tasks: [...col.tasks, task] };
                          return col;
                        }));
                        dragTask.current = null;
                      }
                    }}
                  >
                    {!readonly && cols.length > 1 && (
                      <button
                        className="absolute top-2 right-2 w-7 h-7 rounded-md border border-rose-200 text-rose-700 bg-white inline-flex items-center justify-center"
                        onClick={() => {
                          setCols((p) => {
                            const next = p.filter((col) => col.id !== c.id);
                            if (taskColId === c.id && next[0]) setTaskColId(next[0].id);
                            return next;
                          });
                        }}
                        title="Eliminar columna"
                        aria-label="Eliminar columna"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="mb-2 flex items-center justify-between gap-2 pr-9">
                      <p className="inline-flex max-w-full items-center rounded-md border border-cyan-200 bg-gradient-to-r from-cyan-100 to-indigo-100 px-2 py-1 text-xs font-semibold text-cyan-900 shadow-sm truncate">
                        {c.title}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {c.tasks.map((t) => (
                        <div key={t.id} draggable={!readonly} onDragStart={() => { dragTask.current = { fromColId: c.id, task: t }; }} className="min-w-0 rounded-xl border border-purple-100 bg-white p-2 shadow-sm">
                          <p className="text-xs font-semibold text-slate-700 break-words">{t.text}</p>
                          <div className="mt-2 space-y-1">
                            {(t.checklist || []).map((it) => (
                              <label key={it.id} className="min-w-0 flex items-center gap-2 text-xs text-slate-700">
                                <input type="checkbox" className="accent-emerald-500" checked={!!it.done} onChange={(e) => setCols((p) => p.map((col) => col.id !== c.id ? col : { ...col, tasks: col.tasks.map((task) => task.id !== t.id ? task : { ...task, checklist: (task.checklist || []).map((ci) => ci.id === it.id ? { ...ci, done: e.target.checked } : ci) }) }))} />
                                <span className={`min-w-0 text-[11px] break-words ${it.done ? "line-through text-slate-400" : "text-slate-700"}`}>{it.text}</span>
                              </label>
                            ))}
                          </div>
                          {!readonly && (
                            <div className="mt-2 flex min-w-0 items-center gap-1">
                              <input value={checkDrafts[t.id] || ""} onChange={(e) => setCheckDrafts((p) => ({ ...p, [t.id]: e.target.value }))} placeholder="Checklist..." className="h-7 min-w-0 flex-1 rounded border border-cyan-100 px-2 text-xs text-gray-700 bg-cyan-50/40" />
                              <button className="app-btn-soft h-7 px-2 min-w-[72px] shrink-0 whitespace-nowrap text-[11px] font-medium text-emerald-700" onClick={() => { const txt = (checkDrafts[t.id] || "").trim(); if (!txt) return; setCols((p) => p.map((col) => col.id !== c.id ? col : { ...col, tasks: col.tasks.map((task) => task.id !== t.id ? task : { ...task, checklist: [...(task.checklist || []), { id: `chk_${Date.now()}`, text: txt, done: false }] }) })); setCheckDrafts((p) => ({ ...p, [t.id]: "" })); }}>+ Check</button>
                            </div>
                          )}
                          {!readonly && <button className="app-btn-danger mt-2 h-6 px-2 text-xs text-rose-700" onClick={() => setCols((p) => p.map((col) => col.id !== c.id ? col : { ...col, tasks: col.tasks.filter((x) => x.id !== t.id) }))}>Eliminar</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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


