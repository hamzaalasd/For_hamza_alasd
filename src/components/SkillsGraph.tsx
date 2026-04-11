import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Skill } from '@/src/data/portfolio';

interface SkillsGraphProps {
  skills: Skill[];
  language: 'ar' | 'en';
}

export default function SkillsGraph({ skills, language }: SkillsGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = skills.map(s => ({ ...s }));
    const links: any[] = [];

    skills.forEach(s => {
      s.dependencies.forEach(depId => {
        const target = nodes.find(n => n.id === depId);
        if (target) {
          links.push({ source: s.id, target: depId });
        }
      });
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40)); // Prevent overlapping

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#2a2a2a')
      .attr('stroke-width', 1);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', d => 5 + (d.level / 10))
      .attr('fill', '#0a0a0a')
      .attr('stroke', '#00ff00')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.name)
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', '#e4e4e7')
      .attr('font-size', '12px')
      .attr('font-family', 'monospace')
      .style('pointer-events', 'none'); // Allow dragging even when clicking on text

    simulation.on('tick', () => {
      // Constrain nodes to stay within the svg boundaries
      node.attr('transform', (d: any) => {
        d.x = Math.max(30, Math.min(width - 120, d.x)); 
        d.y = Math.max(30, Math.min(height - 30, d.y));
        return `translate(${d.x},${d.y})`;
      });

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [skills, language]);

  return (
    <div className="w-full bg-system-card/30 border border-system-border rounded-lg overflow-hidden relative">
      <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-system-muted font-bold">
        {language === 'ar' ? 'خريطة الاعتمادية' : 'Dependency Graph'}
      </div>
      <svg ref={svgRef} className="w-full h-[500px]" />
    </div>
  );
}
