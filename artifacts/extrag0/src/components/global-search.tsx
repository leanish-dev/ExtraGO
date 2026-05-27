import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Briefcase, Users, Building2, MapPin, Clock, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { useListJobs } from "@workspace/api-client-react";
import { Link } from "wouter";

interface SearchResult {
  id: string;
  type: "job" | "freelancer" | "company" | "city";
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

const RECENT_SEARCHES_KEY = "extragO_recent_searches";

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(q: string) {
  const existing = getRecentSearches().filter(s => s !== q);
  const updated = [q, ...existing].slice(0, 6);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

const CATEGORY_SUGGESTIONS = [
  "Garçom", "Barman", "Hostess", "Chef", "Recepcionista",
  "Bartender", "Copeiro", "Promoter", "Segurança", "DJ",
];

const CITY_SUGGESTIONS = [
  { city: "São Paulo", state: "SP" },
  { city: "Rio de Janeiro", state: "RJ" },
  { city: "Belo Horizonte", state: "MG" },
  { city: "Curitiba", state: "PR" },
  { city: "Porto Alegre", state: "RS" },
  { city: "Salvador", state: "BA" },
  { city: "Brasília", state: "DF" },
  { city: "Fortaleza", state: "CE" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  job: <Briefcase size={14} />,
  freelancer: <Users size={14} />,
  company: <Building2 size={14} />,
  city: <MapPin size={14} />,
};

const TYPE_COLORS: Record<string, string> = {
  job: "text-primary bg-primary/10 border-primary/20",
  freelancer: "text-secondary bg-secondary/10 border-secondary/20",
  company: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  city: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

const TYPE_LABELS: Record<string, string> = {
  job: "Vaga",
  freelancer: "Freelancer",
  company: "Empresa",
  city: "Cidade",
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "job" | "freelancer" | "company" | "city">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: jobs = [] } = useListJobs({ status: "open" });

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    // Search jobs
    (jobs as any[]).slice(0, 20).forEach((job: any) => {
      if (
        job.title?.toLowerCase().includes(q) ||
        job.city?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q)
      ) {
        found.push({
          id: `job-${job.id}`,
          type: "job",
          title: job.title ?? "Vaga",
          subtitle: `${job.city ?? ""}${job.city && job.date ? " · " : ""}${job.date ? new Date(job.date).toLocaleDateString("pt-BR") : ""}`,
          href: `/app/jobs`,
          badge: `R$ ${((job.payment ?? 0) / 100).toFixed(0)}`,
          badgeColor: "text-primary",
        });
      }
    });

    // City suggestions
    CITY_SUGGESTIONS.forEach(c => {
      if (c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)) {
        found.push({
          id: `city-${c.city}`,
          type: "city",
          title: c.city,
          subtitle: `Estado: ${c.state}`,
          href: `/app/jobs?city=${encodeURIComponent(c.city)}`,
        });
      }
    });

    // Category suggestions as job searches
    CATEGORY_SUGGESTIONS.forEach(cat => {
      if (cat.toLowerCase().includes(q)) {
        found.push({
          id: `cat-${cat}`,
          type: "job",
          title: `Vagas de ${cat}`,
          subtitle: "Buscar vagas nesta categoria",
          href: `/app/jobs?search=${encodeURIComponent(cat)}`,
        });
      }
    });

    setResults(
      activeFilter === "all"
        ? found.slice(0, 8)
        : found.filter(r => r.type === activeFilter).slice(0, 8)
    );
  }, [query, jobs, activeFilter]);

  const handleSelect = useCallback((r: SearchResult) => {
    if (query.trim()) saveRecentSearch(query.trim());
    onClose();
  }, [query, onClose]);

  const handleRecentClick = useCallback((s: string) => {
    setQuery(s);
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }, []);

  const FILTERS = [
    { value: "all" as const, label: "Tudo" },
    { value: "job" as const, label: "Vagas", icon: <Briefcase size={12} /> },
    { value: "freelancer" as const, label: "Freelancers", icon: <Users size={12} /> },
    { value: "company" as const, label: "Empresas", icon: <Building2 size={12} /> },
    { value: "city" as const, label: "Cidades", icon: <MapPin size={12} /> },
  ];

  const showEmpty = query.trim().length > 0 && results.length === 0;
  const showRecent = !query.trim() && recentSearches.length > 0;
  const showSuggestions = !query.trim();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 z-[91] w-[92vw] max-w-[600px]"
          >
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
              style={{
                background: "rgba(8, 14, 22, 0.97)",
                backdropFilter: "blur(40px) saturate(180%)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,252,0,0.08)"
              }}
            >
              {/* Search bar */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/6">
                <Search size={18} className="text-primary flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar vagas, profissionais, cidades..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50 text-foreground"
                  onKeyDown={e => {
                    if (e.key === "Escape") onClose();
                  }}
                />
                {query && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setQuery("")}
                    className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <X size={13} />
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors flex-shrink-0 px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  ESC
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 overflow-x-auto scrollbar-none">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setActiveFilter(f.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      activeFilter === f.value
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Results / Suggestions */}
              <div className="max-h-[52vh] overflow-y-auto">
                {/* Search results */}
                {results.length > 0 && (
                  <div className="p-2">
                    {results.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link href={r.href}>
                          <div
                            onClick={() => handleSelect(r)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                          >
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 text-xs ${TYPE_COLORS[r.type]}`}>
                              {TYPE_ICONS[r.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{r.title}</p>
                              {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {r.badge && <span className={`text-xs font-bold ${r.badgeColor ?? "text-muted-foreground"}`}>{r.badge}</span>}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[r.type]}`}>
                                {TYPE_LABELS[r.type]}
                              </span>
                              <ArrowRight size={12} className="text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {showEmpty && (
                  <div className="py-10 text-center">
                    <Search size={28} className="text-muted-foreground/25 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground/60">Nenhum resultado para "{query}"</p>
                    <p className="text-xs text-muted-foreground/35 mt-1">Tente outros termos ou navegue pelas vagas</p>
                    <Link href="/app/jobs">
                      <button
                        onClick={onClose}
                        className="mt-4 text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mx-auto"
                      >
                        Ver todas as vagas <ArrowRight size={11} />
                      </button>
                    </Link>
                  </div>
                )}

                {/* Recent searches */}
                {showRecent && (
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={10} /> Buscas recentes
                      </p>
                      <button
                        onClick={clearRecent}
                        className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleRecentClick(s)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-all group"
                      >
                        <Clock size={13} className="text-muted-foreground/35 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">{s}</span>
                        <ArrowRight size={11} className="text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular suggestions */}
                {showSuggestions && (
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                      <TrendingUp size={10} /> Categorias populares
                    </p>
                    <div className="flex flex-wrap gap-2 px-1">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setQuery(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/7 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/25 hover:bg-primary/8 transition-all"
                        >
                          <Zap size={10} className="text-primary/60" />
                          {cat}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-2 px-1 mt-4 flex items-center gap-1.5">
                      <MapPin size={10} /> Cidades populares
                    </p>
                    <div className="flex flex-wrap gap-2 px-1">
                      {CITY_SUGGESTIONS.slice(0, 5).map((c) => (
                        <button
                          key={c.city}
                          onClick={() => setQuery(c.city)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/7 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-secondary/25 hover:bg-secondary/8 transition-all"
                        >
                          <MapPin size={10} className="text-secondary/60" />
                          {c.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5">
                <p className="text-[10px] text-muted-foreground/30 flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">↵</kbd> selecionar
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">ESC</kbd> fechar
                </p>
                <Link href="/app/jobs">
                  <button
                    onClick={onClose}
                    className="text-[11px] font-semibold text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    Ver todas as vagas <ArrowRight size={10} />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface GlobalSearchButtonProps {
  className?: string;
}

export function GlobalSearchButton({ className = "" }: GlobalSearchButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        title="Buscar (⌘K)"
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all ${className}`}
      >
        <Search size={17} />
      </motion.button>
      <GlobalSearch open={open} onClose={() => setOpen(false)} />
    </>
  );
}
