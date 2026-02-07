import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, ChevronRight, ChevronLeft, User, Calendar, X, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";

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
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default function BlogPage() {
  const [, navigate] = useLocation();
  const { playSound } = useSounds();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const { data: categoriesData } = useQuery<{ categories: BlogCategory[] }>({
    queryKey: ["/api/blog-categories"]
  });

  const { data: postsData, isLoading } = useQuery<{ posts: BlogPost[]; total: number; page: number; totalPages: number }>({
    queryKey: ["/api/blog-posts", selectedCategory, page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoriaId", selectedCategory);
      if (debouncedSearch) params.append("search", debouncedSearch);
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

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const remainingPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafe]">
      <CurvedHeader
        showBack
        onBack={() => window.history.back()}
        rightElement={
          <motion.button
            onClick={() => { setSearchOpen(!searchOpen); playSound("iphone"); }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: searchOpen ? "linear-gradient(135deg, #7c3aed, #06b6d4)" : "rgba(255,255,255,0.9)",
              boxShadow: "0 2px 8px rgba(138,63,252,0.15)",
            }}
            whileTap={{ scale: 0.92 }}
            data-testid="button-search-toggle"
          >
            {searchOpen ? <X className="w-4 h-4 text-white" /> : <Search className="w-4 h-4" style={{ color: "#8a3ffc" }} />}
          </motion.button>
        }
      />

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="px-4 pt-1 pb-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm bg-white border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                style={{ boxShadow: "0 2px 12px rgba(124,58,237,0.06)" }}
                data-testid="input-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center"
                  data-testid="button-clear-search"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.length > 0 && (
        <div className="px-4 mb-3">
          <motion.div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.button
              onClick={() => handleCategoryClick("")}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !selectedCategory
                  ? "text-white"
                  : "bg-white text-gray-600 border border-gray-100"
              }`}
              style={!selectedCategory ? {
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.25)"
              } : { boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              whileTap={{ scale: 0.93 }}
              data-testid="button-category-all"
            >
              <Sparkles className="w-3 h-3" />
              Todos
            </motion.button>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "text-white"
                    : "bg-white text-gray-600 border border-gray-100"
                }`}
                style={selectedCategory === cat.id
                  ? { background: cat.color || "#7c3aed", boxShadow: `0 4px 14px ${cat.color || "#7c3aed"}30` }
                  : { boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                whileTap={{ scale: 0.93 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.nombre}
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}

      <main className="flex-1 px-4 pb-28">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" />
              <p className="text-xs text-gray-400">Cargando artículos...</p>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              className="bg-white rounded-2xl p-8 text-center"
              style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.06)" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)" }}>
                <svg className="w-10 h-10" style={{ color: "#a78bfa" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {debouncedSearch ? "No se encontraron artículos" : "No hay publicaciones aún"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {debouncedSearch ? "Intenta con otras palabras clave" : "Pronto tendremos contenido interesante para ti"}
              </p>
            </motion.div>
          ) : (
            <>
              {featuredPost && !debouncedSearch && page === 1 && (
                <motion.div
                  className="mb-5 rounded-2xl overflow-hidden cursor-pointer relative group"
                  style={{ boxShadow: "0 8px 30px rgba(124,58,237,0.1)" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => { playSound("card"); navigate(`/blog/${featuredPost.id}`); }}
                  data-testid={`card-featured-${featuredPost.id}`}
                >
                  <div className="relative h-52 md:h-64 overflow-hidden bg-gradient-to-br from-purple-400 to-cyan-400">
                    {featuredPost.imagenPortada ? (
                      <img
                        src={featuredPost.imagenPortada}
                        alt={featuredPost.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {featuredPost.categoriaId && getCategoryName(featuredPost.categoriaId) && (
                        <motion.span
                          className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white mb-2 backdrop-blur-sm"
                          style={{ background: getCategoryColor(featuredPost.categoriaId) + "bb" }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {getCategoryName(featuredPost.categoriaId)}
                        </motion.span>
                      )}
                      <h2 className="text-lg md:text-xl font-bold text-white leading-tight mb-1.5 drop-shadow-sm">
                        {featuredPost.titulo}
                      </h2>
                      <p className="text-white/80 text-xs md:text-sm leading-relaxed line-clamp-2 mb-2">
                        {getExcerpt(featuredPost.contenido, featuredPost.descripcion)}
                      </p>
                      <div className="flex items-center gap-3 text-white/60 text-[10px]">
                        {featuredPost.autor && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {featuredPost.autor}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(featuredPost.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {estimateReadingTime(featuredPost.contenido)} min
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(debouncedSearch || page > 1 ? posts : remainingPosts).map((post, index) => (
                  <motion.div
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ boxShadow: "0 2px 16px rgba(124,58,237,0.06)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { playSound("card"); navigate(`/blog/${post.id}`); }}
                    data-testid={`card-post-${post.id}`}
                  >
                    {post.imagenPortada && (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={post.imagenPortada}
                          alt={post.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {post.categoriaId && getCategoryName(post.categoriaId) && (
                          <span
                            className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white backdrop-blur-sm"
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
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white mb-2"
                          style={{ background: getCategoryColor(post.categoriaId) }}
                        >
                          {getCategoryName(post.categoriaId)}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-gray-800 leading-snug mb-1.5 line-clamp-2">{post.titulo}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {getExcerpt(post.contenido, post.descripcion)}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-gray-400 min-w-0">
                          {post.autor && (
                            <span className="flex items-center gap-1 text-[10px] truncate">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">{post.autor}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] shrink-0">
                            <Clock className="w-3 h-3" />
                            {estimateReadingTime(post.contenido)} min
                          </span>
                        </div>
                        <span
                          className="text-[11px] font-semibold flex items-center gap-0.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                          style={{ color: getCategoryColor(post.categoriaId) }}
                          data-testid={`link-read-more-${post.id}`}
                        >
                          Leer <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
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
                  page <= 1 ? "bg-gray-100 text-gray-300" : "bg-white text-purple-600"
                }`}
                style={page > 1 ? { boxShadow: "0 2px 8px rgba(124,58,237,0.1)" } : {}}
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
                      ? "text-white"
                      : "bg-white text-gray-600"
                  }`}
                  style={page === p
                    ? { background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }
                    : { boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                  data-testid={`button-page-${p}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => { setPage(Math.min(totalPages, page + 1)); playSound("iphone"); }}
                disabled={page >= totalPages}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  page >= totalPages ? "bg-gray-100 text-gray-300" : "bg-white text-purple-600"
                }`}
                style={page < totalPages ? { boxShadow: "0 2px 8px rgba(124,58,237,0.1)" } : {}}
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
