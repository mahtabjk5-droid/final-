import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp } from 'lucide-react';
import type { SovereignDeal } from '../types/sovereign';

interface TreasurySpreadGoldChartProps {
  deals: SovereignDeal[];
  goldEquivalentGrams: number;
}

export const TreasurySpreadGoldChart: React.FC<TreasurySpreadGoldChartProps> = ({
  deals,
  goldEquivalentGrams,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ label: string; pkr: number; goldG: number } | null>(
    null,
  );

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    const points = deals.map((d, i) => ({
      idx: i + 1,
      label: d.title.split(' ').slice(0, 3).join(' '),
      pkrMillions: Number((d.dealValuePkr / 1_000_000).toFixed(2)),
      goldG: Number(((d.dealValuePkr * 0.08 * 0.35) / 24_800).toFixed(2)),
    }));

    const width = Math.max(360, container.clientWidth);
    const height = 210;
    const margin = { top: 18, right: 24, bottom: 30, left: 46 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', 'gold-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.45);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#14B8A6').attr('stop-opacity', 0.02);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint<string>()
      .domain(points.map((p) => p.label))
      .range([0, innerW])
      .padding(0.2);

    const maxPkr = Math.max(2, d3.max(points, (d) => d.pkrMillions) ?? 10);
    const y = d3.scaleLinear().domain([0, maxPkr * 1.15]).range([innerH, 0]);

    // Horizontal gridlines
    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat((v) => `${v}M`),
      )
      .call((axis) => axis.select('.domain').remove())
      .call((axis) =>
        axis
          .selectAll('.tick line')
          .attr('stroke', 'rgba(245, 158, 11, 0.14)')
          .attr('stroke-dasharray', '3 3'),
      )
      .call((axis) =>
        axis
          .selectAll('.tick text')
          .attr('fill', '#94A3B8')
          .attr('font-size', '10px')
          .attr('font-family', 'JetBrains Mono, monospace'),
      );

    // Bottom X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.select('.domain').attr('stroke', 'rgba(20, 184, 166, 0.3)'))
      .call((axis) =>
        axis
          .selectAll('.tick text')
          .attr('fill', '#5EEAD4')
          .attr('font-size', '10px'),
      );

    const area = d3
      .area<(typeof points)[number]>()
      .x((d) => x(d.label) ?? 0)
      .y0(innerH)
      .y1((d) => y(d.pkrMillions))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line<(typeof points)[number]>()
      .x((d) => x(d.label) ?? 0)
      .y((d) => y(d.pkrMillions))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(points).attr('fill', 'url(#gold-area-grad)').attr('d', area);
    g.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#F59E0B')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    g.selectAll('.dot')
      .data(points)
      .enter()
      .append('circle')
      .attr('cx', (d) => x(d.label) ?? 0)
      .attr('cy', (d) => y(d.pkrMillions))
      .attr('r', 5.5)
      .attr('fill', '#0D2327')
      .attr('stroke', '#FDE68A')
      .attr('stroke-width', 2.2)
      .style('cursor', 'pointer')
      .on('mouseenter', (_e, d) => {
        setHoverInfo({
          label: d.label,
          pkr: Math.round(d.pkrMillions * 1_000_000),
          goldG: d.goldG,
        });
      })
      .on('mouseleave', () => setHoverInfo(null));
  }, [deals]);

  return (
    <section className="kashi-card rounded-xl border border-[#F59E0B]/30 ajrak-moving-glass p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[#5EEAD4]">
            D3.js Interactive Sovereign Spread • PKR Liquidity vs 24K Gold Shield
          </p>
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
            <span>Hard-Asset Compounding Curve</span>
          </h3>
        </div>
        <div className="font-mono-tabular text-xs text-[#FDE68A]">
          {hoverInfo
            ? `${hoverInfo.label}: PKR ${hoverInfo.pkr.toLocaleString('en-US')} (${hoverInfo.goldG}g Au)`
            : `Total Hedge: ${goldEquivalentGrams}g 24K Au`}
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-[210px]" />
      </div>
    </section>
  );
};
