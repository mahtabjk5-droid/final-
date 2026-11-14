import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, Coins, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { ChromaticKashiRule } from './SovereignArt';
import { triggerSovereignHaptic } from '../utils/haptics';
import type { SovereignSystemState } from '../types/sovereign';

interface BolMizanSpreadChartProps {
  state: SovereignSystemState;
}

type CommodityKey = 'basmati' | 'dates' | 'mangoes';

interface CommodityCorridor {
  key: CommodityKey;
  label: string;
  mandiOrigin: string;
  gulfHub: string;
  mandiBasePkr: number;
  goldEquivBasePkr: number;
  volatility: number;
}

interface SpreadTick {
  index: number;
  timestamp: Date;
  mandiPricePkr: number;
  intlGoldEquivPkr: number;
  spreadPkr: number;
  spreadGoldGrams: number;
  spreadPct: number;
  parabolicFitPkr: number;
}

const GOLD_PRICE_PER_GRAM_PKR = 24_800;

const CORRIDORS: Record<CommodityKey, CommodityCorridor> = {
  basmati: {
    key: 'basmati',
    label: 'Super Kernel Basmati',
    mandiOrigin: 'Sakrand Mandi (PKR/Ton)',
    gulfHub: 'Riyadh / LBMA Gold Parity',
    mandiBasePkr: 268_000,
    goldEquivBasePkr: 302_400,
    volatility: 1_900,
  },
  dates: {
    key: 'dates',
    label: 'Khairpur Aseel Dates',
    mandiOrigin: 'Khairpur Mandi (PKR/Ton)',
    gulfHub: 'Dubai Al-Aweer Gold Parity',
    mandiBasePkr: 194_000,
    goldEquivBasePkr: 226_800,
    volatility: 1_550,
  },
  mangoes: {
    key: 'mangoes',
    label: 'Sindhri Export Mangoes',
    mandiOrigin: 'Mirpurkhas–Sakrand Mandi',
    gulfHub: 'Doha / Jeddah Gold Parity',
    mandiBasePkr: 232_000,
    goldEquivBasePkr: 271_500,
    volatility: 2_250,
  },
};

/**
 * Solves ordinary least-squares quadratic parabolic fit y = a*x^2 + b*x + c
 * across normalized window x in [0, 1] for deep-tech convexity validation.
 */
function fitParabolicCurve(values: number[]): {
  fitted: number[];
  curvatureCoeff: number;
} {
  const n = values.length;
  if (n < 3) {
    return { fitted: [...values], curvatureCoeff: 0 };
  }

  let s0 = n;
  let s1 = 0;
  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  let sy0 = 0;
  let sy1 = 0;
  let sy2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    const x2 = x * x;
    const y = values[i];
    s1 += x;
    s2 += x2;
    s3 += x2 * x;
    s4 += x2 * x2;
    sy0 += y;
    sy1 += x * y;
    sy2 += x2 * y;
  }

  // Solve 3x3 linear system via Gaussian elimination with partial pivoting
  const A = [
    [s0, s1, s2, sy0],
    [s1, s2, s3, sy1],
    [s2, s3, s4, sy2],
  ];

  for (let col = 0; col < 3; col++) {
    let pivotRow = col;
    for (let r = col + 1; r < 3; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivotRow][col])) {
        pivotRow = r;
      }
    }
    if (pivotRow !== col) {
      const tmp = A[col];
      A[col] = A[pivotRow];
      A[pivotRow] = tmp;
    }
    const diag = A[col][col];
    if (Math.abs(diag) < 1e-12) {
      return { fitted: [...values], curvatureCoeff: 0 };
    }
    for (let r = col + 1; r < 3; r++) {
      const factor = A[r][col] / diag;
      for (let c = col; c < 4; c++) {
        A[r][c] -= factor * A[col][c];
      }
    }
  }

  const aCoeff = A[2][3] / A[2][2];
  const bCoeff = (A[1][3] - A[1][2] * aCoeff) / A[1][1];
  const cCoeff = (A[0][3] - A[0][1] * bCoeff - A[0][2] * aCoeff) / A[0][0];

  const fitted = values.map((_, i) => {
    const x = i / (n - 1);
    return Math.round(aCoeff * x * x + bCoeff * x + cCoeff);
  });

  return {
    fitted,
    curvatureCoeff: Math.round(aCoeff),
  };
}

function buildSeedTicks(corridor: CommodityCorridor, dealCount: number): {
  ticks: SpreadTick[];
  curvature: number;
} {
  const now = Date.now();
  const count = 18;
  const dealBoost = Math.max(0, dealCount - 3) * 1_150;
  const rawTicks: Omit<SpreadTick, 'parabolicFitPkr'>[] = [];

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1); // 0..1
    // Parabolic compounding spread growth + gentle mandi oscillation
    const mandiOsc = Math.sin(i * 0.68) * corridor.volatility * 0.55;
    const mandiPricePkr = Math.round(corridor.mandiBasePkr + mandiOsc - u * 1_800);
    const parabolicLift = Math.pow(u, 1.85) * 9_400 + dealBoost;
    const intlGoldEquivPkr = Math.round(
      corridor.goldEquivBasePkr + parabolicLift + Math.cos(i * 0.5) * corridor.volatility * 0.45,
    );
    const spreadPkr = Math.max(4_000, intlGoldEquivPkr - mandiPricePkr);
    rawTicks.push({
      index: i,
      timestamp: new Date(now - (count - 1 - i) * 2_200),
      mandiPricePkr,
      intlGoldEquivPkr,
      spreadPkr,
      spreadGoldGrams: Number((spreadPkr / GOLD_PRICE_PER_GRAM_PKR).toFixed(3)),
      spreadPct: Number(((spreadPkr / mandiPricePkr) * 100).toFixed(2)),
    });
  }

  const { fitted, curvatureCoeff } = fitParabolicCurve(rawTicks.map((t) => t.spreadPkr));
  return {
    ticks: rawTicks.map((t, idx) => ({ ...t, parabolicFitPkr: fitted[idx] })),
    curvature: curvatureCoeff,
  };
}

export const BolMizanSpreadChart: React.FC<BolMizanSpreadChartProps> = ({ state }) => {
  const [corridorKey, setCorridorKey] = useState<CommodityKey>('basmati');
  const [streaming, setStreaming] = useState(true);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [chartWidth, setChartWidth] = useState(780);
  const [hoveredTick, setHoveredTick] = useState<SpreadTick | null>(null);

  const corridor = CORRIDORS[corridorKey];
  const initialData = useMemo(
    () => buildSeedTicks(corridor, state.deals.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [corridorKey],
  );

  const [ticks, setTicks] = useState<SpreadTick[]>(initialData.ticks);
  const [curvatureCoeff, setCurvatureCoeff] = useState<number>(initialData.curvature);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stepCounterRef = useRef(18);

  // Reset seed cleanly when user switches commodity corridor
  useEffect(() => {
    const fresh = buildSeedTicks(CORRIDORS[corridorKey], state.deals.length);
    setTicks(fresh.ticks);
    setCurvatureCoeff(fresh.curvature);
    setHoveredTick(null);
    stepCounterRef.current = fresh.ticks.length;
  }, [corridorKey, state.deals.length]);

  // Measure responsive container via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const sync = () => setChartWidth(Math.max(320, Math.floor(el.clientWidth)));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Live streaming parabolic tick updates
  useEffect(() => {
    if (!streaming || state.killSwitch.active) return;

    const timer = window.setInterval(() => {
      setTicks((prev) => {
        const idx = stepCounterRef.current++;
        const dealBoost = Math.max(0, state.deals.length - 3) * 1_150;
        const phase = (idx % 24) / 23;

        const mandiOsc = Math.sin(idx * 0.62) * corridor.volatility * 0.65;
        const mandiPricePkr = Math.round(corridor.mandiBasePkr + mandiOsc - phase * 1_500);

        // Parabolic upward spread convexity reinforced by active deals
        const parabolicLift =
          Math.pow(phase, 1.8) * 10_200 +
          dealBoost +
          Math.cos(idx * 0.42) * corridor.volatility * 0.5;
        const intlGoldEquivPkr = Math.round(corridor.goldEquivBasePkr + parabolicLift);
        const spreadPkr = Math.max(4_500, intlGoldEquivPkr - mandiPricePkr);

        const nextRaw: SpreadTick = {
          index: idx,
          timestamp: new Date(),
          mandiPricePkr,
          intlGoldEquivPkr,
          spreadPkr,
          spreadGoldGrams: Number((spreadPkr / GOLD_PRICE_PER_GRAM_PKR).toFixed(3)),
          spreadPct: Number(((spreadPkr / mandiPricePkr) * 100).toFixed(2)),
          parabolicFitPkr: spreadPkr,
        };

        const windowTicks = [...prev.slice(-21), nextRaw];
        const { fitted, curvatureCoeff: nextCurv } = fitParabolicCurve(
          windowTicks.map((t) => t.spreadPkr),
        );
        setCurvatureCoeff(nextCurv);
        return windowTicks.map((t, i) => ({ ...t, parabolicFitPkr: fitted[i] }));
      });
    }, 2200);

    return () => window.clearInterval(timer);
  }, [streaming, state.killSwitch.active, state.deals.length, corridor]);

  // Render D3 Parabolic Line Chart
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || ticks.length < 3) return;

    const height = 276;
    const margin = { top: 22, right: 62, bottom: 34, left: 66 };
    const innerWidth = Math.max(140, chartWidth - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${chartWidth} ${height}`);

    const defs = svg.append('defs');

    // Parabolic spread glowing stroke & area gradient
    const spreadAreaGrad = defs
      .append('linearGradient')
      .attr('id', 'bolmizan-parabolic-area')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    spreadAreaGrad
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', state.killSwitch.active ? '#FB7185' : '#F59E0B')
      .attr('stop-opacity', 0.34);
    spreadAreaGrad
      .append('stop')
      .attr('offset', '55%')
      .attr('stop-color', '#14B8A6')
      .attr('stop-opacity', 0.14);
    spreadAreaGrad
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#05131B')
      .attr('stop-opacity', 0.0);

    const lineGrad = defs
      .append('linearGradient')
      .attr('id', 'bolmizan-parabolic-stroke')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    lineGrad.append('stop').attr('offset', '0%').attr('stop-color', '#5EEAD4');
    lineGrad
      .append('stop')
      .attr('offset', '55%')
      .attr('stop-color', state.killSwitch.active ? '#FB7185' : '#F59E0B');
    lineGrad.append('stop').attr('offset', '100%').attr('stop-color', '#FDE68A');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(ticks, (d) => d.timestamp) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const spreadMin = Math.max(
      0,
      (d3.min(ticks, (d) => Math.min(d.spreadPkr, d.parabolicFitPkr)) ?? 20_000) - 4_500,
    );
    const spreadMax =
      (d3.max(ticks, (d) => Math.max(d.spreadPkr, d.parabolicFitPkr)) ?? 55_000) + 4_500;

    const ySpreadScale = d3
      .scaleLinear()
      .domain([spreadMin, spreadMax])
      .nice()
      .range([innerHeight, 0]);

    const yGoldScale = d3
      .scaleLinear()
      .domain([spreadMin / GOLD_PRICE_PER_GRAM_PKR, spreadMax / GOLD_PRICE_PER_GRAM_PKR])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines
    g.append('g')
      .call(
        d3
          .axisLeft(ySpreadScale)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .call((grid) => {
        grid.select('.domain').remove();
        grid
          .selectAll('line')
          .attr('stroke', '#F59E0B')
          .attr('stroke-opacity', 0.14)
          .attr('stroke-dasharray', '3 4');
      });

    // Bottom Time Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(Math.min(6, Math.floor(innerWidth / 100)))
          .tickFormat((d) => d3.timeFormat('%H:%M:%S')(d as Date)),
      )
      .call((axis) => {
        axis.select('.domain').attr('stroke', 'rgba(245,158,11,0.3)');
        axis.selectAll('line').attr('stroke', 'rgba(245,158,11,0.3)');
        axis
          .selectAll('text')
          .attr('fill', 'rgba(248,247,243,0.72)')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '10px');
      });

    // Left Y Axis: BolMizan Spread (PKR/ton)
    g.append('g')
      .call(
        d3
          .axisLeft(ySpreadScale)
          .ticks(4)
          .tickFormat((d) => `${(Number(d) / 1000).toFixed(0)}k`),
      )
      .call((axis) => {
        axis.select('.domain').attr('stroke', 'rgba(245,158,11,0.35)');
        axis.selectAll('line').attr('stroke', 'rgba(245,158,11,0.35)');
        axis
          .selectAll('text')
          .attr('fill', '#FDE68A')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '10px');
      });

    // Right Y Axis: 24K Gold Equivalent Spread (g Au/ton)
    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(
        d3
          .axisRight(yGoldScale)
          .ticks(4)
          .tickFormat((d) => `${Number(d).toFixed(2)}g Au`),
      )
      .call((axis) => {
        axis.select('.domain').attr('stroke', 'rgba(94,234,212,0.35)');
        axis.selectAll('line').attr('stroke', 'rgba(94,234,212,0.35)');
        axis
          .selectAll('text')
          .attr('fill', '#5EEAD4')
          .style('font-family', 'var(--font-mono)')
          .style('font-size', '10px');
      });

    // Parabolic Confidence Ribbon around fitted curve
    if (showBenchmarks) {
      const confidenceBand = d3
        .area<SpreadTick>()
        .x((d) => xScale(d.timestamp))
        .y0((d) => ySpreadScale(Math.max(spreadMin, d.parabolicFitPkr - corridor.volatility * 0.9)))
        .y1((d) => ySpreadScale(Math.min(spreadMax, d.parabolicFitPkr + corridor.volatility * 0.9)))
        .curve(d3.curveCatmullRom.alpha(0.5));

      g.append('path')
        .datum(ticks)
        .attr('fill', 'rgba(94, 234, 212, 0.08)')
        .attr('stroke', 'rgba(94, 234, 212, 0.2)')
        .attr('stroke-width', 0.75)
        .attr('stroke-dasharray', '2 3')
        .attr('d', confidenceBand);
    }

    // Parabolic Area under BolMizan Spread
    const spreadArea = d3
      .area<SpreadTick>()
      .x((d) => xScale(d.timestamp))
      .y0(innerHeight)
      .y1((d) => ySpreadScale(d.spreadPkr))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(ticks)
      .attr('fill', 'url(#bolmizan-parabolic-area)')
      .attr('d', spreadArea);

    // Quadratic Parabolic Regression Trajectory Line (y = ax^2 + bx + c)
    const parabolicFitLine = d3
      .line<SpreadTick>()
      .x((d) => xScale(d.timestamp))
      .y((d) => ySpreadScale(d.parabolicFitPkr))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(ticks)
      .attr('fill', 'none')
      .attr('stroke', '#5EEAD4')
      .attr('stroke-width', 1.75)
      .attr('stroke-dasharray', '6 4')
      .attr('stroke-opacity', 0.85)
      .attr('d', parabolicFitLine);

    // Live Parabolic BolMizan Spread Line
    const spreadLine = d3
      .line<SpreadTick>()
      .x((d) => xScale(d.timestamp))
      .y((d) => ySpreadScale(d.spreadPkr))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(ticks)
      .attr('fill', 'none')
      .attr('stroke', 'url(#bolmizan-parabolic-stroke)')
      .attr('stroke-width', 2.8)
      .attr('d', spreadLine);

    // Subtle vertex dots on recent nodes + live pulse node
    const lastTick = ticks[ticks.length - 1];
    g.selectAll('.bolmizan-node')
      .data(ticks.slice(-6))
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.timestamp))
      .attr('cy', (d) => ySpreadScale(d.spreadPkr))
      .attr('r', (_, i, arr) => (i === arr.length - 1 ? 5.2 : 2.3))
      .attr('fill', (_, i, arr) =>
        i === arr.length - 1 ? (state.killSwitch.active ? '#FB7185' : '#FDE68A') : '#F59E0B',
      )
      .attr('stroke', '#05131B')
      .attr('stroke-width', 1.5);

    // Halo ring on live terminal node
    g.append('circle')
      .attr('cx', xScale(lastTick.timestamp))
      .attr('cy', ySpreadScale(lastTick.spreadPkr))
      .attr('r', 10)
      .attr('fill', 'none')
      .attr('stroke', state.killSwitch.active ? '#FB7185' : '#F59E0B')
      .attr('stroke-opacity', 0.45)
      .attr('stroke-width', 1.5);

    // Interactive Crosshair Bisector
    const focusGroup = g.append('g').style('display', 'none');
    focusGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#FDE68A')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-dasharray', '3 3');

    const focusDot = focusGroup
      .append('circle')
      .attr('r', 5.5)
      .attr('fill', '#F59E0B')
      .attr('stroke', '#05131B')
      .attr('stroke-width', 1.8);

    const focusFitDot = focusGroup
      .append('circle')
      .attr('r', 3.8)
      .attr('fill', '#5EEAD4')
      .attr('stroke', '#05131B')
      .attr('stroke-width', 1.4);

    const bisectDate = d3.bisector<SpreadTick, Date>((d) => d.timestamp).left;

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('pointerenter', () => focusGroup.style('display', 'inline'))
      .on('pointerleave', () => {
        focusGroup.style('display', 'none');
        setHoveredTick(null);
      })
      .on('pointermove', (event: PointerEvent) => {
        const [mx] = d3.pointer(event);
        const xDate = xScale.invert(mx);
        const idx = Math.min(ticks.length - 1, Math.max(0, bisectDate(ticks, xDate, 1)));
        const t0 = ticks[idx - 1];
        const t1 = ticks[idx];
        const pt =
          t0 && t1
            ? xDate.getTime() - t0.timestamp.getTime() > t1.timestamp.getTime() - xDate.getTime()
              ? t1
              : t0
            : ticks[idx];
        if (!pt) return;
        const px = xScale(pt.timestamp);
        focusGroup.select('line').attr('x1', px).attr('x2', px);
        focusDot.attr('cx', px).attr('cy', ySpreadScale(pt.spreadPkr));
        focusFitDot.attr('cx', px).attr('cy', ySpreadScale(pt.parabolicFitPkr));
        setHoveredTick(pt);
      });
  }, [ticks, chartWidth, showBenchmarks, corridor.volatility, state.killSwitch.active]);

  const activeTick = hoveredTick ?? ticks[ticks.length - 1];

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#14B8A6]/35 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#5EEAD4] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              D3.js Parabolic Arbitrage Engine // Mandi-to-24K Gold Parity
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F8F7F3]">
              Real-Time BolMizan Spread (Local Mandi vs. International Gold)
            </h2>
            <p className="text-xs text-[#F8F7F3]/70">
              {corridor.mandiOrigin} vs. {corridor.gulfHub} · Live Quadratic Convexity Curve (y = ax² + bx + c)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(CORRIDORS) as CommodityKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  triggerSovereignHaptic('tap');
                  setCorridorKey(key);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  corridorKey === key
                    ? 'bg-[#F59E0B] text-[#05131B]'
                    : 'border border-[#F59E0B]/25 text-[#F8F7F3]/80 hover:border-[#F59E0B]'
                }`}
              >
                {CORRIDORS[key].label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                triggerSovereignHaptic('tap');
                setShowBenchmarks((v) => !v);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors whitespace-nowrap ${
                showBenchmarks
                  ? 'border-[#5EEAD4]/50 bg-[#0F766E]/30 text-[#5EEAD4]'
                  : 'border-[#F59E0B]/20 text-[#F8F7F3]/70'
              }`}
            >
              {showBenchmarks ? 'Band: ON' : 'Band: OFF'}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerSovereignHaptic('tap');
                setStreaming((s) => !s);
              }}
              className="kashi-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#14B8A6]/40 bg-[#07262B]/80 text-xs font-semibold text-[#5EEAD4] whitespace-nowrap"
            >
              {streaming && !state.killSwitch.active ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Live Stream
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> {state.killSwitch.active ? 'Rails Frozen' : 'Paused'}
                </>
              )}
            </button>

            <button
              type="button"
              aria-label="Reset BolMizan spread window"
              onClick={() => {
                triggerSovereignHaptic('tap');
                const fresh = buildSeedTicks(corridor, state.deals.length);
                setTicks(fresh.ticks);
                setCurvatureCoeff(fresh.curvature);
                setHoveredTick(null);
              }}
              className="p-1.5 rounded-md border border-[#F59E0B]/25 text-[#FDE68A] hover:bg-[#F59E0B]/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Synchronized KPI Readout Strip */}
        {activeTick && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-lg border border-[#F59E0B]/20 ajrak-well px-4 py-3">
              <p className="text-[11px] text-[#F8F7F3]/65">Local Mandi Spot Rate</p>
              <p className="font-mono-tabular text-base sm:text-lg font-bold text-[#F8F7F3]">
                PKR {activeTick.mandiPricePkr.toLocaleString('en-US')}/t
              </p>
            </div>
            <div className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-4 py-3">
              <p className="text-[11px] text-[#F8F7F3]/65">Int&apos;l 24K Gold Parity</p>
              <p className="font-mono-tabular text-base sm:text-lg font-bold text-[#FDE68A]">
                PKR {activeTick.intlGoldEquivPkr.toLocaleString('en-US')}/t
              </p>
            </div>
            <div className="rounded-lg border border-[#14B8A6]/30 ajrak-well px-4 py-3">
              <p className="text-[11px] text-[#F8F7F3]/65 inline-flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#F59E0B]" />
                BolMizan Spread ({hoveredTick ? 'Cursor' : 'Live'})
              </p>
              <p className="font-mono-tabular text-base sm:text-lg font-bold text-[#5EEAD4]">
                +PKR {activeTick.spreadPkr.toLocaleString('en-US')} ({activeTick.spreadGoldGrams.toFixed(2)}g Au)
              </p>
            </div>
            <div className="rounded-lg border border-[#F59E0B]/20 ajrak-well px-4 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] text-[#F8F7F3]/65">Parabolic Convexity (a)</p>
                <p className="font-mono-tabular text-base sm:text-lg font-bold text-emerald-300">
                  {curvatureCoeff >= 0 ? `+${curvatureCoeff.toLocaleString('en-US')}` : curvatureCoeff.toLocaleString('en-US')} · {activeTick.spreadPct.toFixed(2)}%
                </p>
              </div>
              <Activity className="w-5 h-5 text-[#5EEAD4] shrink-0" />
            </div>
          </div>
        )}

        {/* D3 Parabolic Chart Canvas */}
        <div
          ref={containerRef}
          data-no-swipe="true"
          className="rounded-xl border border-[#F59E0B]/20 ajrak-well p-3 sm:p-4 select-none"
        >
          <svg
            ref={svgRef}
            className="w-full h-[276px] block overflow-visible"
            role="img"
            aria-label="D3 Live Parabolic BolMizan Spread Chart"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F59E0B]/15 text-[11px] text-[#F8F7F3]/70">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-gradient-to-r from-[#5EEAD4] via-[#F59E0B] to-[#FDE68A]" />
                Live BolMizan Spread (Catmull-Rom Parabolic Curve)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#5EEAD4]" />
                Least-Squares Parabolic Fit (y = ax² + bx + c)
              </span>
            </div>
            <span className="font-mono-tabular">
              24K Gold Reference: PKR {GOLD_PRICE_PER_GRAM_PKR.toLocaleString('en-US')}/g · Hover to Inspect
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
