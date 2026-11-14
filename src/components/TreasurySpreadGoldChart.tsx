import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, Pause, Play, TrendingUp } from 'lucide-react';
import { ChromaticKashiRule } from './SovereignArt';
import type { SovereignSystemState } from '../types/sovereign';

interface TreasurySpreadGoldChartProps {
  state: SovereignSystemState;
}

interface ChartPoint {
  date: Date;
  goldGrams: number;
  spreadPct: number;
  spreadPkrPerTon: number;
  label: string;
}

const SAKRAND_BASE_TON_PKR = 265_000;

export const TreasurySpreadGoldChart: React.FC<TreasurySpreadGoldChartProps> = ({ state }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chartWidth, setChartWidth] = useState(760);
  const [liveStreaming, setLiveStreaming] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [viewMode, setViewMode] = useState<'combined' | 'gold' | 'spread'>('combined');

  // Derive weighted arbitrage spread % and baseline metrics directly from sovereign state
  const livePortfolioMetrics = useMemo(() => {
    const totalPkr = Math.max(1, state.totals.activeDealsPkr);
    const weightedSpreadPct =
      state.deals.reduce((acc, deal) => {
        const margin = Math.max(deal.ujrahMarginPct, deal.mudarabahEquitySharePct, 4.5);
        return acc + margin * deal.dealValuePkr;
      }, 0) / totalPkr;

    const currentSpreadPct = Number(weightedSpreadPct.toFixed(2));
    const spreadPkrPerTon = Math.round(SAKRAND_BASE_TON_PKR * (currentSpreadPct / 100));

    return {
      currentSpreadPct,
      spreadPkrPerTon,
      goldGrams: state.totals.goldEquivalentGrams,
      dealCount: state.deals.length,
    };
  }, [state.deals, state.totals.activeDealsPkr, state.totals.goldEquivalentGrams]);

  // Seed historical compounding trajectory from existing deals & totals, then append live ticks
  const [series, setSeries] = useState<ChartPoint[]>(() => {
    const now = Date.now();
    const sortedDeals = [...state.deals].sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
    );
    const baseGold = Math.max(12, state.totals.goldEquivalentGrams * 0.42);
    const seedPoints: ChartPoint[] = [];

    // Build 10 historical compounding milestones leading into current sovereign state
    for (let i = 9; i >= 1; i--) {
      const progress = (10 - i) / 10;
      const dealForStep = sortedDeals[Math.min(sortedDeals.length - 1, Math.floor(progress * sortedDeals.length))];
      const baseSpread = dealForStep
        ? Math.max(dealForStep.ujrahMarginPct, dealForStep.mudarabahEquitySharePct, 6.2)
        : 6.5;
      const harmonicDrift = Math.sin(i * 1.15) * 0.45 + progress * 1.25;
      const spreadPct = Number(Math.max(4.0, baseSpread - 1.1 + harmonicDrift).toFixed(2));
      const goldGrams = Number(
        (baseGold + (state.totals.goldEquivalentGrams - baseGold) * Math.pow(progress, 1.35)).toFixed(2),
      );

      seedPoints.push({
        date: new Date(now - i * 3600_000),
        goldGrams,
        spreadPct,
        spreadPkrPerTon: Math.round(SAKRAND_BASE_TON_PKR * (spreadPct / 100)),
        label: dealForStep ? dealForStep.commodity.split('(')[0].trim() : 'Sakrand Ledger',
      });
    }

    seedPoints.push({
      date: new Date(now),
      goldGrams: state.totals.goldEquivalentGrams,
      spreadPct: livePortfolioMetrics.currentSpreadPct,
      spreadPkrPerTon: livePortfolioMetrics.spreadPkrPerTon,
      label: 'Live Sovereign State',
    });

    return seedPoints;
  });

  // Sync new point immediately whenever sovereign state mutates (new deal, mukasa, socket sync)
  useEffect(() => {
    setSeries((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.goldGrams === state.totals.goldEquivalentGrams &&
        last.spreadPct === livePortfolioMetrics.currentSpreadPct
      ) {
        return prev;
      }
      const next: ChartPoint = {
        date: new Date(),
        goldGrams: state.totals.goldEquivalentGrams,
        spreadPct: livePortfolioMetrics.currentSpreadPct,
        spreadPkrPerTon: livePortfolioMetrics.spreadPkrPerTon,
        label: `State Sync (${state.deals.length} Deals)`,
      };
      return [...prev.slice(-23), next];
    });
  }, [
    state.deals.length,
    state.totals.goldEquivalentGrams,
    livePortfolioMetrics.currentSpreadPct,
    livePortfolioMetrics.spreadPkrPerTon,
  ]);

  // Subtle live Sakrand-to-Gulf market spread & compounding stream when enabled
  useEffect(() => {
    if (!liveStreaming || state.killSwitch.active) return;
    const timer = window.setInterval(() => {
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const t = prev.length;
        const spreadDelta = Math.sin(t * 0.9) * 0.28 + Math.cos(t * 0.45) * 0.14;
        const nextSpread = Number(
          Math.max(4.5, Math.min(28, livePortfolioMetrics.currentSpreadPct + spreadDelta)).toFixed(2),
        );
        const nextGold = Number(
          (last.goldGrams + (state.totals.goldEquivalentGrams * 0.0018)).toFixed(2),
        );
        const nextPoint: ChartPoint = {
          date: new Date(),
          goldGrams: nextGold,
          spreadPct: nextSpread,
          spreadPkrPerTon: Math.round(SAKRAND_BASE_TON_PKR * (nextSpread / 100)),
          label: 'Sakrand–Riyadh Corridor Spread',
        };
        return [...prev.slice(-23), nextPoint];
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [
    liveStreaming,
    state.killSwitch.active,
    livePortfolioMetrics.currentSpreadPct,
    state.totals.goldEquivalentGrams,
  ]);

  // Responsive container measurement for D3 scales
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const updateWidth = () => {
      const next = Math.max(320, Math.floor(el.clientWidth));
      setChartWidth(next);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // D3 SVG rendering & interactive bisector crosshair
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || series.length < 2) return;

    const height = 260;
    const margin = { top: 20, right: 54, bottom: 32, left: 54 };
    const innerWidth = Math.max(120, chartWidth - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${chartWidth} ${height}`);

    const defs = svg.append('defs');

    const goldAreaGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-gold-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    goldAreaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.36);
    goldAreaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.02);

    const spreadAreaGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-spread-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    spreadAreaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#14B8A6').attr('stop-opacity', 0.28);
    spreadAreaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#14B8A6').attr('stop-opacity', 0.02);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(series, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    const goldMin = (d3.min(series, (d) => d.goldGrams) ?? 0) * 0.92;
    const goldMax = (d3.max(series, (d) => d.goldGrams) ?? 50) * 1.06;
    const yGoldScale = d3.scaleLinear().domain([goldMin, goldMax]).nice().range([innerHeight, 0]);

    const spreadMin = Math.max(0, (d3.min(series, (d) => d.spreadPct) ?? 4) - 2);
    const spreadMax = (d3.max(series, (d) => d.spreadPct) ?? 20) + 2.5;
    const ySpreadScale = d3.scaleLinear().domain([spreadMin, spreadMax]).nice().range([innerHeight, 0]);

    // Horizontal subtle Ajrak gold gridlines
    g.append('g')
      .attr('class', 'd3-grid')
      .call(
        d3
          .axisLeft(yGoldScale)
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

    // Bottom X Time Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(Math.min(6, Math.floor(innerWidth / 95)))
          .tickFormat((d) => d3.timeFormat('%H:%M')(d as Date)),
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

    // Left Y Axis: 24K Gold Compounding (g Au)
    if (viewMode === 'combined' || viewMode === 'gold') {
      g.append('g')
        .call(
          d3
            .axisLeft(yGoldScale)
            .ticks(4)
            .tickFormat((d) => `${Number(d).toFixed(1)}g`),
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
    }

    // Right Y Axis: Arbitrage Spread (%)
    if (viewMode === 'combined' || viewMode === 'spread') {
      g.append('g')
        .attr('transform', `translate(${innerWidth},0)`)
        .call(
          d3
            .axisRight(ySpreadScale)
            .ticks(4)
            .tickFormat((d) => `${Number(d).toFixed(1)}%`),
        )
        .call((axis) => {
          axis.select('.domain').attr('stroke', 'rgba(20,184,166,0.35)');
          axis.selectAll('line').attr('stroke', 'rgba(20,184,166,0.35)');
          axis
            .selectAll('text')
            .attr('fill', '#5EEAD4')
            .style('font-family', 'var(--font-mono)')
            .style('font-size', '10px');
        });
    }

    // Gold Compounding Area + Line
    if (viewMode === 'combined' || viewMode === 'gold') {
      const goldArea = d3
        .area<ChartPoint>()
        .x((d) => xScale(d.date))
        .y0(innerHeight)
        .y1((d) => yGoldScale(d.goldGrams))
        .curve(d3.curveMonotoneX);

      const goldLine = d3
        .line<ChartPoint>()
        .x((d) => xScale(d.date))
        .y((d) => yGoldScale(d.goldGrams))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(series).attr('fill', 'url(#d3-gold-area-grad)').attr('d', goldArea);
      g.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 2.4)
        .attr('d', goldLine);

      const lastPt = series[series.length - 1];
      g.append('circle')
        .attr('cx', xScale(lastPt.date))
        .attr('cy', yGoldScale(lastPt.goldGrams))
        .attr('r', 4.5)
        .attr('fill', '#F59E0B')
        .attr('stroke', '#05131B')
        .attr('stroke-width', 1.8);
    }

    // Arbitrage Spread Area + Line
    if (viewMode === 'combined' || viewMode === 'spread') {
      const spreadArea = d3
        .area<ChartPoint>()
        .x((d) => xScale(d.date))
        .y0(innerHeight)
        .y1((d) => ySpreadScale(d.spreadPct))
        .curve(d3.curveMonotoneX);

      const spreadLine = d3
        .line<ChartPoint>()
        .x((d) => xScale(d.date))
        .y((d) => ySpreadScale(d.spreadPct))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(series).attr('fill', 'url(#d3-spread-area-grad)').attr('d', spreadArea);
      g.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', '#5EEAD4')
        .attr('stroke-width', 2.2)
        .attr('d', spreadLine);

      const lastPt = series[series.length - 1];
      g.append('circle')
        .attr('cx', xScale(lastPt.date))
        .attr('cy', ySpreadScale(lastPt.spreadPct))
        .attr('r', 4.2)
        .attr('fill', '#5EEAD4')
        .attr('stroke', '#05131B')
        .attr('stroke-width', 1.8);
    }

    // Interactive Crosshair Guide & Bisector
    const focusGroup = g.append('g').style('display', 'none');
    focusGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#FDE68A')
      .attr('stroke-opacity', 0.45)
      .attr('stroke-dasharray', '3 3');

    const focusGoldDot = focusGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#F59E0B')
      .attr('stroke', '#05131B')
      .attr('stroke-width', 1.6);

    const focusSpreadDot = focusGroup
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#5EEAD4')
      .attr('stroke', '#05131B')
      .attr('stroke-width', 1.6);

    const bisectDate = d3.bisector<ChartPoint, Date>((d) => d.date).left;

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('pointerenter', () => focusGroup.style('display', 'inline'))
      .on('pointerleave', () => {
        focusGroup.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('pointermove', (event: PointerEvent) => {
        const [mx] = d3.pointer(event);
        const xDate = xScale.invert(mx);
        const idx = Math.min(series.length - 1, Math.max(0, bisectDate(series, xDate, 1)));
        const p0 = series[idx - 1];
        const p1 = series[idx];
        const pt =
          p0 && p1
            ? xDate.getTime() - p0.date.getTime() > p1.date.getTime() - xDate.getTime()
              ? p1
              : p0
            : series[idx];

        if (!pt) return;
        const px = xScale(pt.date);
        focusGroup.select('line').attr('x1', px).attr('x2', px);
        focusGoldDot
          .style('display', viewMode === 'spread' ? 'none' : 'inline')
          .attr('cx', px)
          .attr('cy', yGoldScale(pt.goldGrams));
        focusSpreadDot
          .style('display', viewMode === 'gold' ? 'none' : 'inline')
          .attr('cx', px)
          .attr('cy', ySpreadScale(pt.spreadPct));
        setHoveredPoint(pt);
      });
  }, [series, chartWidth, viewMode]);

  const activePoint = hoveredPoint ?? series[series.length - 1];

  return (
    <section className="kashi-card rounded-xl overflow-hidden border border-[#F59E0B]/35 ajrak-moving-glass">
      <ChromaticKashiRule />
      <div className="p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#5EEAD4] inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              D3.js Live Arbitrage Spread &amp; 24K Gold Compounding Telemetry
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F8F7F3]">
              Sakrand-to-Gulf Arbitrage Spread &amp; Gold Accumulation Curve
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'combined', label: 'Dual View' },
                { id: 'gold', label: '24K Gold (g)' },
                { id: 'spread', label: 'Spread (%)' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  viewMode === m.id
                    ? 'bg-[#F59E0B] text-[#05131B]'
                    : 'border border-[#F59E0B]/25 text-[#F8F7F3]/80 hover:border-[#F59E0B]'
                }`}
              >
                {m.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setLiveStreaming((s) => !s)}
              className="kashi-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#14B8A6]/40 bg-[#07262B]/80 text-xs font-semibold text-[#5EEAD4] whitespace-nowrap"
            >
              {liveStreaming && !state.killSwitch.active ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Live Feed
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> {state.killSwitch.active ? 'Frozen' : 'Paused'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Synchronized KPI Readout Strip (Reflects Hover Focus or Latest State) */}
        {activePoint && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#F59E0B]/25 ajrak-well px-4 py-3">
              <p className="text-[11px] text-[#F8F7F3]/65">
                24K Gold Compounded ({hoveredPoint ? 'Cursor' : 'Live'})
              </p>
              <p className="font-mono-tabular text-lg font-bold text-[#F59E0B]">
                {activePoint.goldGrams.toFixed(2)} g Au
              </p>
            </div>
            <div className="rounded-lg border border-[#14B8A6]/25 ajrak-well px-4 py-3">
              <p className="text-[11px] text-[#F8F7F3]/65">Weighted Arbitrage Spread</p>
              <p className="font-mono-tabular text-lg font-bold text-[#5EEAD4]">
                {activePoint.spreadPct.toFixed(2)}% (PKR {activePoint.spreadPkrPerTon.toLocaleString('en-US')}/ton)
              </p>
            </div>
            <div className="rounded-lg border border-[#F59E0B]/20 ajrak-well px-4 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] text-[#F8F7F3]/65">Corridor Milestone</p>
                <p className="text-xs font-semibold text-[#FDE68A] truncate">{activePoint.label}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#F59E0B] shrink-0" />
            </div>
          </div>
        )}

        {/* D3 Responsive SVG Canvas */}
        <div
          ref={containerRef}
          data-no-swipe="true"
          className="rounded-xl border border-[#F59E0B]/20 ajrak-well p-3 sm:p-4 select-none"
        >
          <svg
            ref={svgRef}
            className="w-full h-[260px] block overflow-visible"
            role="img"
            aria-label="D3 Live Arbitrage Spread and Gold Compounding Chart"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F59E0B]/15 text-[11px] text-[#F8F7F3]/70">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                24K Gold Compounding (Grams Au)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5EEAD4]" />
                Sakrand–Gulf Zero-Riba Spread (%)
              </span>
            </div>
            <span className="font-mono-tabular">
              Synced to {state.deals.length} Active Sovereign Deals • Hover/Drag to Inspect
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
