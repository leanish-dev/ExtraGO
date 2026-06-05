import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, Search, ArrowLeft, Check,
  CheckCheck, Image, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiFetch } from "@/lib/api-fetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  lastMessageAt?: string;
  createdAt: string;
  otherUser?: {
    id: number;
    name: string;
    role: string;
    avatarUrl?: string;
    companyName?: string;
  };
  lastMessage?: { content: string; senderId: number } | null;
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function AvatarBubble({ name, size = "md", online }: { name?: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizeMap = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-13 h-13 text-base" };
  return (
    <div className="relative flex-shrink-0">
      <div className={`rounded-full bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 flex items-center justify-center font-bold text-black ${sizeMap[size]}`}>
        {name?.charAt(0).toUpperCase() ?? "?"}
      </div>
      {online !== undefined && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#040608] ${online ? "bg-green-400" : "bg-muted-foreground/40"}`} />
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="w-7 h-7 rounded-full bg-white/8 flex-shrink-0" />
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm bg-white/6 border border-white/8">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMine, showAvatar, senderName }: {
  msg: Message; isMine: boolean; showAvatar?: boolean; senderName?: string;
}) {
  const time = msg.createdAt ? format(new Date(msg.createdAt), "HH:mm") : "";
  const isImage = msg.type === "image";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
      className={`flex items-end gap-2 mb-0.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isMine && showAvatar ? (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary/60 to-primary/40 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0 mb-0.5">
          {senderName?.charAt(0).toUpperCase()}
        </div>
      ) : !isMine ? <div className="w-7 flex-shrink-0" /> : null}

      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
        {isImage ? (
          <img
            src={msg.content}
            alt="imagem"
            className="max-w-[240px] rounded-2xl object-cover border border-white/10"
            style={{ maxHeight: 200 }}
          />
        ) : (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isMine
              ? "bg-primary text-black rounded-br-sm font-medium"
              : "bg-white/8 border border-white/8 text-foreground rounded-bl-sm"
          }`}>
            {msg.content}
          </div>
        )}
        <div className={`flex items-center gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-muted-foreground/50">{time}</span>
          {isMine && (
            msg.isRead
              ? <CheckCheck size={12} className="text-primary/70" />
              : <Check size={12} className="text-muted-foreground/35" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ConversationItem({ conv, isActive, onClick, currentUserId, isOnline }: {
  conv: Conversation; isActive: boolean; onClick: () => void;
  currentUserId: number; isOnline?: boolean;
}) {
  const other = conv.otherUser;
  const name = other?.role === "company" ? (other.companyName || other.name) : other?.name ?? "Usuário";
  const lastMsg = conv.lastMessage?.content ?? "";
  const time = conv.lastMessageAt
    ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: ptBR })
    : "";

  return (
    <motion.button whileTap={{ scale: 0.99 }} onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-white/3 ${
        isActive ? "bg-primary/8 border-r-2 border-r-primary" : "hover:bg-white/3"
      }`}
    >
      <AvatarBubble name={name} online={isOnline} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-sm truncate ${(conv.unreadCount ?? 0) > 0 ? "font-bold" : "font-semibold"}`}>{name}</p>
          {time && <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 ml-2">{time}</span>}
        </div>
        <p className={`text-xs truncate ${(conv.unreadCount ?? 0) > 0 ? "text-foreground/70 font-medium" : "text-muted-foreground"}`}>
          {lastMsg || "Iniciar conversa"}
        </p>
      </div>
      {(conv.unreadCount ?? 0) > 0 && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-bold text-black">{conv.unreadCount}</span>
        </div>
      )}
    </motion.button>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showConvList, setShowConvList] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [imageUploading, setImageUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollFallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const activeConvIdRef = useRef<number | null>(null);

  activeConvIdRef.current = activeConvId;

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherName = activeConv?.otherUser?.role === "company"
    ? (activeConv.otherUser.companyName || activeConv.otherUser.name)
    : activeConv?.otherUser?.name ?? "Usuário";
  const isOtherOnline = activeConv?.otherUser
    ? onlineUsers.has(activeConv.otherUser.id)
    : false;
  const isOtherTyping = activeConv?.otherUser
    ? typingUsers.has(activeConv.otherUser.id)
    : false;

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      const data = await apiFetch("/api/chat/conversations");
      setConversations(data);
    } catch { /* silent */ } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: number, silent = false) => {
    if (!silent) setMessagesLoading(true);
    try {
      const data = await apiFetch(`/api/chat/conversations/${convId}/messages`);
      setMessages(data);
      await apiFetch(`/api/chat/conversations/${convId}/read`, { method: "POST" });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } catch { if (!silent) toast.error("Erro ao carregar mensagens"); }
    finally { if (!silent) setMessagesLoading(false); }
  }, []);

  // SSE setup with polling fallback
  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const token = localStorage.getItem("extragO_token");
    if (!token) return;

    let sseFailures = 0;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = () => {
      if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }

      const token = localStorage.getItem("extragO_token") || "";
      const es = new EventSource(`${BASE}/api/chat/sse?token=${encodeURIComponent(token)}`);
      sseRef.current = es;

      es.onopen = () => {
        setSseConnected(true);
        sseFailures = 0;
        if (pollFallbackRef.current) { clearInterval(pollFallbackRef.current); pollFallbackRef.current = null; }
      };

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "connected") {
            setSseConnected(true);
          } else if (event.type === "new_message") {
            const msg: Message = event.message;
            const currentConvId = activeConvIdRef.current;
            if (currentConvId === event.conversationId) {
              setMessages(prev => {
                const exists = prev.some(m => m.id === msg.id);
                return exists ? prev : [...prev, msg];
              });
              // Mark read if this conv is active
              apiFetch(`/api/chat/conversations/${event.conversationId}/read`, { method: "POST" }).catch(() => {});
            } else {
              setConversations(prev => prev.map(c =>
                c.id === event.conversationId
                  ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1, lastMessage: { content: msg.content, senderId: msg.senderId }, lastMessageAt: msg.createdAt }
                  : c
              ));
            }
            fetchConversations(true);
          } else if (event.type === "typing") {
            if (event.isTyping) {
              setTypingUsers(prev => new Set([...prev, event.userId]));
            } else {
              setTypingUsers(prev => { const s = new Set(prev); s.delete(event.userId); return s; });
            }
          } else if (event.type === "messages_read") {
            if (activeConvIdRef.current === event.conversationId) {
              setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            }
          }
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        sseFailures++;
        setSseConnected(false);
        es.close();
        sseRef.current = null;

        // Start polling fallback after 2 failures
        if (sseFailures >= 2 && !pollFallbackRef.current) {
          pollFallbackRef.current = setInterval(() => {
            fetchConversations(true);
            if (activeConvIdRef.current) fetchMessages(activeConvIdRef.current, true);
          }, 3000);
        }

        // Try to reconnect SSE after backoff
        if (sseFailures < 5) {
          reconnectTimeout = setTimeout(connectSSE, Math.min(5000, 1000 * sseFailures));
        }
      };
    };

    connectSSE();

    return () => {
      if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollFallbackRef.current) { clearInterval(pollFallbackRef.current); pollFallbackRef.current = null; }
    };
  }, [user, fetchConversations, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleSelectConv = (convId: number) => {
    setActiveConvId(convId);
    if (isMobile) setShowConvList(false);
    fetchMessages(convId);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleTyping = useCallback(() => {
    if (!activeConvId) return;
    apiFetch(`/api/chat/conversations/${activeConvId}/typing`, { method: "POST", body: JSON.stringify({ isTyping: true }) }).catch(() => {});
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      apiFetch(`/api/chat/conversations/${activeConvId}/typing`, { method: "POST", body: JSON.stringify({ isTyping: false }) }).catch(() => {});
    }, 2000);
  }, [activeConvId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Clear typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    apiFetch(`/api/chat/conversations/${activeConvId}/typing`, { method: "POST", body: JSON.stringify({ isTyping: false }) }).catch(() => {});

    // Optimistic update
    const optimistic: Message = {
      id: Date.now(), conversationId: activeConvId, senderId: user!.id!,
      content, type: "text", isRead: false, createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const msg = await apiFetch(`/api/chat/conversations/${activeConvId}/messages`, {
        method: "POST", body: JSON.stringify({ content, type: "text" }),
      });
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? msg : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setNewMessage(content);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!activeConvId) return;
    setImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const optimistic: Message = {
          id: Date.now(), conversationId: activeConvId, senderId: user!.id!,
          content: dataUrl, type: "image", isRead: false, createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);
        try {
          await apiFetch(`/api/chat/conversations/${activeConvId}/messages`, {
            method: "POST", body: JSON.stringify({ content: dataUrl, type: "image" }),
          });
        } catch {
          setMessages(prev => prev.filter(m => m.id !== optimistic.id));
          toast.error("Erro ao enviar imagem");
        } finally {
          setImageUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setImageUploading(false);
    }
  };

  const filteredConvs = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const name = c.otherUser?.role === "company"
      ? (c.otherUser.companyName || c.otherUser.name)
      : c.otherUser?.name ?? "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) return null;

  const showList = !isMobile || showConvList || !activeConvId;
  const showChat = !isMobile || (!showConvList && !!activeConvId);
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Conversation List ── */}
      <AnimatePresence mode="sync">
        {showList && (
          <motion.div
            initial={isMobile ? { x: -20, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -20, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className={`flex flex-col border-r border-white/6 bg-[#040608]/80 flex-shrink-0 ${isMobile ? "w-full" : "w-[300px] xl:w-[320px]"}`}
          >
            <div className="p-4 border-b border-white/6 flex-shrink-0">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold">Mensagens</h1>
                  {totalUnread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {sseConnected ? (
                    <span className="flex items-center gap-1 text-[10px] text-green-400/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">polling</span>
                  )}
                </div>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversas..."
                  className="pl-8 bg-white/5 border-white/8 rounded-xl h-9 text-sm focus:border-primary/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-px pt-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="w-11 h-11 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                        <div className="h-2.5 w-40 bg-white/4 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <MessageCircle size={22} className="text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground/70 mb-1">
                    {searchQuery ? "Nenhuma conversa encontrada." : "Nenhuma conversa ainda"}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Suas mensagens com empresas e freelancers aparecerão aqui.
                    </p>
                  )}
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <ConversationItem key={conv.id} conv={conv}
                    isActive={conv.id === activeConvId}
                    onClick={() => handleSelectConv(conv.id)}
                    currentUserId={user.id!}
                    isOnline={conv.otherUser ? onlineUsers.has(conv.otherUser.id) : false}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence mode="sync">
        {showChat && (
          <motion.div
            initial={isMobile ? { x: 20, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: 20, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-w-0 overflow-hidden"
          >
            {!activeConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5"
                >
                  <MessageCircle size={34} className="text-primary" />
                </motion.div>
                <h2 className="text-xl font-bold mb-2">Suas Mensagens</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Selecione uma conversa para começar a trocar mensagens.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 h-[60px] border-b border-white/6 flex-shrink-0 bg-[#040608]/80 backdrop-blur-xl">
                  {isMobile && (
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowConvList(true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6"
                    >
                      <ArrowLeft size={16} />
                    </motion.button>
                  )}
                  <AvatarBubble name={otherName} online={isOtherOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{otherName}</p>
                    <p className={`text-xs font-medium transition-colors ${
                      isOtherTyping ? "text-primary" : isOtherOnline ? "text-green-400/70" : "text-muted-foreground/50"
                    }`}>
                      {isOtherTyping ? "digitando..." : isOtherOnline ? "Online agora" : ""}
                    </p>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollBehavior: "smooth" }}>
                  {messagesLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 size={22} className="animate-spin text-primary/60" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                        <MessageCircle size={20} className="text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground/60">Comece a conversa!</p>
                      <p className="text-xs text-muted-foreground mt-1">Envie uma mensagem para {otherName}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, i) => {
                        const isMine = msg.senderId === user.id;
                        const prevMsg = messages[i - 1];
                        const showAvatar = !isMine && (i === 0 || prevMsg?.senderId !== msg.senderId);
                        return (
                          <MessageBubble key={msg.id} msg={msg} isMine={isMine}
                            showAvatar={showAvatar} senderName={otherName}
                          />
                        );
                      })}
                      {isOtherTyping && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="flex items-end gap-2 px-3 py-3 border-t border-white/6 flex-shrink-0 bg-[#040608]/80 backdrop-blur-xl">
                  {/* Image upload */}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
                  />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 flex-shrink-0 transition-all"
                  >
                    {imageUploading ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
                  </motion.button>

                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={e => { setNewMessage(e.target.value); handleTyping(); }}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Digite uma mensagem..."
                      className="bg-white/6 border-white/10 focus:border-primary/40 rounded-2xl h-11 text-sm"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      newMessage.trim()
                        ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_12px_rgba(124,252,0,0.35)]"
                        : "bg-white/6 text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={16} />}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
