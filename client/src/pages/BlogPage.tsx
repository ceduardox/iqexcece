import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, ChevronRight, ChevronDown, User, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";
import { TrainingNavBar } from "@/components/TrainingNavBar";

interface BlogCategory {
  id: string;
  nombre: string;
  color: string | null;
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
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getExcerpt(html: string, desc: string | null): string {
  if (desc && desc.trim()) return desc.length > 120 ? desc.slice(0, 120) + "..." : desc;
  const text = html.replace(/<[^>]*>/g, "");
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length >= 2) {
    const twoSentences = sentences.slice(0, 2).join(" ");
    return twoSentences.length > 150 ? twoSentences.slice(0, 150) + "..." : twoSentences + "...";
  }
  return text.length > 150 ? text.slice(0, 150) + "..." : text + "...";
}

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [, navigate] = useLocation();
  const { playSound } = useSounds();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery<{ categories: BlogCategory[] }>({
    queryKey: ["/api/blog-categories"]
  });

  const { data: postsData, isLoading } = useQuery<{ posts: BlogPost[]; total: number; page: number; totalPages: number }>({
    queryKey: ["/api/blog-posts", selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoriaId", selectedCategory);
      params.append("page", page.toString());
      params.append("limit", "10");
      const res = await fetch(`/api/blog-posts?${params}`);
      if (!res.ok) throw new Error("Error loading posts");
      return res.json();
    }
  });

  const categories = categoriesData?.categories || [];
  const posts = postsData?.posts || [];
  const totalPages = postsData?.totalPages || 1;

  const handleCategoryClick = (catId: string) => {
    playSound("iphone");
    setSelectedCategory(catId === selectedCategory ? "" : catId);
    setPage(1);
  };

  const getCategoryColor = (catId: string | null): string => {
    if (!catId) return "#7c3aed";
    return categories.find(c => c.id === catId)?.color || "#7c3aed";
  };

  const getCategoryName = (catId: string | null): string => {
    if (!catId) return "";
    return categories.find(c => c.id === catId)?.nombre || "";
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 70%, #f0fdff 100%)" }}>
      <header className="relative px-4 py-4 flex items-center justify-between">
        <motion.button
          onClick={() => { playSound("iphone"); window.history.back(); }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <h1 className="text-lg font-bold text-gray-800">Blog</h1>
        <div className="w-10" />
      </header>

      {categories.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              onClick={() => handleCategoryClick("")}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                !selectedCategory 
                  ? "text-white shadow-md" 
                  : "bg-white text-gray-600 shadow-sm"
              }`}
              style={!selectedCategory ? { background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" } : {}}
              whileTap={{ scale: 0.95 }}
              data-testid="button-category-all"
            >
              Todos
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id 
                    ? "text-white shadow-md" 
                    : "bg-white text-gray-600 shadow-sm"
                }`}
                style={selectedCategory === cat.id ? { background: cat.color || "#7c3aed", boxShadow: `0 4px 12px ${cat.color || "#7c3aed"}40` } : {}}
                whileTap={{ scale: 0.95 }}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.nombre}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 px-4 pb-28">
        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-3 border-purple-100 border-t-purple-500 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <p className="text-gray-500 text-sm">No hay publicaciones aún</p>
              <p className="text-gray-400 text-xs mt-1">Pronto tendremos contenido interesante para ti</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                  style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.06)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSound("card"); navigate(`/blog/${post.id}`); }}
                  data-testid={`card-post-${post.id}`}
                >
                  {post.imagenPortada && (
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={post.imagenPortada} 
                        alt={post.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {post.categoriaId && getCategoryName(post.categoriaId) && (
                        <span 
                          className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-medium text-white"
                          style={{ background: getCategoryColor(post.categoriaId) + "cc" }}
                          data-testid={`badge-category-${post.id}`}
                        >
                          {getCategoryName(post.categoriaId)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {!post.imagenPortada && post.categoriaId && getCategoryName(post.categoriaId) && (
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-medium text-white mb-2"
                        style={{ background: getCategoryColor(post.categoriaId) }}
                      >
                        {getCategoryName(post.categoriaId)}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-gray-800 leading-tight mb-2">{post.titulo}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">
                      {getExcerpt(post.contenido, post.descripcion)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-400">
                        {post.autor && (
                          <span className="flex items-center gap-1 text-[10px]">
                            <User className="w-3 h-3" />
                            {post.autor}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />
                          {estimateReadingTime(post.contenido)} min
                        </span>
                      </div>
                      <span 
                        className="text-xs font-semibold flex items-center gap-0.5"
                        style={{ color: getCategoryColor(post.categoriaId) }}
                        data-testid={`link-read-more-${post.id}`}
                      >
                        Leer más <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <motion.div 
              className="flex items-center justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => { setPage(Math.max(1, page - 1)); playSound("iphone"); }}
                disabled={page <= 1}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  page <= 1 ? "bg-gray-100 text-gray-300" : "bg-white text-purple-600 shadow-sm"
                }`}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { setPage(p); playSound("iphone"); }}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    page === p 
                      ? "text-white shadow-md" 
                      : "bg-white text-gray-600 shadow-sm"
                  }`}
                  style={page === p ? { background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" } : {}}
                  data-testid={`button-page-${p}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => { setPage(Math.min(totalPages, page + 1)); playSound("iphone"); }}
                disabled={page >= totalPages}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  page >= totalPages ? "bg-gray-100 text-gray-300" : "bg-white text-purple-600 shadow-sm"
                }`}
                data-testid="button-next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <TrainingNavBar activePage="blog" categoria="ninos" />
    </div>
  );
}
