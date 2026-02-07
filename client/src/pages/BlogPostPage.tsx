import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Clock, User, Calendar, Share2, ChevronLeft, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";
import { TrainingNavBar } from "@/components/TrainingNavBar";
import { CurvedHeader } from "@/components/CurvedHeader";
import { useState, useEffect, useRef } from "react";

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

interface BlogCategory {
  id: string;
  nombre: string;
  color: string | null;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export default function BlogPostPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { playSound } = useSounds();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: postData, isLoading } = useQuery<{ post: BlogPost }>({
    queryKey: ["/api/blog-posts", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/blog-posts/${params.id}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    }
  });

  const { data: categoriesData } = useQuery<{ categories: BlogCategory[] }>({
    queryKey: ["/api/blog-categories"]
  });

  const post = postData?.post;
  const categories = categoriesData?.categories || [];

  const getCategoryName = (catId: string | null): string => {
    if (!catId) return "";
    return categories.find(c => c.id === catId)?.nombre || "";
  };

  const getCategoryColor = (catId: string | null): string => {
    if (!catId) return "#7c3aed";
    return categories.find(c => c.id === catId)?.color || "#7c3aed";
  };

  const handleShare = async () => {
    playSound("iphone");
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.descripcion || post.titulo,
          url: window.location.href
        });
      } catch {}
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafe]">
        <CurvedHeader showBack onBack={() => navigate("/blog")} showLang={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" />
          <p className="text-xs text-gray-400">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafe]">
        <CurvedHeader showBack onBack={() => navigate("/blog")} showLang={false} />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}>
              <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Post no encontrado</p>
            <p className="text-gray-400 text-xs mb-4">Este artículo no está disponible</p>
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
              data-testid="button-back-to-blog"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Volver al Blog
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const catName = getCategoryName(post.categoriaId);
  const catColor = getCategoryColor(post.categoriaId);
  const readTime = estimateReadingTime(post.contenido);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafe]" ref={contentRef}>
      <CurvedHeader
        showBack
        onBack={() => navigate("/blog")}
        rightElement={
          <motion.button
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 2px 8px rgba(138,63,252,0.15)",
            }}
            whileTap={{ scale: 0.92 }}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4" style={{ color: "#8a3ffc" }} />
          </motion.button>
        }
      />

      <main className="flex-1 pb-28">
        {post.imagenPortada && (
          <motion.div
            className="relative h-52 md:h-72 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img src={post.imagenPortada} alt={post.titulo} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            {catName && (
              <motion.span
                className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-sm"
                style={{ background: catColor + "cc" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                data-testid="badge-category"
              >
                {catName}
              </motion.span>
            )}
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            className={post.imagenPortada ? "-mt-8 relative z-10" : "mt-2"}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="bg-white rounded-2xl p-5 md:p-8"
              style={{ boxShadow: "0 4px 24px rgba(124,58,237,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {catName && !post.imagenPortada && (
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-semibold text-white"
                    style={{ background: catColor }}
                    data-testid="badge-category"
                  >
                    {catName}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  {readTime} min de lectura
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight mb-4" data-testid="text-post-title">
                {post.titulo}
              </h1>

              <div className="flex items-center gap-4 pb-4 mb-5 border-b border-gray-100">
                {post.autor && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #f3e8ff, #e0f2fe)" }}
                    >
                      <User className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    {post.autor}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.createdAt)}
                </span>
              </div>

              <div
                className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed"
                style={{ fontSize: "15px", lineHeight: "1.85" }}
                dangerouslySetInnerHTML={{ __html: post.contenido }}
                data-testid="content-post-body"
              />
            </div>
          </motion.div>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => { playSound("iphone"); navigate("/blog"); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.25)"
              }}
              data-testid="button-back-to-blog"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Blog
            </button>
          </motion.div>
        </div>
      </main>

      {showScrollTop && (
        <motion.button
          className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)"
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileTap={{ scale: 0.9 }}
          data-testid="button-scroll-top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}

      <TrainingNavBar activePage="blog" categoria="ninos" />
    </div>
  );
}
