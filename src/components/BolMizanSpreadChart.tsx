import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Coins } from 'lucide-react';
import type { SovereignDeal } from '../types/sovereign';

interface BolMizanSpreadChartProps {
  deals: SovereignDeal[];
  goldEquivalentGrams: number;
}

export const BolMizanSpreadChart: React.FC<BolMizanSpreadChartProps> = ({
  deals,
  goldEquivalentGrams,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selected, setSelected] = useState<{
    title: string;
    marginPkr: number;
    sadaqahPkr: number;
    goldG: number;
  } | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    const rows = deals.map((d) => {
      const rate = Math.max(d.ujrahMarginPct, d.mudarabahEquitySharePct) / 100;
      const marginPkr = Math.round(d.dealValuePkr * rate);
      const sadaqahPkr = Math.round(marginPkr * (d.khufiyaSadaqahPct / 100));
      const goldG = Number(((d.dealValuePkr * 0.08 * 0.35) / 24_800).toFixed(2));
      return {
        label: d.title.split(' ').slice(0, 2).join(' '),
        fullTitle: d.title,
        marginK: Number((marginPkr / 1_000).toFixed(1)),
        sadaqahK: Number((sadaqahPkr / 1_000).toFixed(1)),
        marginPkr,
        sadaqahPkr,
        goldG,
      };
    });

    const width = Math.max(340, container.clientWidth);
    const height = 210;
    const margin = { top: 18, right: 20, bottom: 32, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(rows.map((r) => r.label))
      .range([0, innerW])
      .padding(0.38);

    const maxK = Math.max(100, d3.max(rows, (r) => r.marginK) ?? 500);
    const y = d3.scaleLinear().domain([0, maxK * 1.15]).range([innerH, 0]);

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat((v) => `${v}K`),
      )
      .call((axis) => axis.select('.domain').remove())
      .call((axis) =>
        axis
          .selectAll('.tick line')
          .attr('stroke', 'rgba(20, 184, 166, 0.14)')
          .attr('stroke-dasharray', '3 3'),
      )
      .call((axis) =>
        axis
          .selectAll('.tick text')
          .attr('fill', '#94A3B8')
          .attr('font-size', '10px')
          .attr('font-family', 'JetBrains Mono, monospace'),
      );

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.select('.domain').attr('stroke', 'rgba(245, 158, 11, 0.3)'))
      .call((axis) =>
        axis.selectAll('.tick text').attr('fill', '#FDE68A').attr('font-size', '10px'),
      );

    const barGroups = g
      .selectAll('.bar-group')
      .data(rows)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('mouseenter', (_e, d) =>
        setSelected({
          title: d.fullTitle,
          marginPkr: d.marginPkr,
          sadaqahPkr: d.sadaqahPkr,
          goldG: d.goldG,
        }),
      )
      .on('mouseleave', () => setSelected(null));

    // Halāl Margin / Equity Bar
    barGroups
      .append('rect')
      .attr('x', (d) => x(d.label) ?? 0)
      .attr('y', (d) => y(d.marginK))
      .attr('width', x.bandwidth() * 0.56)
      .attr('height', (d) => innerH - y(d.marginK))
      .attr('rx', 4)
      .attr('fill', '#14B8A6');

    // Khufiya Sadaqah Reserve Bar
    barGroups
      .append('rect')
      .attr('x', (d) => (x(d.label) ?? 0) + x.bandwidth() * 0.6)
      .attr('y', (d) => y(d.sadaqahK))
      .attr('width', x.bandwidth() * 0.4)
      .attr('height', (d) => innerH - y(d.sadaqahK))
      .attr('rx', 4)
      .attr('fill', '#F59E0B');
  }, [deals]);

  return (
    <section className="kashi-card rounded-xl border border-[#F59E0B]/30 ajrak-moving-glass p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[#5EEAD4]">
            D3.js Profit vs Khufiya Sadaqah Spread (Teal: Halal Margin · Gold: Sadaqah)
          </p>
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#F59E0B]" />
            <span>BolMizan Ujrah &amp; Sadaqah Allocation</span>
          </h3>
        </div>
        <span className="font-mono-tabular text-xs text-[#FDE68A]">
          {selected
            ? `${selected.title.slice(0, 22)}: Margin PKR ${selected.marginPkr.toLocaleString('en-US')} · Sadaqah PKR ${selected.sadaqahPkr.toLocaleString('en-US')}`
            : `${deals.length} Deals · ${goldEquivalentGrams}g 24K Au`}
        </span>
      </div>

      <div ref={containerRef} className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-[210px]" />
      </div>
    </section>
  );
};
