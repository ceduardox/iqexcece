import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, Columns3, Copy, Crosshair, Download, ImagePlus, Lightbulb, Network, PencilRuler, Plus, RotateCw, Save, Settings2, Share2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type Kind = "mindmap" | "taskboard" | "whiteboard";
type Node = { id: string; x: number; y: number; text: string; imageUrl?: string };
type Edge = { id: string; sourceId: string; targetId: string };
type TaskChecklistItem = { id: string; text: string; done: boolean };
type TaskComment = { id: string; text: string; createdAt: string };
type TaskAttachment = { id: string; name: string; mimeType: string; size: number; url: string };
type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "todo" | "doing" | "done";
type Task = {
  id: string;
  text: string;
  checklist?: TaskChecklistItem[];
  note?: string;
  priority?: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
};
type TaskCol = { id: string; title: string; tasks: Task[] };
type TaskCols = TaskCol[];
type Stroke = { id: string; color: string; width: number; points: { x: number; y: number }[] };
type RecordMap = { id: string; title: string; data: string; updatedAt: string };
type Data = { kind: Kind; nodes?: Node[]; edges?: Edge[]; columns?: TaskCols; strokes?: Stroke[] };
type AiIdea = { title: string; children: string[]; note?: string; imageHint?: string; imageUrl?: string };
type AiMap = { centralTopic: string; ideas: AiIdea[] };

const SESSION_KEY = "iq_session_id";
const VIEW_STATE_KEY = "iq_mindmaps_view_state_v1";
const NODE_W = 170;
const NODE_H = 56;
const WORLD_W = 2600;
const WORLD_H = 1800;

const TASK_STATUS_OPTIONS: TaskStatus[] = ["todo", "doing", "done"];

function toTaskStatus(value: any): TaskStatus {
  return TASK_STATUS_OPTIONS.includes(value) ? value : "todo";
}

function toTaskPriority(value: any): TaskPriority {
  return value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function statusByColumnId(id: string): TaskStatus {
  if (id === "doing") return "doing";
  if (id === "done") return "done";
  return "todo";
}

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
              note: String(t.note || ""),
              priority: toTaskPriority(t.priority),
              dueDate: typeof t.dueDate === "string" ? t.dueDate : "",
              status: toTaskStatus(t.status || statusByColumnId(c.id)),
              comments: Array.isArray(t.comments)
                ? t.comments.map((cm: any) => ({
                    id: String(cm.id || `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                    text: String(cm.text || ""),
                    createdAt: String(cm.createdAt || new Date().toISOString()),
                  }))
                : [],
              attachments: Array.isArray(t.attachments)
                ? t.attachments.map((at: any) => ({
                    id: String(at.id || `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                    name: String(at.name || "archivo"),
                    mimeType: String(at.mimeType || "application/octet-stream"),
                    size: Number(at.size || 0),
                    url: String(at.url || ""),
                  }))
                : [],
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
              note: String(t.note || ""),
              priority: toTaskPriority(t.priority),
              dueDate: typeof t.dueDate === "string" ? t.dueDate : "",
              status: toTaskStatus(t.status || statusByColumnId(k)),
              comments: Array.isArray(t.comments)
                ? t.comments.map((cm: any) => ({
                    id: String(cm.id || `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                    text: String(cm.text || ""),
                    createdAt: String(cm.createdAt || new Date().toISOString()),
                  }))
                : [],
              attachments: Array.isArray(t.attachments)
                ? t.attachments.map((at: any) => ({
                    id: String(at.id || `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                    name: String(at.name || "archivo"),
                    mimeType: String(at.mimeType || "application/octet-stream"),
                    size: Number(at.size || 0),
                    url: String(at.url || ""),
                  }))
                : [],
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
  const [savedSnapshot, setSavedSnapshot] = useState("");
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
  const viewRestoredRef = useRef(false);

  const [cols, setCols] = useState<TaskCols>(colsDefault);
  const [taskText, setTaskText] = useState("");
  const [newColTitle, setNewColTitle] = useState("");
  const [taskColId, setTaskColId] = useState("todo");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "done" | "overdue">("all");
  const [checkDrafts, setCheckDrafts] = useState<Record<string, string>>({});
  const [taskCommentDraft, setTaskCommentDraft] = useState("");
  const [taskModal, setTaskModal] = useState<{ colId: string; taskId: string } | null>(null);
  const taskAttachmentInputRef = useRef<HTMLInputElement | null>(null);
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
    setTaskModal(null);
    setShowChooser(false);
    setBoardZoom(1);
    setBoardOffset({ x: 0, y: 0 });
    setActiveId(record.id);
    setTitle(record.title || "Nuevo proyecto");
    setKind(parsed.kind);
    setSavedSnapshot(JSON.stringify(parsed));
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

  useEffect(() => {
    if (!taskModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTaskModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [taskModal]);

  useEffect(() => {
    setTaskCommentDraft("");
  }, [taskModal?.taskId, taskModal?.colId]);

  useEffect(() => {
    if (showChooser || kind !== "mindmap") {
      viewRestoredRef.current = false;
      return;
    }
    if (viewRestoredRef.current) return;
    try {
      const raw = sessionStorage.getItem(VIEW_STATE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.zoom === "number" && Number.isFinite(parsed.zoom)) {
        setBoardZoom(Math.max(0.45, Math.min(2.2, parsed.zoom)));
      }
      if (typeof parsed?.offsetX === "number" && typeof parsed?.offsetY === "number") {
        setBoardOffset(clampOffset(parsed.offsetX, parsed.offsetY));
      }
    } catch {
      // ignore invalid cache
    } finally {
      viewRestoredRef.current = true;
    }
  }, [showChooser, kind]);

  useEffect(() => {
    if (showChooser || kind !== "mindmap") return;
    sessionStorage.setItem(
      VIEW_STATE_KEY,
      JSON.stringify({ zoom: boardZoom, offsetX: boardOffset.x, offsetY: boardOffset.y }),
    );
  }, [showChooser, kind, boardZoom, boardOffset.x, boardOffset.y]);

  function payload(): Data | null {
    if (!kind) return null;
    if (kind === "mindmap") return { kind, nodes, edges };
    if (kind === "taskboard") return { kind, columns: cols };
    return { kind, strokes };
  }

  const currentSnapshot = useMemo(() => {
    const data = payload();
    return data ? JSON.stringify(data) : "";
  }, [kind, nodes, edges, cols, strokes]);

  const activeTaskModal = useMemo(() => {
    if (!taskModal) return null;
    const col = cols.find((c) => c.id === taskModal.colId);
    if (!col) return null;
    const task = col.tasks.find((t) => t.id === taskModal.taskId);
    if (!task) return null;
    return { col, task };
  }, [taskModal, cols]);

  const hasUnsavedChanges = !readonly && !showChooser && !!kind && currentSnapshot !== savedSnapshot;

  function patchTask(colId: string, taskId: string, patch: Partial<Task>) {
    setCols((prev) =>
      prev.map((col) =>
        col.id !== colId
          ? col
          : {
              ...col,
              tasks: col.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
            },
      ),
    );
  }

  function isTaskOverdue(task: Task) {
    if (!task.dueDate) return false;
    const due = new Date(`${task.dueDate}T23:59:59`);
    const done = (task.status || "todo") === "done";
    return !done && due.getTime() < Date.now();
  }

  function isTaskDueSoon(task: Task) {
    if (!task.dueDate) return false;
    const due = new Date(`${task.dueDate}T23:59:59`);
    const now = Date.now();
    const diff = due.getTime() - now;
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    const done = (task.status || "todo") === "done";
    return !done && diff >= 0 && diff <= twoDays;
  }

  function matchTaskFilter(task: Task) {
    const search = taskSearch.trim().toLowerCase();
    const haystack = [task.text, task.note || "", ...(task.checklist || []).map((c) => c.text)]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    if (!matchesSearch) return false;
    if (taskFilter === "all") return true;
    if (taskFilter === "done") return (task.status || "todo") === "done";
    if (taskFilter === "pending") return (task.status || "todo") !== "done";
    if (taskFilter === "overdue") return isTaskOverdue(task);
    return true;
  }

  function moveTaskToStatus(colId: string, taskId: string, nextStatus: TaskStatus) {
    const targetCol = cols.find((c) => c.id === nextStatus);
    if (!targetCol || targetCol.id === colId) {
      patchTask(colId, taskId, { status: nextStatus });
      return;
    }
    setCols((prev) => {
      let movedTask: Task | null = null;
      const removed = prev.map((col) => {
        if (col.id !== colId) return col;
        const nextTasks = col.tasks.filter((task) => {
          if (task.id === taskId) {
            movedTask = { ...task, status: nextStatus };
            return false;
          }
          return true;
        });
        return { ...col, tasks: nextTasks };
      });
      if (!movedTask) return prev;
      return removed.map((col) =>
        col.id === targetCol.id ? { ...col, tasks: [...col.tasks, movedTask as Task] } : col,
      );
    });
    setTaskModal({ colId: nextStatus, taskId });
  }

  function addTaskComment(colId: string, taskId: string) {
    const text = taskCommentDraft.trim();
    if (!text) return;
    const comment: TaskComment = {
      id: `cmt_${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    setCols((prev) =>
      prev.map((col) =>
        col.id !== colId
          ? col
          : {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id !== taskId
                  ? task
                  : { ...task, comments: [...(task.comments || []), comment] },
              ),
            },
      ),
    );
    setTaskCommentDraft("");
  }

  function removeTaskComment(colId: string, taskId: string, commentId: string) {
    setCols((prev) =>
      prev.map((col) =>
        col.id !== colId
          ? col
          : {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id !== taskId
                  ? task
                  : { ...task, comments: (task.comments || []).filter((c) => c.id !== commentId) },
              ),
            },
      ),
    );
  }

  function removeTaskAttachment(colId: string, taskId: string, attachmentId: string) {
    setCols((prev) =>
      prev.map((col) =>
        col.id !== colId
          ? col
          : {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id !== taskId
                  ? task
                  : { ...task, attachments: (task.attachments || []).filter((a) => a.id !== attachmentId) },
              ),
            },
      ),
    );
  }

  function handleTaskAttachmentUpload(file: File | null, colId: string, taskId: string) {
    if (!file) return;
    const maxBytes = 7 * 1024 * 1024;
    const allowed = [
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validType = allowed.some((type) => (type.endsWith("/") ? file.type.startsWith(type) : file.type === type));
    if (!validType) {
      toast({ title: "Tipo no permitido", description: "Sube imagen, PDF, Word o Excel.", variant: "destructive" });
      return;
    }
    if (file.size > maxBytes) {
      toast({ title: "Archivo muy grande", description: "Maximo permitido: 7 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (!url) return;
      const attachment: TaskAttachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        url,
      };
      setCols((prev) =>
        prev.map((col) =>
          col.id !== colId
            ? col
            : {
                ...col,
                tasks: col.tasks.map((task) =>
                  task.id !== taskId
                    ? task
                    : { ...task, attachments: [...(task.attachments || []), attachment] },
                ),
              },
        ),
      );
    };
    reader.readAsDataURL(file);
  }

  function centerBoardOnNode(nodeId?: string | null) {
    if (kind !== "mindmap") return;
    const targetId = nodeId || selectedNodeId;
    if (!targetId || !boardRef.current) return;
    const node = nodes.find((n) => n.id === targetId);
    if (!node) return;
    const rect = boardRef.current.getBoundingClientRect();
    const nx = rect.width / 2 - (node.x + NODE_W / 2) * boardZoom;
    const ny = rect.height / 2 - (node.y + NODE_H / 2) * boardZoom;
    setBoardOffset(clampOffset(nx, ny));
  }

  function duplicateSelectedNode() {
    if (readonly || kind !== "mindmap" || !selectedNode) return;
    const duplicatedId = `node_${Date.now()}`;
    const duplicatedNode: Node = {
      ...selectedNode,
      id: duplicatedId,
      x: Math.max(0, Math.min(selectedNode.x + 28, WORLD_W - NODE_W)),
      y: Math.max(0, Math.min(selectedNode.y + 28, WORLD_H - NODE_H)),
      text: `${selectedNode.text} copia`,
    };
    setNodes((prev) => [...prev, duplicatedNode]);
    setSelectedNodeId(duplicatedId);
  }

  function createNodeFromSelection(mode: "child" | "sibling") {
    if (readonly || kind !== "mindmap" || !selectedNode) return;
    const id = `node_${Date.now()}`;
    const baseX = mode === "child" ? selectedNode.x + NODE_W + 44 : selectedNode.x;
    const baseY = mode === "child" ? selectedNode.y : selectedNode.y + NODE_H + 34;
    const node: Node = {
      id,
      x: Math.max(0, Math.min(baseX, WORLD_W - NODE_W)),
      y: Math.max(0, Math.min(baseY, WORLD_H - NODE_H)),
      text: mode === "child" ? "Subidea" : "Idea",
    };
    setNodes((prev) => [...prev, node]);
    if (mode === "child") {
      setEdges((prev) => [...prev, { id: `edge_${Date.now()}`, sourceId: selectedNode.id, targetId: id }]);
    }
    setSelectedNodeId(id);
    centerBoardOnNode(id);
  }

  function getBoardWorldCenter() {
    const rect = boardRef.current?.getBoundingClientRect();
    const viewportW = (rect?.width || 1100) / boardZoom;
    const viewportH = (rect?.height || 700) / boardZoom;
    const centerX = Math.max(0, Math.min((-boardOffset.x) / boardZoom + viewportW / 2, WORLD_W));
    const centerY = Math.max(0, Math.min((-boardOffset.y) / boardZoom + viewportH / 2, WORLD_H));
    return { centerX, centerY };
  }

  function autoLayoutNodes(rawNodes: Node[], rawEdges: Edge[], center: { centerX: number; centerY: number }): Node[] {
    if (!rawNodes.length) return rawNodes;
    const clampNode = (n: Node) => ({
      ...n,
      x: Math.max(0, Math.min(n.x, WORLD_W - NODE_W)),
      y: Math.max(0, Math.min(n.y, WORLD_H - NODE_H)),
    });

    const nodeMap = new Map(rawNodes.map((n) => [n.id, n]));
    const validEdges = rawEdges.filter((e) => nodeMap.has(e.sourceId) && nodeMap.has(e.targetId));
    if (!validEdges.length) {
      const cols = Math.max(1, Math.ceil(Math.sqrt(rawNodes.length)));
      const colGap = NODE_W + 42;
      const rowGap = NODE_H + 46;
      const rows = Math.ceil(rawNodes.length / cols);
      const startX = center.centerX - ((cols - 1) * colGap) / 2 - NODE_W / 2;
      const startY = center.centerY - ((rows - 1) * rowGap) / 2 - NODE_H / 2;
      return rawNodes.map((n, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        return clampNode({ ...n, x: startX + col * colGap, y: startY + row * rowGap });
      });
    }

    const children = new Map<string, string[]>();
    const incoming = new Map<string, number>();
    rawNodes.forEach((n) => {
      children.set(n.id, []);
      incoming.set(n.id, 0);
    });
    validEdges.forEach((e) => {
      children.get(e.sourceId)?.push(e.targetId);
      incoming.set(e.targetId, (incoming.get(e.targetId) || 0) + 1);
    });

    const roots = rawNodes.filter((n) => (incoming.get(n.id) || 0) === 0).map((n) => n.id);
    if (!roots.length) roots.push(rawNodes[0].id);

    const depthById = new Map<string, number>();
    const queue: string[] = [...roots];
    roots.forEach((id) => depthById.set(id, 0));
    while (queue.length) {
      const id = queue.shift()!;
      const depth = depthById.get(id) || 0;
      (children.get(id) || []).forEach((childId) => {
        const nextDepth = depth + 1;
        if (!depthById.has(childId) || (depthById.get(childId) || 0) > nextDepth) {
          depthById.set(childId, nextDepth);
          queue.push(childId);
        }
      });
    }

    let maxDepth = 0;
    rawNodes.forEach((n) => {
      if (!depthById.has(n.id)) depthById.set(n.id, 0);
      maxDepth = Math.max(maxDepth, depthById.get(n.id) || 0);
    });

    const grouped = new Map<number, Node[]>();
    rawNodes.forEach((n) => {
      const d = depthById.get(n.id) || 0;
      const arr = grouped.get(d) || [];
      arr.push(n);
      grouped.set(d, arr);
    });
    grouped.forEach((arr) => arr.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y)));

    const colGap = NODE_W + 86;
    const rowGap = NODE_H + 48;
    const baseX = center.centerX - (maxDepth * colGap) / 2 - NODE_W / 2;
    const positioned = new Map<string, Node>();

    for (let depth = 0; depth <= maxDepth; depth += 1) {
      const col = grouped.get(depth) || [];
      const totalHeight = (col.length - 1) * rowGap;
      const startY = center.centerY - totalHeight / 2 - NODE_H / 2;
      const x = baseX + depth * colGap;
      col.forEach((n, idx) => {
        positioned.set(n.id, clampNode({ ...n, x, y: startY + idx * rowGap }));
      });
    }

    return rawNodes.map((n) => positioned.get(n.id) || clampNode(n));
  }

  function reorderMindmap() {
    if (readonly || kind !== "mindmap" || !nodes.length) return;
    const center = getBoardWorldCenter();
    setNodes((prev) => autoLayoutNodes(prev, edges, center));
  }

  useEffect(() => {
    if (readonly || showChooser || kind !== "mindmap") return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (inEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveProject();
        return;
      }

      if (!selectedNodeId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setNodes((p) => p.filter((n) => n.id !== selectedNodeId));
        setEdges((p) => p.filter((ed) => ed.sourceId !== selectedNodeId && ed.targetId !== selectedNodeId));
        setSelectedNodeId(null);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        createNodeFromSelection("child");
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        createNodeFromSelection("sibling");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readonly, showChooser, kind, selectedNodeId, selectedNode, boardZoom, boardOffset.x, boardOffset.y, nodes, edges]);

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

    const arranged = autoLayoutNodes(nextNodes, nextEdges, { centerX: centerX + NODE_W / 2, centerY: centerY + NODE_H / 2 });
    setNodes(arranged);
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
    setTaskModal(null);
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
        .mindmaps-page .app-btn-primary:disabled {
          color: #0f4b5a;
          background-image:
            linear-gradient(135deg, #89d8ea 0%, #76cae6 42%, #a7e5ef 100%),
            linear-gradient(155deg, rgba(255, 255, 255, 0.2) 0%, transparent 38%);
          border-color: rgba(14, 116, 144, 0.3);
          opacity: 1;
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
        .mindmaps-page .app-sidebar-shell {
          background: linear-gradient(180deg, #ffffff 0%, #fcfbff 100%);
          border: 1px solid rgba(196, 181, 253, 0.28);
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
        }
        .mindmaps-page .app-ai-card {
          border-radius: 16px;
          border: 1px solid rgba(14, 165, 233, 0.22);
          background: linear-gradient(180deg, #f8fcff 0%, #f4f8ff 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 8px 20px rgba(15, 23, 42, 0.06);
        }
        .mindmaps-page .app-ai-input {
          border: 1px solid rgba(125, 211, 252, 0.9);
          background: #ffffff;
          color: #334155;
          border-radius: 12px;
        }
        .mindmaps-page .app-pill {
          border-radius: 999px;
          border: 1px solid rgba(203, 213, 225, 0.9);
          background: #ffffff;
          color: #334155;
          height: 36px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
        }
        .mindmaps-page .app-pill.is-active {
          border-color: rgba(59, 130, 246, 0.35);
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.26);
        }
        .mindmaps-page .app-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1px solid rgba(148, 163, 184, 0.9);
          accent-color: #2563eb;
        }
        .mindmaps-page .app-create-btn {
          height: 48px;
          border-radius: 14px;
          border: 1px solid rgba(56, 189, 248, 0.45);
          font-size: 24px;
          letter-spacing: 0.02em;
          font-weight: 700;
        }
        .mindmaps-page .app-inline-input {
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(196, 181, 253, 0.65);
          background: #ffffff;
          color: #334155;
        }
        .mindmaps-page .app-inline-icon {
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(14, 165, 233, 0.12);
          color: #0369a1;
        }
        .mindmaps-page .whiteboard-toolbar {
          border-bottom: 1px solid rgba(196, 181, 253, 0.45);
          padding: 10px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          background: linear-gradient(180deg, #fcfdff 0%, #f7faff 100%);
        }
        .mindmaps-page .project-open-btn {
          border-radius: 0;
          box-shadow: none;
          background: transparent;
          filter: none;
        }
        .mindmaps-page .project-open-btn:hover,
        .mindmaps-page .project-open-btn:active,
        .mindmaps-page .project-open-btn:focus-visible {
          box-shadow: none;
          transform: none;
          filter: none;
        }
        .mindmaps-page .app-empty-projects-card {
          position: relative;
          min-height: 260px;
          border-radius: 18px;
          border: 1px solid rgba(196, 181, 253, 0.45);
          background-image:
            radial-gradient(52% 30% at 18% 106%, rgba(167, 111, 255, 0.40) 0%, rgba(167, 111, 255, 0.16) 42%, rgba(167, 111, 255, 0.00) 80%),
            radial-gradient(45% 28% at 90% 104%, rgba(75, 184, 255, 0.34) 0%, rgba(75, 184, 255, 0.12) 42%, rgba(75, 184, 255, 0.00) 80%),
            radial-gradient(34% 32% at 87% 84%, rgba(170, 222, 255, 0.20) 0%, rgba(170, 222, 255, 0.00) 76%),
            linear-gradient(180deg, #f4f4fc 0%, #f2f2fb 64%, #f0eef8 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 14px 30px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }
        .mindmaps-page .app-empty-projects-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(150deg, rgba(255,255,255,0.35) 0%, transparent 28%);
        }
        .mindmaps-page .app-chooser-shell {
          border: 1px solid rgba(196, 181, 253, 0.45);
          background-image:
            radial-gradient(52% 30% at 18% 106%, rgba(167, 111, 255, 0.40) 0%, rgba(167, 111, 255, 0.16) 42%, rgba(167, 111, 255, 0.00) 80%),
            radial-gradient(45% 28% at 90% 104%, rgba(75, 184, 255, 0.34) 0%, rgba(75, 184, 255, 0.12) 42%, rgba(75, 184, 255, 0.00) 80%),
            radial-gradient(34% 32% at 87% 84%, rgba(170, 222, 255, 0.20) 0%, rgba(170, 222, 255, 0.00) 76%),
            linear-gradient(180deg, #f4f4fc 0%, #f2f2fb 64%, #f0eef8 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 14px 30px rgba(15, 23, 42, 0.08);
        }
      `}</style>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-purple-100 px-3 py-3">
        <div className="w-full px-1 md:px-3 flex items-center gap-2">
          <button onClick={handleBack} className="app-btn-soft p-2 text-purple-700"><ArrowLeft className="w-4 h-4" /></button>
          {!showChooser && <input value={title} disabled={readonly} onChange={(e) => setTitle(e.target.value)} className="flex-1 min-w-0 h-10 rounded-xl border border-purple-100 px-3 text-sm font-semibold text-gray-800 bg-white" />}
          {!readonly && !showChooser && kind && (
            <span className={`hidden md:inline-flex h-8 px-3 rounded-full border text-xs font-semibold items-center ${hasUnsavedChanges ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {hasUnsavedChanges ? "Cambios pendientes" : "Guardado"}
            </span>
          )}
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
        <aside className="app-sidebar-shell rounded-2xl p-3">
          {!readonly && (!isCompactLayout || mobileOptionsOpen) && <div className="flex items-center gap-2 mb-3"><button onClick={newProject} className="app-btn-soft h-9 px-3 text-sm text-purple-700 flex items-center gap-2"><Plus className="w-4 h-4" />Nuevo</button>{!showChooser && <button onClick={() => { const blob = new Blob([JSON.stringify({ title, ...payload() }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${title || "proyecto"}.json`; a.click(); URL.revokeObjectURL(url); }} className="app-btn-soft h-9 px-3 text-sm text-cyan-700 flex items-center gap-2"><Download className="w-4 h-4" />JSON</button>}</div>}
          {!readonly && !showChooser && kind === "mindmap" && (!isCompactLayout || mobileOptionsOpen) && (
            <div className="app-ai-card mb-3 p-3">
              <button onClick={() => setShowAiIdeas((p) => !p)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_6px_14px_rgba(37,99,235,0.28)]"><Lightbulb className="w-4 h-4" /></span>
                  <p className="text-[18px] font-semibold tracking-tight text-slate-800">Generar ideas</p>
                </div>
                {showAiIdeas ? <ChevronUp className="w-4 h-4 text-cyan-700" /> : <ChevronDown className="w-4 h-4 text-cyan-700" />}
              </button>
              {showAiIdeas && (
                <div className="mt-3 space-y-3">
                  <p className="text-[15px] text-slate-600 leading-5">Comienza tu mapa mental con IA</p>
                  <textarea value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Que quieres mapear mentalmente?" className="app-ai-input w-full min-h-[94px] resize-none px-3 py-3 text-[16px] leading-5 placeholder:text-slate-400" />
                  <div>
                    <p className="text-[15px] font-medium text-slate-700 mb-2">Resultados</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAiResultMode("ideas")} className={`app-pill ${aiResultMode === "ideas" ? "is-active" : ""}`}>Ideas</button>
                      <button onClick={() => setAiResultMode("explicar")} className={`app-pill ${aiResultMode === "explicar" ? "is-active" : ""}`}>Explicar</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-slate-700 mb-2">Neuro-configuraciones</p>
                    <button onClick={() => setAiConfigMode((p) => (p === "basico" ? "profundo" : "basico"))} className="app-pill inline-flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5 text-blue-600" />{aiConfigMode === "basico" ? "Configuracion basica" : "Configuracion profunda"}</button>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 text-[15px] text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={aiIncludeImages} onChange={(e) => setAiIncludeImages(e.target.checked)} className="app-checkbox" />
                      Imagenes
                    </label>
                    <label className="inline-flex items-center gap-2 text-[15px] text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={aiIncludeNotes} onChange={(e) => setAiIncludeNotes(e.target.checked)} className="app-checkbox" />
                      Notas
                    </label>
                  </div>
                  <button onClick={generateAiIdeas} disabled={aiBusy || !aiTopic.trim()} className="app-btn-primary app-create-btn w-full disabled:opacity-50">{aiBusy ? `Generando... ${aiProgress}%` : "CREAR"}</button>
                  {aiBusy && <div className="w-full h-2 rounded-full bg-cyan-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300" style={{ width: `${aiProgress}%` }} /></div>}
                </div>
              )}
            </div>
          )}
          {(!isCompactLayout || mobileSidebarOpen) && <div className="space-y-2 max-h-[40vh] md:max-h-[65vh] overflow-auto pr-1">
            {!readonly && maps.length === 0 && (
              <div className="app-empty-projects-card p-4">
                <p className="text-sm text-gray-600 relative z-[1]">Aun no tienes proyectos creados.</p>
              </div>
            )}
            {!readonly && maps.map((m) => { const d = parseData(m.data); return <div key={m.id} className={`rounded-xl border p-2 ${activeId === m.id ? "border-purple-400 bg-purple-50" : "border-purple-100 bg-white"}`}><button className="project-open-btn w-full text-left" onClick={() => openMap(m)}><p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p><p className="text-[11px] text-gray-500">{kindLabel(d.kind)} - {new Date(m.updatedAt).toLocaleString("es-BO")}</p></button><div className="mt-2 flex items-center gap-2"><button className="h-7 px-2 rounded-md border border-cyan-200 text-xs text-cyan-700 bg-white flex items-center gap-1" onClick={() => shareProject(m.id)}><Share2 className="w-3.5 h-3.5" />Compartir</button><button className="h-7 px-2 rounded-md border border-rose-200 text-xs text-rose-700 flex items-center gap-1" onClick={() => deleteProject(m.id)}><Trash2 className="w-3.5 h-3.5" />Eliminar</button></div></div>; })}
          </div>}
          {(!isCompactLayout || mobileSidebarOpen) && shareUrl && <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50/60 p-2"><p className="text-[11px] text-cyan-700 break-all">{shareUrl}</p></div>}
        </aside>
        )}

        <section className={`w-full rounded-2xl overflow-hidden ${showChooser ? "app-chooser-shell" : "border border-purple-100 bg-white shadow-[0_10px_30px_rgba(17,24,39,0.09)]"}`}>
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
                <div className="border-b border-purple-100 p-2 space-y-2">
                  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
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
                      className="h-9 px-3 shrink-0 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2"
                      style={{ background: "linear-gradient(135deg, #00d9ff 0%, #8a3ffc 100%)" }}
                    >
                      <Plus className="w-4 h-4" />
                      Nodo
                    </button>
                    <button onClick={() => setConnectFromId(selectedNodeId)} disabled={!selectedNodeId} className="h-9 px-3 shrink-0 rounded-lg border border-purple-200 text-sm font-medium text-purple-700 disabled:opacity-50">{connectFromId ? "Toca nodo destino..." : "Conectar nodos"}</button>
                    <button onClick={duplicateSelectedNode} disabled={!selectedNodeId} className="h-9 px-3 shrink-0 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700 inline-flex items-center gap-1.5 disabled:opacity-50"><Copy className="w-4 h-4" />Duplicar</button>
                    <button onClick={() => centerBoardOnNode()} disabled={!selectedNodeId} className="h-9 px-3 shrink-0 rounded-lg border border-indigo-200 text-sm font-medium text-indigo-700 inline-flex items-center gap-1.5 disabled:opacity-50"><Crosshair className="w-4 h-4" />Centrar</button>
                    <button onClick={reorderMindmap} disabled={!nodes.length} className="h-9 px-3 shrink-0 rounded-lg border border-indigo-200 text-sm font-medium text-indigo-700 disabled:opacity-50">Ordenar</button>
                    <button onClick={() => setBoardZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))))} className="h-9 px-3 shrink-0 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700">-</button>
                    <span className="text-xs font-semibold text-gray-600 w-12 shrink-0 text-center">{Math.round(boardZoom * 100)}%</span>
                    <button onClick={() => setBoardZoom((z) => Math.min(2.2, Number((z + 0.1).toFixed(2))))} className="h-9 px-3 shrink-0 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700">+</button>
                    <button onClick={() => { if (!selectedNodeId) return; setNodes((p) => p.filter((n) => n.id !== selectedNodeId)); setEdges((p) => p.filter((e) => e.sourceId !== selectedNodeId && e.targetId !== selectedNodeId)); setSelectedNodeId(null); }} disabled={!selectedNodeId} className="h-9 px-3 shrink-0 rounded-lg border border-rose-200 text-sm font-medium text-rose-700 disabled:opacity-50">Eliminar nodo</button>
                    <button onClick={toggleMobileLandscape} className="h-9 px-3 shrink-0 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700 md:hidden inline-flex items-center gap-1"><RotateCw className="w-4 h-4" />Horizontal</button>
                    <label className="h-9 px-3 shrink-0 rounded-lg border border-cyan-200 text-sm font-medium text-cyan-700 inline-flex items-center gap-2 cursor-pointer">
                      <ImagePlus className="w-4 h-4" />
                      Imagen
                      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleNodeImageUpload(e.target.files?.[0] || null); e.currentTarget.value = ""; }} />
                    </label>
                    <button onClick={() => { if (!selectedNodeId) return; setNodes((p) => p.map((n) => (n.id === selectedNodeId ? { ...n, imageUrl: "" } : n))); }} disabled={!selectedNodeId} className="h-9 px-3 shrink-0 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50">Quitar imagen</button>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <span className="text-[11px] text-gray-500 shrink-0">Arrastra fondo para mover el lienzo</span>
                    <div className="relative w-full">
                      <span className="app-inline-icon absolute left-3 top-1/2 -translate-y-1/2">
                        <PencilRuler className="w-3 h-3" />
                      </span>
                      <input value={selectedNode?.text || ""} disabled={!selectedNode} onChange={(e) => setNodes((p) => p.map((n) => (n.id === selectedNodeId ? { ...n, text: e.target.value } : n)))} className="app-inline-input w-full pl-10 pr-3 text-sm placeholder:text-slate-400" placeholder="Texto del nodo" />
                    </div>
                  </div>
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
                    <div className="relative min-w-0 flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 inline-flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </span>
                      <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Nueva tarea" className="h-11 min-w-0 w-full rounded-xl border border-cyan-200 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white shadow-sm" />
                    </div>
                    <div className="flex gap-2">
                      <select value={taskColId} onChange={(e) => setTaskColId(e.target.value)} className="h-11 min-w-0 flex-1 sm:flex-none sm:w-auto rounded-xl border border-cyan-200 px-3 text-sm font-medium text-cyan-700 bg-white">
                        {cols.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <button onClick={() => { if (!taskText.trim()) return; setCols((p) => p.map((c) => c.id === taskColId ? { ...c, tasks: [...c.tasks, { id: `task_${Date.now()}`, text: taskText.trim(), checklist: [], note: "", priority: "medium", dueDate: "", status: statusByColumnId(taskColId), comments: [], attachments: [] }] } : c)); setTaskText(""); }} className="app-btn-primary h-11 px-4 text-sm font-semibold whitespace-nowrap">Agregar</button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-fuchsia-100 text-fuchsia-700 inline-flex items-center justify-center">
                        <Columns3 className="w-3 h-3" />
                      </span>
                      <input value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} placeholder="Nueva columna" className="h-11 w-full rounded-xl border border-fuchsia-200 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-500 bg-white shadow-sm" />
                    </div>
                    <button onClick={() => { const name = newColTitle.trim(); if (!name) return; const id = `col_${Date.now()}`; setCols((p) => [...p, { id, title: name, tasks: [] }]); setTaskColId(id); setNewColTitle(""); }} className="app-btn-soft h-11 px-4 text-sm text-fuchsia-700">+ Columna</button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative min-w-0 flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 text-slate-600 inline-flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.5-3.5" />
                        </svg>
                      </span>
                      <input
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        placeholder="Buscar tarea..."
                        className="h-11 min-w-0 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 bg-white shadow-sm"
                      />
                    </div>
                    <select
                      value={taskFilter}
                      onChange={(e) => setTaskFilter(e.target.value as "all" | "pending" | "done" | "overdue")}
                      className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 bg-white"
                    >
                      <option value="all">Todas</option>
                      <option value="pending">Pendientes</option>
                      <option value="done">Hechas</option>
                      <option value="overdue">Atrasadas</option>
                    </select>
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
                          if (col.id === c.id) return { ...col, tasks: [...col.tasks, { ...task, status: statusByColumnId(c.id) }] };
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
                      <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                        {c.tasks.filter((t) => matchTaskFilter(t) && (t.status || "todo") === "done").length}/
                        {c.tasks.filter((t) => matchTaskFilter(t)).length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {c.tasks.filter((t) => matchTaskFilter(t)).map((t) => (
                        <div key={t.id} draggable={!readonly} onDragStart={() => { dragTask.current = { fromColId: c.id, task: t }; }} className={`min-w-0 rounded-xl border bg-white p-2 shadow-sm ${isTaskOverdue(t) ? "border-rose-200" : isTaskDueSoon(t) ? "border-amber-200" : "border-purple-100"}`}>
                          <button className="project-open-btn w-full text-left" onClick={() => setTaskModal({ colId: c.id, taskId: t.id })}>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-700 break-words">{t.text}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                (t.priority || "medium") === "high"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : (t.priority || "medium") === "low"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}>
                                {(t.priority || "medium") === "high" ? "Alta" : (t.priority || "medium") === "low" ? "Baja" : "Media"}
                              </span>
                            </div>
                            {(t.note || "").trim() && <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 break-words">{t.note}</p>}
                            {t.dueDate && <p className={`mt-1 text-[10px] ${isTaskOverdue(t) ? "text-rose-600" : isTaskDueSoon(t) ? "text-amber-600" : "text-slate-500"}`}>Vence: {t.dueDate}</p>}
                            {(((t.comments || []).length > 0) || ((t.attachments || []).length > 0)) && (
                              <p className="mt-1 text-[10px] text-slate-500">
                                {(t.comments || []).length} comentarios · {(t.attachments || []).length} adjuntos
                              </p>
                            )}
                          </button>
                          {!readonly && (
                            <div className="mt-1 flex justify-end">
                              <button
                                className="app-btn-soft h-6 px-2 text-[10px] text-cyan-700"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => setTaskModal({ colId: c.id, taskId: t.id })}
                              >
                                Editar
                              </button>
                            </div>
                          )}
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
              {taskModal && activeTaskModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setTaskModal(null)}>
                  <div className="w-full md:max-w-xl bg-white rounded-t-2xl md:rounded-2xl border border-purple-100 shadow-[0_24px_50px_rgba(15,23,42,0.28)] p-4 space-y-3 max-h-[86vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-bold text-slate-800">Detalle de tarea</p>
                      <button className="app-btn-soft h-8 px-2 text-xs text-slate-700" onClick={() => setTaskModal(null)}>Cerrar</button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Titulo</label>
                      <input
                        value={activeTaskModal.task.text}
                        onChange={(e) => patchTask(activeTaskModal.col.id, activeTaskModal.task.id, { text: e.target.value })}
                        disabled={readonly}
                        className="h-10 w-full rounded-lg border border-purple-100 px-3 text-sm text-gray-800 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Prioridad</label>
                        <select
                          value={activeTaskModal.task.priority || "medium"}
                          disabled={readonly}
                          onChange={(e) => patchTask(activeTaskModal.col.id, activeTaskModal.task.id, { priority: toTaskPriority(e.target.value) })}
                          className="h-10 w-full rounded-lg border border-purple-100 px-2 text-sm text-slate-700 bg-white"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Estado</label>
                        <select
                          value={activeTaskModal.task.status || statusByColumnId(activeTaskModal.col.id)}
                          disabled={readonly}
                          onChange={(e) => moveTaskToStatus(activeTaskModal.col.id, activeTaskModal.task.id, toTaskStatus(e.target.value))}
                          className="h-10 w-full rounded-lg border border-purple-100 px-2 text-sm text-slate-700 bg-white"
                        >
                          <option value="todo">Por hacer</option>
                          <option value="doing">En proceso</option>
                          <option value="done">Hecho</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Fecha limite</label>
                        <input
                          type="date"
                          value={activeTaskModal.task.dueDate || ""}
                          disabled={readonly}
                          onChange={(e) => patchTask(activeTaskModal.col.id, activeTaskModal.task.id, { dueDate: e.target.value })}
                          className="h-10 w-full rounded-lg border border-purple-100 px-2 text-sm text-slate-700 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Nota</label>
                      <textarea
                        value={activeTaskModal.task.note || ""}
                        disabled={readonly}
                        onChange={(e) => patchTask(activeTaskModal.col.id, activeTaskModal.task.id, { note: e.target.value })}
                        placeholder="Escribe detalles de la tarea..."
                        className="min-h-[120px] w-full resize-y rounded-lg border border-purple-100 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-600">Adjuntos</label>
                        {!readonly && (
                          <button
                            className="app-btn-soft h-8 px-3 text-xs text-cyan-700"
                            onClick={() => taskAttachmentInputRef.current?.click()}
                          >
                            Subir archivo
                          </button>
                        )}
                        <input
                          ref={taskAttachmentInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => {
                            handleTaskAttachmentUpload(e.target.files?.[0] || null, activeTaskModal.col.id, activeTaskModal.task.id);
                            e.currentTarget.value = "";
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        {(activeTaskModal.task.attachments || []).length === 0 && (
                          <p className="text-xs text-slate-400">Sin adjuntos</p>
                        )}
                        {(activeTaskModal.task.attachments || []).map((att) => (
                          <div key={att.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <a href={att.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-cyan-700 truncate">
                                {att.name}
                              </a>
                              {!readonly && (
                                <button className="app-btn-danger h-6 px-2 text-[10px]" onClick={() => removeTaskAttachment(activeTaskModal.col.id, activeTaskModal.task.id, att.id)}>
                                  Quitar
                                </button>
                              )}
                            </div>
                            {att.mimeType.startsWith("image/") && (
                              <img src={att.url} alt={att.name} className="mt-2 max-h-36 w-full object-cover rounded-md border border-slate-200" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Comentarios</label>
                      <div className="space-y-2 max-h-40 overflow-auto pr-1">
                        {(activeTaskModal.task.comments || []).length === 0 && (
                          <p className="text-xs text-slate-400">Sin comentarios</p>
                        )}
                        {(activeTaskModal.task.comments || []).map((cm) => (
                          <div key={cm.id} className="rounded-lg border border-slate-200 bg-white p-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-slate-700 break-words">{cm.text}</p>
                              {!readonly && (
                                <button className="app-btn-danger h-6 px-2 text-[10px]" onClick={() => removeTaskComment(activeTaskModal.col.id, activeTaskModal.task.id, cm.id)}>
                                  X
                                </button>
                              )}
                            </div>
                            <p className="mt-1 text-[10px] text-slate-400">{new Date(cm.createdAt).toLocaleString("es-BO")}</p>
                          </div>
                        ))}
                      </div>
                      {!readonly && (
                        <div className="flex items-center gap-2">
                          <input
                            value={taskCommentDraft}
                            onChange={(e) => setTaskCommentDraft(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="h-9 flex-1 rounded-lg border border-purple-100 px-3 text-sm text-slate-700 bg-white"
                          />
                          <button className="app-btn-primary h-9 px-3 text-xs" onClick={() => addTaskComment(activeTaskModal.col.id, activeTaskModal.task.id)}>
                            Agregar
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button className="app-btn-primary h-10 px-4 text-sm" onClick={() => setTaskModal(null)}>Listo</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-[66vh] md:min-h-[74vh]">
              {!readonly && (
                <div className="whiteboard-toolbar">
                  {["#7c3aed", "#00bcd4", "#ef4444", "#111827"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      className={`w-8 h-8 rounded-full border-2 ${penColor === c ? "border-slate-700" : "border-white"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="h-10 px-3 rounded-xl border border-cyan-200 bg-white inline-flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Grosor</span>
                    <input type="range" min={1} max={8} value={penWidth} onChange={(e) => setPenWidth(Number(e.target.value))} />
                  </div>
                  <button onClick={() => setStrokes([])} className="app-btn-danger h-10 px-3 text-sm text-rose-700">Limpiar</button>
                </div>
              )}
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


