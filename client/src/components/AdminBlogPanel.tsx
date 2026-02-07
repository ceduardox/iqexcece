import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, X, Eye, Pencil, ChevronDown, Image, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCategory {
  id: string;
  nombre: string;
  color: string | null;
  orden: number | null;
  isActive: boolean | null;
}

interface BlogPost {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagenPortada: string | null;
  contenido: string;
  categoriaId: string | null;
  estado: string | null;
  autor: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AdminBlogPanelProps {
  token: string;
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      execCommand("insertHTML", `<img src="${imageUrl}" style="max-width:100%;border-radius:8px;margin:12px 0;" />`);
      setImageUrl("");
      setShowImageInput(false);
    }
  };

  const setFontSize = (size: string) => {
    execCommand("fontSize", size);
  };

  const setColor = (color: string) => {
    execCommand("foreColor", color);
  };

  return (
    <div className="border border-white/20 rounded-lg overflow-hidden">
      <div className="bg-white/5 p-2 flex flex-wrap gap-1 border-b border-white/10">
        <button onClick={() => execCommand("bold")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 font-bold text-sm" data-testid="editor-bold" title="Negrita">B</button>
        <button onClick={() => execCommand("italic")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 italic text-sm" title="Cursiva">I</button>
        <button onClick={() => execCommand("underline")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 underline text-sm" title="Subrayado">U</button>
        <span className="w-px h-6 bg-white/20 mx-1" />
        <select onChange={(e) => setFontSize(e.target.value)} className="bg-white/10 text-white/80 text-xs rounded px-1 py-1 border-0" defaultValue="" data-testid="editor-fontsize">
          <option value="" disabled>Tamaño</option>
          <option value="1">Pequeño</option>
          <option value="3">Normal</option>
          <option value="5">Grande</option>
          <option value="7">Muy Grande</option>
        </select>
        <span className="w-px h-6 bg-white/20 mx-1" />
        <button onClick={() => execCommand("justifyLeft")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 text-xs" title="Izquierda">Izq</button>
        <button onClick={() => execCommand("justifyCenter")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 text-xs" title="Centro">Centro</button>
        <button onClick={() => execCommand("justifyRight")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 text-xs" title="Derecha">Der</button>
        <span className="w-px h-6 bg-white/20 mx-1" />
        <input type="color" onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" title="Color" data-testid="editor-color" />
        <button onClick={() => setShowImageInput(!showImageInput)} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 text-xs flex items-center gap-1" title="Insertar imagen" data-testid="editor-image">
          <Image className="w-3 h-3" /> Img
        </button>
        <button onClick={() => execCommand("insertUnorderedList")} className="px-2 py-1 rounded text-white/80 hover:bg-white/10 text-xs" title="Lista">Lista</button>
      </div>
      {showImageInput && (
        <div className="bg-white/5 p-2 flex gap-2 border-b border-white/10">
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL de la imagen..." className="bg-white/10 border-white/20 text-white text-xs flex-1" data-testid="editor-image-url" />
          <Button size="sm" onClick={insertImage} className="bg-purple-600" data-testid="editor-image-insert">Insertar</Button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[250px] p-4 text-white/90 bg-white/5 outline-none prose prose-invert max-w-none"
        style={{ fontSize: "14px", lineHeight: "1.6" }}
        data-testid="editor-content"
      />
    </div>
  );
}

export default function AdminBlogPanel({ token }: AdminBlogPanelProps) {
  const [subTab, setSubTab] = useState<"posts" | "categorias">("posts");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#7c3aed");
  const [postForm, setPostForm] = useState({
    titulo: "",
    descripcion: "",
    imagenPortada: "",
    contenido: "",
    categoriaId: "",
    estado: "borrador",
    autor: "IQ Exponencial"
  });

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, postsRes] = await Promise.all([
        fetch("/api/admin/blog-categories", { headers }),
        fetch("/api/admin/blog-posts", { headers })
      ]);
      const catsData = await catsRes.json();
      const postsData = await postsRes.json();
      setCategories(catsData.categories || []);
      setPosts(postsData.posts || []);
      setTotalPosts(postsData.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const saveCategory = async () => {
    if (!newCatName.trim()) return;
    await fetch("/api/admin/blog-categories", {
      method: "POST",
      headers,
      body: JSON.stringify({ nombre: newCatName, color: newCatColor, orden: categories.length })
    });
    setNewCatName("");
    loadData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Eliminar esta categoría?")) return;
    await fetch(`/api/admin/blog-categories/${id}`, { method: "DELETE", headers });
    loadData();
  };

  const toggleCategoryActive = async (cat: BlogCategory) => {
    await fetch(`/api/admin/blog-categories/${cat.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ isActive: !cat.isActive })
    });
    loadData();
  };

  const startNewPost = () => {
    setIsNewPost(true);
    setEditingPost(null);
    setPostForm({ titulo: "", descripcion: "", imagenPortada: "", contenido: "", categoriaId: "", estado: "borrador", autor: "IQ Exponencial" });
  };

  const startEditPost = (post: BlogPost) => {
    setIsNewPost(false);
    setEditingPost(post);
    setPostForm({
      titulo: post.titulo,
      descripcion: post.descripcion || "",
      imagenPortada: post.imagenPortada || "",
      contenido: post.contenido,
      categoriaId: post.categoriaId || "",
      estado: post.estado || "borrador",
      autor: post.autor || "IQ Exponencial"
    });
  };

  const savePost = async () => {
    if (!postForm.titulo.trim() || !postForm.contenido.trim()) return;
    if (editingPost) {
      await fetch(`/api/admin/blog-posts/${editingPost.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(postForm)
      });
    } else {
      await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers,
        body: JSON.stringify(postForm)
      });
    }
    setEditingPost(null);
    setIsNewPost(false);
    loadData();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Eliminar este post?")) return;
    await fetch(`/api/admin/blog-posts/${id}`, { method: "DELETE", headers });
    loadData();
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setIsNewPost(false);
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "Sin categoría";
    const cat = categories.find(c => c.id === catId);
    return cat?.nombre || "Sin categoría";
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (editingPost || isNewPost) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{editingPost ? "Editar Post" : "Nuevo Post"}</h2>
          <Button variant="outline" size="sm" onClick={cancelEdit} className="border-white/20 text-white/70" data-testid="button-cancel-edit">
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Título *</label>
              <Input value={postForm.titulo} onChange={(e) => setPostForm({...postForm, titulo: e.target.value})} placeholder="Título del post..." className="bg-white/10 border-white/20 text-white" data-testid="input-post-title" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Descripción corta</label>
              <Input value={postForm.descripcion} onChange={(e) => setPostForm({...postForm, descripcion: e.target.value})} placeholder="Breve descripción..." className="bg-white/10 border-white/20 text-white" data-testid="input-post-description" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Imagen de portada (URL)</label>
              <Input value={postForm.imagenPortada} onChange={(e) => setPostForm({...postForm, imagenPortada: e.target.value})} placeholder="https://..." className="bg-white/10 border-white/20 text-white" data-testid="input-post-image" />
              {postForm.imagenPortada && (
                <img src={postForm.imagenPortada} className="mt-2 rounded-lg max-h-32 object-cover" alt="Preview" />
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Categoría</label>
              <select value={postForm.categoriaId} onChange={(e) => setPostForm({...postForm, categoriaId: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm" data-testid="select-post-category">
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Estado</label>
              <select value={postForm.estado} onChange={(e) => setPostForm({...postForm, estado: e.target.value})} className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm" data-testid="select-post-status">
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Autor</label>
              <Input value={postForm.autor} onChange={(e) => setPostForm({...postForm, autor: e.target.value})} className="bg-white/10 border-white/20 text-white" data-testid="input-post-author" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs mb-1 block">Contenido *</label>
          <RichTextEditor key={editingPost?.id || "new"} value={postForm.contenido} onChange={(v) => setPostForm({...postForm, contenido: v})} />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={cancelEdit} className="border-white/20 text-white/70" data-testid="button-cancel">Cancelar</Button>
          <Button onClick={savePost} className="bg-green-600 hover:bg-green-700" data-testid="button-save-post">
            <Save className="w-4 h-4 mr-1" /> {editingPost ? "Actualizar" : "Crear Post"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-white">Blog</h2>
        <div className="flex gap-2">
          <Button onClick={() => setSubTab("posts")} variant={subTab === "posts" ? "default" : "outline"} size="sm" className={subTab === "posts" ? "bg-purple-600" : "border-purple-500/30 text-purple-400"} data-testid="button-subtab-posts">
            Posts ({totalPosts})
          </Button>
          <Button onClick={() => setSubTab("categorias")} variant={subTab === "categorias" ? "default" : "outline"} size="sm" className={subTab === "categorias" ? "bg-cyan-600" : "border-cyan-500/30 text-cyan-400"} data-testid="button-subtab-categories">
            <Tag className="w-4 h-4 mr-1" /> Categorías
          </Button>
        </div>
      </div>

      {subTab === "categorias" && (
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-white/60 text-xs mb-1 block">Nueva categoría</label>
              <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nombre..." className="bg-white/10 border-white/20 text-white" data-testid="input-category-name" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Color</label>
              <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border border-white/20" data-testid="input-category-color" />
            </div>
            <Button onClick={saveCategory} className="bg-green-600" data-testid="button-add-category">
              <Plus className="w-4 h-4 mr-1" /> Agregar
            </Button>
          </div>

          {categories.map(cat => (
            <Card key={cat.id} className="bg-white/5 border-white/10">
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: cat.color || "#7c3aed" }} />
                  <span className="text-white font-medium text-sm">{cat.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {cat.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => toggleCategoryActive(cat)} className="border-white/20 text-white/60 text-xs" data-testid={`button-toggle-cat-${cat.id}`}>
                    {cat.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteCategory(cat.id)} className="border-red-500/30 text-red-400 text-xs" data-testid={`button-delete-cat-${cat.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <p className="text-white/40 text-center py-4 text-sm">No hay categorías creadas</p>
          )}
        </div>
      )}

      {subTab === "posts" && (
        <div className="space-y-3">
          <Button onClick={startNewPost} className="bg-purple-600 hover:bg-purple-700" data-testid="button-new-post">
            <Plus className="w-4 h-4 mr-1" /> Nuevo Post
          </Button>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-white/40 text-center py-8 text-sm">No hay posts creados</p>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="bg-white/5 border-white/10">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      {post.imagenPortada && (
                        <img src={post.imagenPortada} className="w-16 h-16 rounded-lg object-cover shrink-0" alt="" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-medium text-sm truncate">{post.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                            background: categories.find(c => c.id === post.categoriaId)?.color + "20" || "rgba(124,58,237,0.1)",
                            color: categories.find(c => c.id === post.categoriaId)?.color || "#7c3aed"
                          }}>
                            {getCategoryName(post.categoriaId)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${post.estado === "publicado" ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {post.estado === "publicado" ? "Publicado" : "Borrador"}
                          </span>
                          <span className="text-white/40 text-xs">{formatDate(post.createdAt)}</span>
                        </div>
                        {post.descripcion && (
                          <p className="text-white/50 text-xs mt-1 truncate">{post.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => startEditPost(post)} className="border-white/20 text-white/60" data-testid={`button-edit-post-${post.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deletePost(post.id)} className="border-red-500/30 text-red-400" data-testid={`button-delete-post-${post.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}