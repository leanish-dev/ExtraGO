import React, { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonCard } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Bookmark, Repeat2, Plus, Image, X, ChevronDown, Send, Briefcase, Wifi, MoreHorizontal, Trash2, CheckCircle, UserPlus, UserMinus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { apiFetch } from "@/lib/api-fetch";

interface PostAuthor {
  id: number;
  name: string;
  avatarUrl?: string | null;
  categories?: string[];
  isVerified?: boolean;
  level?: string;
}

interface FeedPost {
  id: number;
  userId: number;
  content: string;
  imageUrls: string[];
  postType: "general" | "job_completion" | "availability";
  likes: number;
  saves: number;
  reposts: number;
  createdAt: string;
  author?: PostAuthor;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface PostComment {
  id: number;
  content: string;
  createdAt: string;
  author?: { id: number; name: string; avatarUrl?: string | null };
}

const POST_TYPE_MAP = {
  general: { label: "Geral", icon: <MoreHorizontal size={12} />, color: "text-muted-foreground" },
  job_completion: { label: "Job Concluído", icon: <Briefcase size={12} />, color: "text-primary" },
  availability: { label: "Disponível", icon: <Wifi size={12} />, color: "text-green-400" },
};

const FILTER_TABS = [
  { key: "all", label: "Todos" },
  { key: "job_completion", label: "Jobs" },
  { key: "availability", label: "Disponíveis" },
  { key: "general", label: "Posts" },
];

const LEVEL_COLORS: Record<string, string> = {
  bronze: "text-orange-400",
  silver: "text-slate-300",
  gold: "text-yellow-400",
  elite: "text-primary",
};

function Avatar({ user, size = 40 }: { user?: PostAuthor | null; size?: number }) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-black flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {user?.name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

function CommentDrawer({ post, onClose }: { post: FeedPost; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: comments = [], isLoading } = useQuery<PostComment[]>({
    queryKey: ["post-comments", post.id],
    queryFn: () => apiFetch(`/api/posts/${post.id}/comments`),
  });

  const addComment = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post-comments", post.id] });
      setCommentText("");
    },
    onError: () => toast.error("Erro ao comentar"),
  });

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-[#080A0D] border-t border-white/10 rounded-t-2xl max-h-[70vh] flex flex-col"
      style={{ maxWidth: 700, margin: "0 auto" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
        <h3 className="font-semibold text-sm">Comentários</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/14 transition-colors">
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
        ) : comments.length === 0 ? (
          <EmptyState icon={<MessageCircle size={20} />} title="Sem comentários" description="Seja o primeiro a comentar." className="py-6" />
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <Avatar user={c.author} size={32} />
              <div className="flex-1 bg-white/4 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-primary">{c.author?.name ?? "Usuário"}</p>
                <p className="text-sm mt-0.5 leading-relaxed">{c.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-white/8 flex gap-2 flex-shrink-0">
        <Avatar user={user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : undefined} size={32} />
        <div className="flex-1 flex gap-2">
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && commentText.trim()) { e.preventDefault(); addComment.mutate(commentText.trim()); } }}
            placeholder="Escreva um comentário..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
          <Button
            size="icon"
            disabled={!commentText.trim() || addComment.isPending}
            onClick={() => addComment.mutate(commentText.trim())}
            className="bg-primary text-black hover:bg-primary/90 rounded-xl h-9 w-9 flex-shrink-0"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function PostCard({ post, onDelete }: { post: FeedPost; onDelete: (id: number) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [savesCount, setSavesCount] = useState(post.saves);
  const [repostsCount, setRepostsCount] = useState(post.reposts);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);

  const isOwnPost = user?.id === post.userId;

  const handleFollow = async () => {
    if (isOwnPost) return;
    setFollowPending(true);
    try {
      if (isFollowing) {
        await apiFetch(`/api/users/${post.userId}/follow`, { method: "DELETE" });
        setIsFollowing(false);
        toast.success("Deixou de seguir");
      } else {
        await apiFetch(`/api/users/${post.userId}/follow`, { method: "POST" });
        setIsFollowing(true);
        toast.success("Seguindo!");
      }
    } catch {
      toast.error("Erro");
    } finally {
      setFollowPending(false);
    }
  };

  const typeInfo = POST_TYPE_MAP[post.postType] ?? POST_TYPE_MAP.general;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR });

  const handleLike = async () => {
    try {
      await apiFetch(`/api/posts/${post.id}/like`, { method: "POST" });
      setLiked(prev => !prev);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    } catch { toast.error("Erro"); }
  };

  const handleSave = async () => {
    try {
      await apiFetch(`/api/posts/${post.id}/save`, { method: "POST" });
      setSaved(prev => !prev);
      setSavesCount(prev => saved ? prev - 1 : prev + 1);
    } catch { toast.error("Erro"); }
  };

  const handleRepost = async () => {
    try {
      await apiFetch(`/api/posts/${post.id}/repost`, { method: "POST" });
      setRepostsCount(prev => prev + 1);
      toast.success("Repostado!");
    } catch { toast.error("Erro"); }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/posts/${post.id}`, { method: "DELETE" });
      onDelete(post.id);
      toast.success("Post excluído");
    } catch { toast.error("Erro ao excluir"); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl border border-white/6 overflow-hidden"
      >
        {/* Post type indicator */}
        {post.postType !== "general" && (
          <div className={`px-5 py-2 border-b border-white/5 flex items-center gap-1.5 text-xs font-semibold ${typeInfo.color}`}>
            {typeInfo.icon}
            {typeInfo.label}
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar user={post.author} size={42} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm">{post.author?.name ?? "Usuário"}</p>
                {post.author?.isVerified && (
                  <CheckCircle size={13} className="text-primary flex-shrink-0" />
                )}
                {post.author?.level && (
                  <span className={`text-[10px] font-bold ${LEVEL_COLORS[post.author.level] ?? "text-muted-foreground"}`}>
                    {post.author.level.toUpperCase()}
                  </span>
                )}
              </div>
              {post.author?.categories && post.author.categories.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">{post.author.categories[0]}</p>
              )}
              <p className="text-[10px] text-muted-foreground/65 mt-0.5">{timeAgo}</p>
            </div>
            {!isOwnPost && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleFollow}
                disabled={followPending}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  isFollowing
                    ? "border-white/12 text-muted-foreground bg-white/4"
                    : "border-primary/30 text-primary bg-primary/8 hover:bg-primary/15"
                }`}
              >
                {followPending ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : isFollowing ? <UserMinus size={10} /> : <UserPlus size={10} />}
                {isFollowing ? "Seguindo" : "Seguir"}
              </motion.button>
            )}
            {user?.id === post.userId && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className="absolute right-0 top-8 bg-[#0d1117] border border-white/10 rounded-xl shadow-xl z-10 min-w-[130px] overflow-hidden"
                    >
                      <button
                        onClick={() => { setShowMenu(false); handleDelete(); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={13} /> Excluir
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-foreground/90 mb-4 whitespace-pre-wrap">{post.content}</p>

          {/* Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className={`grid gap-2 mb-4 ${post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {post.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Post image ${i + 1}`}
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: 280 }}
                />
              ))}
            </div>
          )}

          {/* Engagement bar */}
          <div className="flex items-center gap-1 pt-3 border-t border-white/6">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center ${
                liked ? "text-red-400 bg-red-400/10" : "text-muted-foreground hover:text-red-400 hover:bg-red-400/8"
              }`}
            >
              <Heart size={14} className={liked ? "fill-red-400" : ""} />
              <span>{likesCount}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowComments(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-secondary hover:bg-secondary/8 transition-all flex-1 justify-center"
            >
              <MessageCircle size={14} />
              <span>Comentar</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center ${
                saved ? "text-yellow-400 bg-yellow-400/10" : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/8"
              }`}
            >
              <Bookmark size={14} className={saved ? "fill-yellow-400" : ""} />
              <span>{savesCount}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleRepost}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all flex-1 justify-center"
            >
              <Repeat2 size={14} />
              <span>{repostsCount}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setShowComments(false)}
            />
            <CommentDrawer post={post} onClose={() => setShowComments(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CreatePostCard({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"general" | "job_completion" | "availability">("general");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content: content.trim(), postType }),
      });
      setContent("");
      setPostType("general");
      setExpanded(false);
      onCreated();
      toast.success("Post publicado!");
    } catch {
      toast.error("Erro ao publicar post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      layout
      className="glass-card rounded-2xl border border-white/8 p-4 sm:p-5"
    >
      <div className="flex gap-3">
        <Avatar user={user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : undefined} size={40} />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setExpanded(true)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm text-muted-foreground bg-white/4 border border-white/8 hover:border-white/18 hover:bg-white/6 transition-all ${expanded ? "hidden" : "block"}`}
          >
            O que você quer compartilhar?
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <textarea
                  autoFocus
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="O que você quer compartilhar?"
                  className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                />

                {/* Post type selector */}
                <div className="flex gap-2 flex-wrap">
                  {(["general", "job_completion", "availability"] as const).map(type => {
                    const info = POST_TYPE_MAP[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setPostType(type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          postType === type
                            ? "bg-primary text-black border-primary"
                            : "border-white/10 text-muted-foreground hover:border-white/25"
                        }`}
                      >
                        {info.icon}
                        {info.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setExpanded(false); setContent(""); }}
                    className="border-white/10 hover:border-white/25 rounded-xl text-xs h-9"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    disabled={!content.trim() || isPosting}
                    onClick={handlePost}
                    className="bg-primary text-black hover:bg-primary/90 font-bold rounded-xl text-xs h-9 px-5 neon-glow"
                  >
                    {isPosting ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeedPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: posts = [], isLoading, refetch } = useQuery<FeedPost[]>({
    queryKey: ["feed", filter],
    queryFn: () => apiFetch(`/api/feed?postType=${filter}`),
    refetchInterval: 30000,
  });

  const [localPosts, setLocalPosts] = useState<FeedPost[]>([]);

  const allPosts = [...localPosts, ...posts.filter(p => !localPosts.find(lp => lp.id === p.id))];

  const handleDelete = (id: number) => {
    setLocalPosts(prev => prev.filter(p => p.id !== id));
    qc.invalidateQueries({ queryKey: ["feed"] });
  };

  const handleCreated = () => {
    refetch();
  };

  return (
    <div className="relative p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-br from-primary/6 via-transparent to-secondary/3" />
        <div className="absolute top-12 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <PageHeader title="Feed" subtitle="Compartilhe experiências e conecte-se com profissionais" />

      <CreatePostCard onCreated={handleCreated} />

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === tab.key
                ? "bg-primary text-black border-primary neon-glow"
                : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : allPosts.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={28} />}
          title="Feed vazio"
          description="Seja o primeiro a compartilhar algo com a comunidade!"
          className="py-16"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {allPosts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-20 right-4 lg:bottom-6 w-12 h-12 rounded-full bg-primary text-black shadow-lg neon-glow flex items-center justify-center z-30"
        style={{ boxShadow: "0 0 24px rgba(124,252,0,0.4)" }}
      >
        <Plus size={20} />
      </motion.button>
    </div>
  );
}
