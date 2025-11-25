'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Paper } from '@/lib/types';

interface BubbleChartProps {
  papers: Paper[];
  clusters: { id: number; name: string; color: string }[];
  onPaperClick?: (paper: Paper) => void;
  width?: number;
  height?: number;
}

export default function BubbleChart({
  papers,
  clusters,
  onPaperClick,
  width,
  height,
}: BubbleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; paper: Paper | null }>({
    x: 0,
    y: 0,
    paper: null,
  });
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: width ?? 0,
    height: height ?? 0,
  });

  const clusterColorScale = useMemo(() => {
    return d3
      .scaleOrdinal<string>()
      .domain(clusters.map((c) => c.id.toString()))
      .range(clusters.map((c) => c.color));
  }, [clusters]);

  useEffect(() => {
    if (width && height) {
      setDimensions({ width, height });
      return;
    }

    if (typeof window === 'undefined' || !containerRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = entry.contentRect.width;
      const nextHeight = Math.max(320, nextWidth * 0.65);
      setDimensions((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current || papers.length === 0 || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = papers.map((paper) => ({
      ...paper,
      radius: Math.min(50, Math.sqrt(paper.citations + 25) * 1.5),
      x: Math.random() * chartWidth,
      y: Math.random() * chartHeight,
    }));

    const simulation = d3
      .forceSimulation(nodes as any)
      .force('x', d3.forceX(chartWidth / 2).strength(0.05))
      .force('y', d3.forceY(chartHeight / 2).strength(0.05))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 3))
      .force('charge', d3.forceManyBody().strength(-65))
      .force('cluster', (alpha: number) => {
        for (const node of nodes as any) {
          const clusterId = node.cluster_id;
          if (clusterId === null || clusterId === undefined) continue;
          const clusterNodes = nodes.filter((n: any) => n.cluster_id === clusterId);
          if (!clusterNodes.length) continue;
          const centerX = d3.mean(clusterNodes, (n: any) => n.x) || chartWidth / 2;
          const centerY = d3.mean(clusterNodes, (n: any) => n.y) || chartHeight / 2;
          const dx = (centerX - node.x) * alpha * 0.1;
          const dy = (centerY - node.y) * alpha * 0.1;
          node.vx = (node.vx || 0) + dx;
          node.vy = (node.vy || 0) + dy;
        }
      });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform.toString());
      });

    svg.call(zoom as any);

    const container = svg.append('g');

    const handlePointerMove = (event: any, d: any) => {
      const [pointerX, pointerY] = d3.pointer(event, svgRef.current);
      setTooltip({
        x: pointerX,
        y: pointerY,
        paper: d as Paper,
      });
    };

    const bubbles = container
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => {
        const clusterId = d.cluster_id;
        return clusterId !== null && clusterId !== undefined
          ? clusterColorScale(clusterId.toString())
          : '#94a3b8';
      })
      .attr('opacity', 0.75)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('pointermove', function (event, d: any) {
        d3.select(this).attr('opacity', 1).attr('stroke-width', 3);
        handlePointerMove(event, d);
      })
      .on('pointerleave', function () {
        d3.select(this).attr('opacity', 0.75).attr('stroke-width', 2);
        setTooltip({ x: 0, y: 0, paper: null });
      })
      .on('click', function (_, d: any) {
        if (onPaperClick) {
          onPaperClick(d as Paper);
        }
      });

    const labels = container
      .selectAll('text')
      .data(nodes.filter((d: any) => d.radius > 18))
      .enter()
      .append('text')
      .text((d: any) => (d.title.length > 22 ? `${d.title.substring(0, 22)}…` : d.title))
      .attr('font-size', (d: any) => Math.min(d.radius / 2.8, 14))
      .attr('fill', '#1f2937')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .style('font-weight', '500');

    simulation.on('tick', () => {
      bubbles.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      labels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y + 4);
    });

    return () => {
      simulation.stop();
    };
  }, [papers, clusters, onPaperClick, clusterColorScale, dimensions]);

  const tooltipPosition = useMemo(() => {
    if (!tooltip.paper || dimensions.width === 0 || dimensions.height === 0) {
      return { left: 0, top: 0 };
    }

    const padding = 16;
    const tooltipWidth = 250;
    const tooltipHeight = 120;

    const left = Math.min(
      Math.max(tooltip.x + padding, padding),
      dimensions.width - tooltipWidth - padding
    );
    const top = Math.min(
      Math.max(tooltip.y - tooltipHeight / 2, padding),
      dimensions.height - tooltipHeight - padding
    );

    return { left, top };
  }, [tooltip, dimensions]);

  const svgWidth = Math.max(1, dimensions.width);
  const svgHeight = Math.max(1, dimensions.height);
  const isReady = svgWidth > 1 && svgHeight > 1;

  return (
    <div ref={containerRef} className="relative w-full">
      {!isReady && (
        <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
          <p className="text-sm text-gray-500">Preparing visualization…</p>
        </div>
      )}
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="border border-gray-200 rounded-lg bg-white shadow-lg"
        style={{ display: isReady ? 'block' : 'none' }}
      />
      {tooltip.paper && (
        <div
          className="absolute z-50 max-w-xs rounded-lg bg-gray-900 p-3 text-white shadow-xl"
          style={{
            left: tooltipPosition.left,
            top: tooltipPosition.top,
          }}
        >
          <div className="mb-1 text-sm font-semibold">{tooltip.paper.title}</div>
          <div className="mb-1 text-xs text-gray-300">
            {tooltip.paper.authors.slice(0, 2).join(', ')}
            {tooltip.paper.authors.length > 2 && ' et al.'}
          </div>
          <div className="text-xs text-gray-400">
            {tooltip.paper.year} • {tooltip.paper.venue}
          </div>
          <div className="text-xs text-gray-400">{tooltip.paper.citations} citations</div>
        </div>
      )}
    </div>
  );
}

