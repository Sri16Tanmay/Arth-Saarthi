import { AssetAllocation, SimulationResult, SimulationScenario } from '../types';

export const simulationScenarios: SimulationScenario[] = [
  {
    id: 'stable-market',
    title: 'Stable Market',
    description: 'Steady economic growth, moderate inflation (~5%), balanced corporate earnings, and stable interest rates.',
    impacts: {
      equity: 0.09, // +9%
      debt: 0.065,  // +6.5%
      gold: 0.04,   // +4%
      cash: 0.035,  // +3.5%
    },
    macroContext: 'In a calm economic environment, equities expand in tandem with corporate profits, while debt yields steady interest and gold maintains its value.',
  },
  {
    id: 'market-growth',
    title: 'Market Growth (Bull Phase)',
    description: 'Surging economic activity, strong corporate profits, high foreign investments, and robust consumer spending across India.',
    impacts: {
      equity: 0.22, // +22%
      debt: 0.07,   // +7%
      gold: 0.02,   // +2%
      cash: 0.035,  // +3.5%
    },
    macroContext: 'Risk assets rally aggressively. Equities outperform significantly, while defensive assets like gold lag as investors rotate capital into high-growth sectors.',
  },
  {
    id: 'market-downturn',
    title: 'Market Downturn (Correction)',
    description: 'Slowdown in corporate earnings, global geopolitical tension, and rising interest rates causing equity pullbacks.',
    impacts: {
      equity: -0.14, // -14%
      debt: 0.05,    // +5%
      gold: 0.11,    // +11%
      cash: 0.035,   // +3.5%
    },
    macroContext: 'Equities correct as expectations reset. Debt remains resilient, and gold acts as a safe-haven hedge, softening overall portfolio drawdown.',
  },
  {
    id: 'high-inflation',
    title: 'High Inflation Shock',
    description: 'Spiking energy and food commodity prices driving consumer inflation above 8%, leading to central bank rate hikes.',
    impacts: {
      equity: 0.04,   // +4% nominal
      debt: -0.02,    // -2% (rising yields drop existing bond prices)
      gold: 0.18,     // +18% (gold acts as strong inflation shield)
      cash: -0.05,    // -5% real purchasing power erosion
    },
    macroContext: 'High inflation erodes bond returns and cash purchasing power, but gold historically shines as a reliable store of intrinsic value during currency debasement.',
  },
  {
    id: 'market-crash',
    title: 'Market Crash (Severe Crisis)',
    description: 'Sudden liquidity crunch, unexpected global shock, widespread panic selling, and margin calls across stock exchanges.',
    impacts: {
      equity: -0.28, // -28%
      debt: -0.04,   // -4%
      gold: 0.12,    // +12% (crisis hedge)
      cash: 0.035,   // +3.5% (capital preservation)
    },
    macroContext: 'Equities undergo steep panic liquidations. Gold and cash provide crucial capital preservation, proving why 100% equity exposure can be emotionally testing.',
  },
];

/**
 * Deterministic mathematical calculation of portfolio returns.
 * Strictly calculates based on exact percentage arithmetic.
 */
export function calculateSimulation(
  initialCapital: number,
  allocation: AssetAllocation,
  scenario: SimulationScenario
): SimulationResult {
  const equityInit = initialCapital * (allocation.equity / 100);
  const debtInit = initialCapital * (allocation.debt / 100);
  const goldInit = initialCapital * (allocation.gold / 100);
  const cashInit = initialCapital * (allocation.cash / 100);

  const equityFinal = Math.round(equityInit * (1 + scenario.impacts.equity));
  const debtFinal = Math.round(debtInit * (1 + scenario.impacts.debt));
  const goldFinal = Math.round(goldInit * (1 + scenario.impacts.gold));
  const cashFinal = Math.round(cashInit * (1 + scenario.impacts.cash));

  const finalValue = equityFinal + debtFinal + goldFinal + cashFinal;
  const netChange = finalValue - initialCapital;
  const changePercent = Number(((netChange / initialCapital) * 100).toFixed(2));

  const assetBreakdown = [
    {
      name: 'Equity',
      key: 'equity' as const,
      initial: Math.round(equityInit),
      final: equityFinal,
      changePercent: Number((scenario.impacts.equity * 100).toFixed(1)),
      color: '#2563EB', // professional cobalt blue
    },
    {
      name: 'Debt',
      key: 'debt' as const,
      initial: Math.round(debtInit),
      final: debtFinal,
      changePercent: Number((scenario.impacts.debt * 100).toFixed(1)),
      color: '#166534', // refined forest emerald
    },
    {
      name: 'Gold',
      key: 'gold' as const,
      initial: Math.round(goldInit),
      final: goldFinal,
      changePercent: Number((scenario.impacts.gold * 100).toFixed(1)),
      color: '#D97706', // warm amber gold
    },
    {
      name: 'Cash',
      key: 'cash' as const,
      initial: Math.round(cashInit),
      final: cashFinal,
      changePercent: Number((scenario.impacts.cash * 100).toFixed(1)),
      color: '#64748B', // neutral slate
    },
  ];

  // Deterministic takeaway text based on numbers
  let takeaway = '';
  if (changePercent >= 10) {
    takeaway = `Your portfolio expanded by ₹${netChange.toLocaleString('en-IN')}, driven by your ${allocation.equity}% allocation to equities during this strong expansion phase.`;
  } else if (changePercent >= 0) {
    takeaway = `Your portfolio gained ₹${netChange.toLocaleString('en-IN')}. Steady returns from debt and gold balanced out slower or turbulent areas.`;
  } else {
    const cushion = (allocation.gold > 0 || allocation.debt > 0)
      ? ` However, holding ${allocation.debt}% debt and ${allocation.gold}% gold cushioned your downside compared to a 100% equity portfolio which fell ${(scenario.impacts.equity * 100).toFixed(0)}%.`
      : ' Without defensive assets like debt or gold, your entire portfolio bore the full brunt of the equity decline.';
    takeaway = `Your portfolio declined by ₹${Math.abs(netChange).toLocaleString('en-IN')} (${changePercent}%).${cushion}`;
  }

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    initialCapital,
    finalValue,
    netChange,
    changePercent,
    assetBreakdown,
    deterministicTakeaway: takeaway,
  };
}
