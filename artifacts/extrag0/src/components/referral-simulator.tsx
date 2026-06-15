import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

function SliderField({
  label, value, min, max, step, onChange, prefix,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(0,229,255,0.75)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: "#7CFC00" }}>{prefix}{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(90deg, #7CFC00 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.12) 0%)`,
          accentColor: "#7CFC00",
        }}
      />
      <div className="flex justify-between text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
        <span>{prefix}{min}</span><span>{prefix}{max}</span>
      </div>
    </div>
  );
}

interface ReferralSimulatorProps {
  variant?: "landing" | "app";
  showCta?: boolean;
}

export function ReferralSimulator({ variant = "landing", showCta = true }: ReferralSimulatorProps) {
  const [indicados, setIndicados] = useState(10);
  const [extrasPorMes, setExtrasPorMes] = useState(12);
  const [valorMedio, setValorMedio] = useState(220);

  const volume = indicados * extrasPorMes * valorMedio;
  const indicador = volume * 0.02;
  const agente = volume * 0.03;
  const embaixador = volume * 0.05;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

  const inner = (
    <div className="relative z-10 px-4 py-4 sm:px-8 sm:py-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg, #7CFC00, #00e5ff)" }} />
        <p className="text-xs font-black tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Simule seus ganhos com indicações</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="flex flex-col gap-4">
          <SliderField label="Indicados ativos" value={indicados} min={1} max={50} step={1} onChange={setIndicados} />
          <SliderField label="Extras/mês por indicado" value={extrasPorMes} min={1} max={30} step={1} onChange={setExtrasPorMes} />
          <SliderField label="Valor médio por extra" value={valorMedio} min={100} max={350} step={10} onChange={setValorMedio} prefix="R$ " />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-black tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.38)" }}>Sua renda passiva/mês</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-2.5 border text-center" style={{ background: "rgba(124,252,0,0.06)", borderColor: "rgba(124,252,0,0.2)" }}>
              <p className="text-[9px] font-bold mb-1" style={{ color: "#7CFC00" }}>Indicador</p>
              <p className="text-[9px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>2%</p>
              <p className="text-sm font-black leading-tight" style={{ color: "#7CFC00" }}>{fmt(indicador)}</p>
              <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>por mês</p>
            </div>
            <div className="rounded-xl p-2.5 border text-center" style={{ background: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.2)" }}>
              <p className="text-[9px] font-bold mb-1" style={{ color: "#00e5ff" }}>Agente</p>
              <p className="text-[9px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>3%</p>
              <p className="text-sm font-black leading-tight" style={{ color: "#00e5ff" }}>{fmt(agente)}</p>
              <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>por mês</p>
            </div>
            <div className="rounded-xl p-2.5 border text-center" style={{ background: "rgba(250,204,21,0.06)", borderColor: "rgba(250,204,21,0.2)" }}>
              <p className="text-[9px] font-bold mb-1" style={{ color: "#facc15" }}>Embaixador</p>
              <p className="text-[9px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>5%</p>
              <p className="text-sm font-black leading-tight" style={{ color: "#facc15" }}>{fmt(embaixador)}</p>
              <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>por mês</p>
            </div>
          </div>

          {showCta && variant === "landing" && (
            <Link href="/register?role=freelancer">
              <button
                className="w-full h-9 rounded-full font-bold text-black text-xs border-none cursor-pointer mt-1"
                style={{ background: "linear-gradient(135deg, #7CFC00, #9aff1c)", boxShadow: "0 3px 14px rgba(124,252,0,0.3)" }}
              >
                Construir minha rede <ArrowRight size={12} className="inline ml-1" />
              </button>
            </Link>
          )}

          {showCta && variant === "app" && (
            <p className="text-[9px] text-center mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Comissão recorrente sobre cada extra concluído pelos seus indicados. Sem limite de ganhos.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (variant === "app") {
    return (
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          backgroundImage: "url(/indicacoes-counter-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(2,6,16,0.72) 0%, rgba(0,10,6,0.65) 100%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.4) 40%, rgba(0,229,255,0.35) 60%, transparent)" }} />
        {inner}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-b-3xl"
      style={{
        borderTop: "1px solid rgba(124,252,0,0.10)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/indicacoes-counter-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(2,6,16,0.18) 0%, rgba(0,10,6,0.14) 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.4) 40%, rgba(0,229,255,0.35) 60%, transparent)" }} />
      {inner}
    </div>
  );
}
