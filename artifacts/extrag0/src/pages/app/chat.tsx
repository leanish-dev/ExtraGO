import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, Search, ArrowLeft, MoreVertical, Phone,
  CheckCheck, Check, Image, Smile, Paperclip, Users, X, Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import { apiFetch } from "@/lib/api-fetch";

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
  lastMessage?: {
    content: string;
    senderId: number;
  };
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

function AvatarInitials({ name, size = "md" }: { name?: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base" };
  return (
    <div className={`rounded-full bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 flex items-center justify-center font-bold text-black flex-shrink-0 ${sizeMap[size]}`}>
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="w-8 h-8 rounded-full bg-white/8 flex-shrink-0" />
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm bg-white/6 border border-white/8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
      className={`flex items-end gap-2 mb-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isMine && showAvatar && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary/60 to-primary/40 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0 mb-0.5">
          {senderName?.charAt(0).toUpperCase()}
        </div>
      )}
      {!isMine && !showAvatar && <div className="w-7 flex-shrink-0" />}

      <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? "bg-primary text-black rounded-br-sm font-medium"
            : "bg-white/8 border border-white/8 text-foreground rounded-bl-sm"
        }`}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-muted-foreground/50">{time}</span>
          {isMine && (
            msg.isRead
              ? <CheckCheck size={12} className="text-primary/70" />
              : <Check size={12} className="text-muted-foreground/40" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ConversationItem({ conv, isActive, onClick, currentUserId }: {
  conv: Conversation; isActive: boolean; onClick: () => void; currentUserId: number;
}) {
  const other = conv.otherUser;
  const name = other?.role === "company" ? (other.companyName || other.name) : other?.name ?? "Usuário";
  const lastMsg = conv.lastMessage?.content ?? "";
  const time = conv.lastMessageAt
    ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: ptBR })
    : "";

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
        isActive ? "bg-primary/8 border-r-2 border-primary" : "hover:bg-white/3"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/50 to-secondary/40 flex items-center justify-center font-bold text-black text-sm">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#050b10]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold truncate">{name}</p>
          {time && <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 ml-2">{time}</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate">{lastMsg || "Iniciar conversa"}</p>
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
  const isMobile = useMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConvList, setShowConvList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiFetch("/api/chat/conversations");
      setConversations(data);
    } catch {
      // Silently handle if chat isn't ready yet
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: number) => {
    setMessagesLoading(true);
    try {
      const data = await apiFetch(`/api/chat/conversations/${convId}/messages`);
      setMessages(data);
      // Mark as read
      await apiFetch(`/api/chat/conversations/${convId}/read`, { method: "POST" });
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } catch {
      toast.error("Erro ao carregar mensagens");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    fetchMessages(activeConvId);
    const interval = setInterval(() => fetchMessages(activeConvId), 4000);
    pollingRef.current = interval;
    return () => clearInterval(interval);
  }, [activeConvId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConv = (convId: number) => {
    setActiveConvId(convId);
    if (isMobile) setShowConvList(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const optimistic: Message = {
      id: Date.now(),
      conversationId: activeConvId,
      senderId: user!.id!,
      content,
      type: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await apiFetch(`/api/chat/conversations/${activeConvId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content, type: "text" }),
      });
      await fetchMessages(activeConvId);
      fetchConversations();
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
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
  const otherName = activeConv?.otherUser?.role === "company"
    ? (activeConv.otherUser.companyName || activeConv.otherUser.name)
    : activeConv?.otherUser?.name ?? "Usuário";

  return (
    <div className="flex h-full overflow-hidden page-enter">
      {/* ── Conversation List ── */}
      <AnimatePresence mode="sync">
        {showList && (
          <motion.div
            initial={isMobile ? { x: -20, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -20, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className={`flex flex-col border-r border-white/6 bg-[#040608]/80 flex-shrink-0 ${
              isMobile ? "w-full" : "w-[320px]"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" />
                  Mensagens
                </h1>
                {conversations.some(c => (c.unreadCount ?? 0) > 0) && (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">
                    {conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0)}
                  </span>
                )}
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversas..."
                  className="pl-9 bg-white/5 border-white/8 rounded-xl h-9 text-sm focus:border-primary/40"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-1 p-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse mx-2" />
                  ))}
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <MessageCircle size={22} className="text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground/70 mb-1">Nenhuma conversa ainda</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {searchQuery ? "Nenhuma conversa encontrada." : "Suas mensagens com empresas e freelancers aparecerão aqui."}
                  </p>
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeConvId}
                    onClick={() => handleSelectConv(conv.id)}
                    currentUserId={user.id!}
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
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5"
                >
                  <MessageCircle size={34} className="text-primary" />
                </motion.div>
                <h2 className="text-xl font-bold mb-2">Suas Mensagens</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Selecione uma conversa para começar a trocar mensagens com empresas e outros profissionais.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 h-[60px] border-b border-white/6 flex-shrink-0 bg-[#040608]/80 backdrop-blur-xl">
                  {isMobile && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowConvList(true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all"
                    >
                      <ArrowLeft size={16} />
                    </motion.button>
                  )}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/50 to-secondary/40 flex items-center justify-center font-bold text-black text-sm">
                      {otherName.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#040608]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{otherName}</p>
                    <p className="text-xs text-green-400/70 font-medium">Online agora</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all"
                    >
                      <MoreVertical size={16} />
                    </motion.button>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5" style={{ scrollBehavior: "smooth" }}>
                  {messagesLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
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
                        const showAvatar = !isMine && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
                        return (
                          <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMine={isMine}
                            showAvatar={showAvatar}
                            senderName={otherName}
                          />
                        );
                      })}
                      {typing && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input area */}
                <div className="flex items-end gap-3 px-4 py-3 border-t border-white/6 flex-shrink-0 bg-[#040608]/80 backdrop-blur-xl">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Digite uma mensagem..."
                      className="bg-white/6 border-white/10 focus:border-primary/40 rounded-2xl h-11 pr-4 text-sm"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                      newMessage.trim()
                        ? "bg-primary text-black neon-glow hover:bg-primary/90"
                        : "bg-white/6 text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    <Send size={17} />
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
