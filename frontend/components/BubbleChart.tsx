'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  width = 1200,
  height = 800,
}: BubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; paper: Paper | null }>({
    x: 0,
    y: 0,
    paper: null,
  });

  useEffect(() => {
    if (!svgRef.current || papers.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create color scale for clusters
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(clusters.map((c) => c.id.toString()))
      .range(clusters.map((c) => c.color));

    // Prepare data for force simulation
    const nodes = papers.map((paper) => ({
      ...paper,
      radius: Math.sqrt(paper.citations + 10) * 2 + 5, // Size based on citations
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'x',
        d3.forceX(width / 2).strength(0.05)
      )
      .force(
        'y',
        d3.forceY(height / 2).strength(0.05)
      )
      .force(
        'collision',
        d3.forceCollide().radius((d: any) => d.radius + 2)
      )
      .force(
        'charge',
        d3.forceManyBody().strength(-50)
      )
      .force(
        'cluster',
        (alpha: number) => {
          // Attract nodes to their cluster centers
          for (const node of nodes as any) {
            const clusterId = node.cluster_id;
            if (clusterId !== null && clusterId !== undefined) {
              const clusterNodes = nodes.filter((n: any) => n.cluster_id === clusterId);
              if (clusterNodes.length > 0) {
                const centerX = d3.mean(clusterNodes, (n: any) => n.x) || width / 2;
                const centerY = d3.mean(clusterNodes, (n: any) => n.y) || height / 2;
                const dx = (centerX - node.x) * alpha * 0.1;
                const dy = (centerY - node.y) * alpha * 0.1;
                node.vx = (node.vx || 0) + dx;
                node.vy = (node.vy || 0) + dy;
              }
            }
          }
        }
      );

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform.toString());
      });

    svg.call(zoom as any);

    // Create container for zoomable content
    const container = svg.append('g');

    // Draw bubbles
    const bubbles = container
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => {
        const clusterId = d.cluster_id;
        return clusterId !== null && clusterId !== undefined
          ? colorScale(clusterId.toString())
          : '#94a3b8';
      })
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d: any) {
        d3.select(this).attr('opacity', 1).attr('stroke-width', 3);
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          paper: d as Paper,
        });
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.7).attr('stroke-width', 2);
        setTooltip({ x: 0, y: 0, paper: null });
      })
      .on('click', function (event, d: any) {
        if (onPaperClick) {
          onPaperClick(d as Paper);
        }
      });

    // Add labels for larger bubbles
    const labels = container
      .selectAll('text')
      .data(nodes.filter((d: any) => d.radius > 15))
      .enter()
      .append('text')
      .text((d: any) => {
        // Truncate title for display
        const title = d.title;
        return title.length > 20 ? title.substring(0, 20) + '...' : title;
      })
      .attr('font-size', (d: any) => Math.min(d.radius / 3, 12))
      .attr('fill', '#1f2937')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .style('font-weight', '500');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      bubbles.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      labels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y + 4);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [papers, clusters, width, height, onPaperClick]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg bg-white shadow-lg"
      />
      {tooltip.paper && (
        <div
          className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none max-w-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-semibold text-sm mb-1">{tooltip.paper.title}</div>
          <div className="text-xs text-gray-300 mb-1">
            {tooltip.paper.authors.slice(0, 2).join(', ')}
            {tooltip.paper.authors.length > 2 && ' et al.'}
          </div>
          <div className="text-xs text-gray-400">
            {tooltip.paper.year} • {tooltip.paper.venue} • {tooltip.paper.citations} citations
          </div>
        </div>
      )}
    </div>
  );
}

