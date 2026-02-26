import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, ChevronRight, ChevronLeft, User, Calendar, X, Sparkles, Tag, Layers, ChevronDown, BookOpen, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSounds } from "@/hooks/use-sounds";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import laxCyan from "@assets/laxcyan2_1771479429192.png";
import laxPurpura from "@assets/laxpurpura_1771479319056.png";
import laxBlanca from "@assets/laxblanca_1771479319056.png";
import laxVerde from "@assets/laxverde_1771479319057.png";

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
  categoriaId: string | null;
  estado: string | null;
  autor: string | null;
  createdAt: string | null;
}

function estimateReadingTime(textInput: string): number {
  const text = (textInput || "").replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getExcerpt(desc: string | null): string {
  if (desc && desc.trim()) return desc.length > 120 ? desc.slice(0, 120) + "..." : desc;
  return "Sin descripción disponible.";
}

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function getCatPostCount(posts: BlogPost[], catId: string): number {
  if (!catId) return posts.length;
  return posts.filter(p => p.categoriaId === catId).length;
}

export default function BlogPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { playSound } = useSounds();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [desktopCatOpen, setDesktopCatOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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
    staleTime: 60_000,
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
  const totalPosts = postsData?.total || 0;

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

  const desktopCategorySidebar = (
    <motion.aside
      className="hidden md:block w-56 shrink-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden sticky top-4"
        style={{ boxShadow: "0 4px 20px rgba(124,58,237,0.06)" }}
      >
        <button
          onClick={() => setDesktopCatOpen(!desktopCatOpen)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)" }}
          data-testid="button-desktop-cat-toggle"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Layers className="w-4 h-4 text-purple-500" />
            Categorías
          </span>
          <motion.span
            animate={{ rotate: desktopCatOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {desktopCatOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-2 py-2 space-y-1">
                <motion.button
                  onClick={() => handleCategoryClick("")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    !selectedCategory
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={!selectedCategory ? {
                    background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.25)"
                  } : {}}
                  whileTap={{ scale: 0.97 }}
                  data-testid="button-desktop-category-all"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={!selectedCategory
                      ? { background: "rgba(255,255,255,0.2)" }
                      : { background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}
                  >
                    <Sparkles className={`w-4 h-4 ${!selectedCategory ? "text-white" : "text-purple-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold block">Todos</span>
                    <span className={`text-[10px] ${!selectedCategory ? "text-white/70" : "text-gray-400"}`}>
                      {totalPosts} artículos
                    </span>
                  </div>
                </motion.button>

                {categories.map((cat, i) => {
                  const isSelected = selectedCategory === cat.id;
                  const catColor = cat.color || "#7c3aed";
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={isSelected ? {
                        background: catColor,
                        boxShadow: `0 4px 14px ${catColor}30`
                      } : {}}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 + 0.1 }}
                      data-testid={`button-desktop-category-${cat.id}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={isSelected
                          ? { background: "rgba(255,255,255,0.2)" }
                          : { background: catColor + "15" }}
                      >
                        <Tag className="w-4 h-4" style={{ color: isSelected ? "white" : catColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold block truncate">{cat.nombre}</span>
                        <span className={`text-[10px] ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                          Ver artículos
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white/60" : "text-gray-300"}`} />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedCategory && (
        <motion.div
          className="mt-3 bg-white rounded-2xl p-4"
          style={{ boxShadow: "0 2px 12px rgba(124,58,237,0.05)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: getCategoryColor(selectedCategory) }}
            />
            <span className="text-xs font-bold text-gray-700">
              {getCategoryName(selectedCategory)}
            </span>
          </div>
          <p className="text-[10px] text-gray-400">
            {t("blog.filterShowing")}
          </p>
          <button
            onClick={() => handleCategoryClick("")}
            className="mt-2 text-[10px] font-semibold text-purple-500 flex items-center gap-1"
            data-testid="button-clear-category"
          >
            <X className="w-3 h-3" /> {t("blog.clearFilter")}
          </button>
        </motion.div>
      )}
    </motion.aside>
  );

  const mobileCategoryPills = (
    <div className="md:hidden px-4 mb-3">
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
          {t("blog.allCategories")}
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
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafe] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.img
          src={laxCyan}
          alt=""
          className="absolute opacity-[0.12] w-[250px] md:w-[600px]"
          style={{ top: "3%", right: "-70px" }}
          animate={isMobile ? undefined : { rotate: [0, 6, -5, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={isMobile ? undefined : { duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={laxPurpura}
          alt=""
          className="absolute opacity-[0.09] w-[180px] md:w-[480px]"
          style={{ top: "40%", left: "-50px" }}
          animate={isMobile ? undefined : { rotate: [0, -8, 4, 0], y: [0, 25, -15, 0] }}
          transition={isMobile ? undefined : { duration: 24, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.img
          src={laxVerde}
          alt=""
          className="absolute opacity-[0.10] w-[200px] md:w-[520px]"
          style={{ bottom: "8%", right: "-40px" }}
          animate={isMobile ? undefined : { rotate: [0, 7, -6, 0], x: [0, -20, 12, 0] }}
          transition={isMobile ? undefined : { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        />
        <motion.img
          src={laxBlanca}
          alt=""
          className="absolute opacity-[0.07] w-[160px] md:w-[420px]"
          style={{ top: "65%", left: "35%" }}
          animate={isMobile ? undefined : { rotate: [0, -12, 8, 0], scale: [1, 1.1, 0.93, 1] }}
          transition={isMobile ? undefined : { duration: 26, repeat: Infinity, ease: "easeInOut", delay: 10 }}
        />
      </div>
      <div className="relative z-[1] flex flex-col min-h-screen">
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
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t("blog.search")}
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

      <div className="h-16 md:h-8" />
      {categories.length > 0 && mobileCategoryPills}

      <main className="flex-1 px-4 pb-28">
        <div className="max-w-5xl mx-auto flex gap-6">
          {categories.length > 0 && desktopCategorySidebar}

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" />
                <p className="text-xs text-gray-400">{t("blog.loading")}</p>
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                className="bg-white rounded-2xl p-8 text-center"
                style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.06)" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)" }}>
                  <Newspaper className="w-10 h-10 text-purple-300" />
                </div>
                <p className="text-gray-600 text-sm font-medium">
                  {debouncedSearch ? t("blog.noResults") : t("blog.noPosts")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {debouncedSearch ? t("blog.noResultsHint") : t("blog.noPostsHint")}
                </p>
              </motion.div>
            ) : (
              <>
                {featuredPost && !debouncedSearch && page === 1 && (
                  <motion.div
                    className="mb-5 rounded-2xl overflow-hidden cursor-pointer relative group"
                    style={{ boxShadow: "0 8px 30px rgba(124,58,237,0.15)" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => { playSound("card"); navigate(`/blog/${featuredPost.id}`); }}
                    data-testid={`card-featured-${featuredPost.id}`}
                  >
                    <div className="relative h-56 md:h-72 overflow-hidden bg-gradient-to-br from-purple-400 to-cyan-400">
                      {featuredPost.imagenPortada ? (
                        <img
                          src={featuredPost.imagenPortada}
                          alt={featuredPost.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      {featuredPost.categoriaId && getCategoryName(featuredPost.categoriaId) && (
                        <motion.span
                          className="absolute top-3 left-3 inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-sm"
                          style={{ background: getCategoryColor(featuredPost.categoriaId) + "cc" }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {getCategoryName(featuredPost.categoriaId)}
                        </motion.span>
                      )}
                    </div>
                    <div className="relative p-5 pb-5" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #7c3aed 100%)" }}>
                      <div className="flex justify-end mb-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                          style={{ background: "#2dd4bf", boxShadow: "0 2px 10px rgba(45,212,191,0.4)" }}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {featuredPost.createdAt ? `Publicado el ${formatDate(featuredPost.createdAt)}` : ""}
                        </span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-white leading-tight mb-1.5">
                        {featuredPost.titulo}
                      </h2>
                      <p className="text-white/75 text-xs md:text-sm leading-relaxed line-clamp-3 mb-3">
                        {getExcerpt(featuredPost.descripcion)}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-white/50 text-[10px]">
                          {featuredPost.autor && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {featuredPost.autor}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {estimateReadingTime(featuredPost.descripcion || "")} min
                          </span>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 px-5 py-2 rounded-full text-xs font-bold text-white transition-transform group-hover:translate-x-0.5"
                          style={{ background: "#2dd4bf", boxShadow: "0 2px 10px rgba(45,212,191,0.4)" }}
                          data-testid={`link-read-featured-${featuredPost.id}`}
                        >
                          {t("blog.readMore")} <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(debouncedSearch || page > 1 ? posts : remainingPosts).map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.12)" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { playSound("card"); navigate(`/blog/${post.id}`); }}
                      data-testid={`card-post-${post.id}`}
                    >
                      <div className="relative h-48 md:h-52 overflow-hidden bg-gradient-to-br from-purple-400 to-cyan-400">
                        {post.imagenPortada ? (
                          <img
                            src={post.imagenPortada}
                            alt={post.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-14 h-14 text-white/30" />
                          </div>
                        )}
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
                      <div className="relative p-4 pb-5" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #7c3aed 100%)" }}>
                        <div className="flex justify-end mb-2">
                          <span
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white"
                            style={{ background: "#2dd4bf", boxShadow: "0 2px 8px rgba(45,212,191,0.4)" }}
                          >
                            <Calendar className="w-3 h-3" />
                            {post.createdAt ? `Publicado el ${formatDate(post.createdAt)}` : ""}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug mb-1.5 line-clamp-2">{post.titulo}</h3>
                        <p className="text-xs text-white/75 leading-relaxed mb-3 line-clamp-3">
                          {getExcerpt(post.descripcion)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-white/50 min-w-0">
                            {post.autor && (
                              <span className="flex items-center gap-1 text-[10px] truncate">
                                <User className="w-3 h-3 shrink-0" />
                                <span className="truncate">{post.autor}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] shrink-0">
                              <Clock className="w-3 h-3" />
                              {estimateReadingTime(post.descripcion || "")} min
                            </span>
                          </div>
                          <span
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-bold text-white transition-transform group-hover:translate-x-0.5"
                            style={{ background: "#2dd4bf", boxShadow: "0 2px 8px rgba(45,212,191,0.4)" }}
                            data-testid={`link-read-more-${post.id}`}
                          >
                            {t("blog.readMore")} <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
      </main>

      <TrainingNavBar activePage="blog" categoria="ninos" />
      </div>
    </div>
  );
}
