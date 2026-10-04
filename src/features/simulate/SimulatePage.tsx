import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Info,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { AssetAllocation, Language, SimulationResult } from '../../types';
import { simulationScenarios, calculateSimulation } from '../../data/scenarios';
import { translations } from '../../data/translations';
import { explainSimulationWithAI } from '../../services/aiService';

interface SimulatePageProps {
  language: Language;
}

export const SimulatePage: React.FC<SimulatePageProps> = ({ language }) => {
  const t = translations[language];

  const INITIAL_CAPITAL = 100000;

  // Asset allocations in percentages (must sum to 100)
  const [allocation, setAllocation] = useState<AssetAllocation>({
    equity: 40,
    debt: 30,
    gold: 20,
    cash: 10,
  });

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('market-downturn');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const selectedScenario = useMemo(
    () => simulationScenarios.find((s) => s.id === selectedScenarioId) || simulationScenarios[0],
    [selectedScenarioId]
  );

  // Deterministic calculation
  const result: SimulationResult = useMemo(
    () => calculateSimulation(INITIAL_CAPITAL, allocation, selectedScenario),
    [INITIAL_CAPITAL, allocation, selectedScenario]
  );

  // Quick preset allocations
  const presets = [
    { name: 'Balanced', equity: 40, debt: 30, gold: 20, cash: 10 },
    { name: 'Growth', equity: 70, debt: 15, gold: 10, cash: 5 },
    { name: 'Conservative', equity: 20, debt: 50, gold: 20, cash: 10 },
    { name: 'Pure Equity', equity: 100, debt: 0, gold: 0, cash: 0 },
  ];

  // Helper to adjust allocation while maintaining 100% total
  const handleSliderChange = (changedKey: keyof AssetAllocation, newValue: number) => {
    setAiExplanation(null);
    const val = Math.max(0, Math.min(100, Math.round(newValue)));
    const keys: (keyof AssetAllocation)[] = ['equity', 'debt', 'gold', 'cash'];
    const otherKeys = keys.filter((k) => k !== changedKey);

    const oldOtherTotal = otherKeys.reduce((acc, k) => acc + allocation[k], 0);
    const targetOtherTotal = 100 - val;

    const nextAllocation = { ...allocation, [changedKey]: val };

    if (oldOtherTotal === 0) {
      const split = Math.floor(targetOtherTotal / otherKeys.length);
      otherKeys.forEach((k, idx) => {
        nextAllocation[k] = idx === 0 ? targetOtherTotal - split * (otherKeys.length - 1) : split;
      });
    } else {
      let allocatedSoFar = 0;
      otherKeys.forEach((k, idx) => {
        if (idx === otherKeys.length - 1) {
          nextAllocation[k] = Math.max(0, targetOtherTotal - allocatedSoFar);
        } else {
          const ratio = allocation[k] / oldOtherTotal;
          const assigned = Math.round(targetOtherTotal * ratio);
          nextAllocation[k] = Math.max(0, assigned);
          allocatedSoFar += nextAllocation[k];
        }
      });
    }

    setAllocation(nextAllocation);
  };

  const handleApplyPreset = (p: { equity: number; debt: number; gold: number; cash: number }) => {
    setAiExplanation(null);
    setAllocation({
      equity: p.equity,
      debt: p.debt,
      gold: p.gold,
      cash: p.cash,
    });
  };

  const handleRequestAIExplanation = async () => {
    setIsExplaining(true);
    try {
      const text = await explainSimulationWithAI({
        scenario: selectedScenario.title,
        initialCapital: INITIAL_CAPITAL,
        finalValue: result.finalValue,
        changePercent: result.changePercent,
        allocation,
        language,
      });
      setAiExplanation(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  const isPositive = result.netChange >= 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-16 flex flex-col gap-6 sm:gap-8">
      {/* ========================================================
          1. HEADER & SIMULATED MONEY BADGE
         ======================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E6E4DD]">
        <div>
          {/* Simulated Money Notice */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#D97706]/10 text-[#D97706] text-[11px] font-bold tracking-wider uppercase mb-2 border border-[#D97706]/20">
            <Info className="w-3.5 h-3.5" />
            <span>{t.simulatedCapitalNotice}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141716] tracking-tight">
            Experience Market Risk
          </h1>
          <p className="text-sm text-[#59605C] mt-1 max-w-xl">
            See how different asset mixes respond to economic shocks and growth cycles with ₹1,00,000 simulated capital.
          </p>
        </div>

        {/* Starting Capital Display */}
        <div className="p-3.5 bg-white rounded-xl border border-[#E6E4DD] shrink-0 shadow-2xs">
          <span className="text-[11px] font-medium text-[#59605C] block">
            Starting Simulated Capital
          </span>
          <span className="text-xl font-extrabold text-[#141716]">
            ₹{INITIAL_CAPITAL.toLocaleString('en-IN')}
          </span>
        </div>
      </section>

      {/* ========================================================
          2. ALLOCATION SLIDERS (100% Total)
         ======================================================== */}
      <section className="glass-medium rounded-2xl p-5 sm:p-6 border border-[#E6E4DD] flex flex-col gap-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141716]">
              1. Choose Your Asset Allocation
            </h2>
            <p className="text-xs text-[#59605C]">
              Total must equal 100%. Moving one slider automatically balances the others.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className="whitespace-nowrap px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E6E4DD] bg-white hover:bg-neutral-50 text-[#141716] transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {/* Equity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141716] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <span>{t.equity}</span>
              </span>
              <span className="font-mono font-bold text-sm text-[#2563EB]">
                {allocation.equity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.equity}
              onChange={(e) => handleSliderChange('equity', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-[#59605C]">
              High return potential · High volatility
            </span>
          </div>

          {/* Debt */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141716] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
                <span>{t.debt}</span>
              </span>
              <span className="font-mono font-bold text-sm text-[#166534]">
                {allocation.debt}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.debt}
              onChange={(e) => handleSliderChange('debt', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-[#59605C]">
              Fixed regular interest · Stability anchor
            </span>
          </div>

          {/* Gold */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141716] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                <span>{t.gold}</span>
              </span>
              <span className="font-mono font-bold text-sm text-[#D97706]">
                {allocation.gold}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.gold}
              onChange={(e) => handleSliderChange('gold', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-[#59605C]">
              Crisis hedge · Inflation protector
            </span>
          </div>

          {/* Cash */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141716] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
                <span>{t.cash}</span>
              </span>
              <span className="font-mono font-bold text-sm text-[#64748B]">
                {allocation.cash}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation.cash}
              onChange={(e) => handleSliderChange('cash', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-[#59605C]">
              Instant liquidity · No capital risk
            </span>
          </div>
        </div>

        {/* Visual Allocation Proportion Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-200 mt-1">
          <div
            style={{ width: `${allocation.equity}%` }}
            className="h-full bg-[#2563EB] transition-all duration-150"
            title={`Equity: ${allocation.equity}%`}
          />
          <div
            style={{ width: `${allocation.debt}%` }}
            className="h-full bg-[#166534] transition-all duration-150"
            title={`Debt: ${allocation.debt}%`}
          />
          <div
            style={{ width: `${allocation.gold}%` }}
            className="h-full bg-[#D97706] transition-all duration-150"
            title={`Gold: ${allocation.gold}%`}
          />
          <div
            style={{ width: `${allocation.cash}%` }}
            className="h-full bg-[#64748B] transition-all duration-150"
            title={`Cash: ${allocation.cash}%`}
          />
        </div>
      </section>

      {/* ========================================================
          3. SCENARIO SELECTOR (5 Scenarios)
         ======================================================== */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#141716]">
            2. Select a Market Scenario
          </h2>
          <span className="text-[11px] text-[#59605C] italic hidden sm:inline">
            {t.hypotheticalDisclaimer}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {simulationScenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setAiExplanation(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#141716] bg-[#141716] text-[#FBFBF9] shadow-xs'
                    : 'border-[#E6E4DD] bg-white text-[#141716] hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold leading-tight">
                      {sc.title}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#E6E4DD]" />}
                  </div>
                  <p
                    className={`text-[11px] line-clamp-2 ${
                      isSelected ? 'text-[#E6E4DD]/80' : 'text-[#59605C]'
                    }`}
                  >
                    {sc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="sm:hidden text-[11px] text-[#59605C] italic text-center">
          {t.hypotheticalDisclaimer}
        </div>
      </section>

      {/* ========================================================
          4. SIMULATION RESULTS CARD
         ======================================================== */}
      <section className="glass-premium rounded-2xl p-5 sm:p-7 border border-[#E6E4DD] flex flex-col gap-6 shadow-sm">
        {/* Outcome Scoreboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
          <div>
            <span className="text-xs font-medium text-[#59605C] uppercase tracking-wider block">
              Simulated Outcome · {selectedScenario.title}
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#141716]">
                ₹{result.finalValue.toLocaleString('en-IN')}
              </span>
              <span
                className={`inline-flex items-center text-sm sm:text-base font-bold ${
                  isPositive ? 'text-[#166534]' : 'text-rose-700'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {isPositive ? '+' : ''}
                {result.changePercent}% (₹{Math.abs(result.netChange).toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#59605C] block">
              Initial Capital
            </span>
            <span className="text-sm font-semibold text-[#141716]">
              ₹{INITIAL_CAPITAL.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Asset-by-Asset Impact Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#141716] mb-3">
            Asset Breakdown in this Scenario
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {result.assetBreakdown.map((item) => {
              const gained = item.final >= item.initial;
              return (
                <div
                  key={item.key}
                  className="p-3 rounded-xl bg-white border border-[#E6E4DD] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs text-[#59605C] mb-1">
                    <span className="font-semibold text-[#141716]">{item.name}</span>
                    <span
                      className={`font-semibold ${
                        gained ? 'text-[#166534]' : 'text-rose-600'
                      }`}
                    >
                      {item.changePercent > 0 ? '+' : ''}
                      {item.changePercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-[#141716]">
                      ₹{item.final.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-[#59605C] block">
                      From ₹{item.initial.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            5. "WHY DID THIS HAPPEN?" (Deterministic explanation)
           ======================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F7F2] border border-[#E6E4DD] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#166534]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#141716]">
                {t.whyDidThisHappen}
              </h3>
            </div>

            {/* AI Explanation Trigger Button */}
            {!aiExplanation && (
              <button
                onClick={handleRequestAIExplanation}
                disabled={isExplaining}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-[#166534] border border-[#166534]/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                {isExplaining ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.explaining}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
                    <span>{t.explainWithAI}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mathematical deterministic attribution */}
          <p className="text-xs sm:text-sm text-[#141716] leading-relaxed">
            {result.deterministicTakeaway}
          </p>

          {/* Detailed AI Explanation if requested */}
          {aiExplanation && (
            <div className="pt-3 border-t border-black/[0.06] flex flex-col gap-2">
              <span className="text-xs font-bold text-[#166534]">
                Arth-Saarthi Macro Analysis:
              </span>
              <p className="text-xs sm:text-sm text-[#59605C] leading-relaxed whitespace-pre-line">
                {aiExplanation}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
