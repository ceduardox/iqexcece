import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, User, Calendar, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSounds } from "@/hooks/use-sounds";
import { TrainingNavBar } from "@/components/TrainingNavBar";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)" }}>
        <div className="w-8 h-8 rounded-full border-3 border-purple-100 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)" }}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">Post no encontrado</p>
          <button onClick={() => navigate("/blog")} className="text-purple-600 text-sm font-medium">Volver al Blog</button>
        </div>
      </div>
    );
  }

  const catName = getCategoryName(post.categoriaId);
  const catColor = getCategoryColor(post.categoriaId);
  const readTime = estimateReadingTime(post.contenido);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 30%, #ffffff 100%)" }}>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-purple-50">
        <motion.button
          onClick={() => { playSound("iphone"); navigate("/blog"); }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </motion.button>
        <h1 className="text-sm font-medium text-gray-600 truncate mx-4 flex-1 text-center">Blog</h1>
        <motion.button
          onClick={handleShare}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          style={{ boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4 text-purple-600" />
        </motion.button>
      </header>

      <main className="flex-1 pt-16 pb-28">
        {post.imagenPortada && (
          <motion.div 
            className="relative h-56 md:h-72 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={post.imagenPortada} alt={post.titulo} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </motion.div>
        )}

        <div className="max-w-lg mx-auto px-4">
          <motion.div 
            className={post.imagenPortada ? "-mt-12 relative z-10" : "mt-4"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ boxShadow: "0 4px 20px rgba(124, 58, 237, 0.08)" }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {catName && (
                  <span 
                    className="px-3 py-1 rounded-full text-[10px] font-medium text-white"
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

              <h1 className="text-xl font-bold text-gray-800 leading-tight mb-3" data-testid="text-post-title">{post.titulo}</h1>

              <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-100">
                {post.autor && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-purple-600" />
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
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                style={{ fontSize: "15px", lineHeight: "1.8" }}
                dangerouslySetInnerHTML={{ __html: post.contenido }}
                data-testid="content-post-body"
              />
            </div>
          </motion.div>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => { playSound("iphone"); navigate("/blog"); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-purple-600 bg-white shadow-sm transition-all"
              style={{ boxShadow: "0 2px 12px rgba(124, 58, 237, 0.1)" }}
              data-testid="button-back-to-blog"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Blog
            </button>
          </motion.div>
        </div>
      </main>

      <TrainingNavBar activePage="blog" categoria="ninos" />
    </div>
  );
}
