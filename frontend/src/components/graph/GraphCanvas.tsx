import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from "react-force-graph-2d";
import { useTranslation } from "react-i18next";

import type { GraphData } from "@/api/client";
import { relationshipColors } from "@/styles/tokens";

import { ContextMenu } from "./ContextMenu";
import { EdgeDetail } from "./EdgeDetail";
import { NODE_COLORS } from "./graphConstants";
import { GraphLegend } from "./GraphLegend";
import { GraphMinimap } from "./GraphMinimap";
import { GraphToolbar } from "./GraphToolbar";
import { NodeTooltip } from "./NodeTooltip";
import { renderNode, getNodeSize } from "./nodeRendering";
import { ZoomControls } from "./ZoomControls";
import styles from "./GraphCanvas.module.css";

interface GraphCanvasProps {
  data: GraphData;
  centerId: string;
  enabledTypes: Set<string>;
  enabledRelTypes: Set<string>;
  hiddenNodeIds: Set<string>;
  selectedNodeIds: Set<string>;
  hoveredNodeId: string | null;
  layoutMode: "force" | "hierarchy";
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  onNodeRightClick: (x: number, y: number, nodeId: string) => void;
  onLayoutChange: (mode: "force" | "hierarchy") => void;
  onFullscreen: () => void;
  sidebarCollapsed: boolean;
}

interface GraphNodeObject extends NodeObject {
  id: string;
  label: string;
  type: string;
  connectionCount?: number;
  document_id?: string | null;
}

interface GraphLinkObject extends LinkObject {
  type: string;
  confidence?: number;
  value?: number;
  properties: Record<string, unknown>;
}

function GraphCanvasInner({
  data,
  centerId,
  enabledTypes,
  enabledRelTypes,
  hiddenNodeIds,
  selectedNodeIds,
  hoveredNodeId,
  layoutMode,
  onNodeClick,
  onNodeHover,
  onNodeRightClick,
  onLayoutChange,
  onFullscreen,
  sidebarCollapsed,
}: GraphCanvasProps) {
  const { t } = useTranslation();
  const fgRef = useRef<ForceGraphMethods<GraphNodeObject, GraphLinkObject> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedEdge, setSelectedEdge] = useState<GraphLinkObject | null>(null);
  const [, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const zoomRef = useRef(1);

  // Track container dimensions via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ node: GraphNodeObject; x: number; y: number } | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter nodes by type + hidden
  const filteredNodes = useMemo(
    () => data.nodes.filter((n) => enabledTypes.has(n.type) && !hiddenNodeIds.has(n.id)),
    [data.nodes, enabledTypes, hiddenNodeIds],
  );

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes],
  );

  // Filter edges by node visibility + rel type
  const filteredEdges = useMemo(
    () =>
      data.edges.filter(
        (e) =>
          filteredNodeIds.has(e.source) &&
          filteredNodeIds.has(e.target) &&
          enabledRelTypes.has(e.type),
      ),
    [data.edges, filteredNodeIds, enabledRelTypes],
  );

  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const edge of filteredEdges) {
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
    }
    return counts;
  }, [filteredEdges]);

  const graphData = useMemo(
    () => ({
      nodes: filteredNodes.map((n) => ({
        ...n,
        connectionCount: connectionCounts.get(n.id) ?? 0,
      })),
      links: filteredEdges.map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
        confidence: e.confidence,
        value: (e.properties as Record<string, unknown>)?.value as number | undefined,
        properties: e.properties,
      })),
    }),
    [filteredNodes, filteredEdges, connectionCounts],
  );

  // Configure d3 forces for better layout
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const charge = fg.d3Force("charge") as { strength?: (s: number) => void } | undefined;
    charge?.strength?.(-200);
    const link = fg.d3Force("link") as { distance?: (d: number | ((l: unknown) => number)) => void } | undefined;
    link?.distance?.(100);
    fg.d3ReheatSimulation();
  }, [graphData]);

  // Adjacency set for hover dimming
  const adjacentToHovered = useMemo(() => {
    if (!hoveredNodeId) return null;
    const adj = new Set<string>([hoveredNodeId]);
    for (const edge of filteredEdges) {
      if (edge.source === hoveredNodeId) adj.add(edge.target);
      if (edge.target === hoveredNodeId) adj.add(edge.source);
    }
    return adj;
  }, [hoveredNodeId, filteredEdges]);

  // Minimap nodes — x/y are added at runtime by ForceGraph2D layout engine
  const minimapNodes = useMemo(
    () =>
      (graphData.nodes as (typeof graphData.nodes[number] & { x?: number; y?: number })[])
        .filter((n): n is typeof n & { x: number; y: number } => n.x != null && n.y != null)
        .map((n) => ({ x: n.x, y: n.y, type: n.type })),
    [graphData.nodes],
  );

  const nodeColor = useCallback((node: GraphNodeObject) => {
    return NODE_COLORS[node.type as keyof typeof NODE_COLORS] ?? "#5a6b60";
  }, []);

  const nodeSize = useCallback(
    (node: GraphNodeObject) => {
      return getNodeSize(node.connectionCount ?? 0, node.id === centerId);
    },
    [centerId],
  );

  const linkColor = useCallback(
    (link: GraphLinkObject) => {
      if (adjacentToHovered) {
        const src = typeof link.source === "object" ? (link.source as GraphNodeObject).id : link.source;
        const tgt = typeof link.target === "object" ? (link.target as GraphNodeObject).id : link.target;
        if (!adjacentToHovered.has(src as string) && !adjacentToHovered.has(tgt as string)) {
          return "rgba(255, 255, 255, 0.03)";
        }
      }
      // Use relationship-type color with visible alpha
      const typeColor = relationshipColors[link.type];
      if (typeColor) {
        // Convert hex to rgba with 0.5 alpha
        const hex = typeColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, 0.5)`;
      }
      return "rgba(148, 163, 154, 0.3)";
    },
    [adjacentToHovered],
  );

  const linkWidth = useCallback((link: GraphLinkObject) => {
    const value = link.value ?? 0;
    const confidence = link.confidence ?? 1;
    const baseWidth = confidence >= 0.9 ? 2 : 1;
    return value > 0 ? baseWidth + Math.min(4, Math.log10(value + 1) * 0.6) : baseWidth;
  }, []);

  const linkLineDash = useCallback((link: GraphLinkObject) => {
    return (link.confidence ?? 1) < 0.9 ? [4, 2] : null;
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNodeObject) => {
      onNodeClick(node.id);
      setContextMenu(null);
    },
    [onNodeClick],
  );

  const handleNodeHover = useCallback(
    (node: GraphNodeObject | null) => {
      onNodeHover(node?.id ?? null);

      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);

      if (node && node.x != null && node.y != null) {
        tooltipTimer.current = setTimeout(() => {
          // Convert graph coords to screen coords
          const screen = fgRef.current?.graph2ScreenCoords(node.x!, node.y!);
          if (screen) {
            const rect = containerRef.current?.getBoundingClientRect();
            const ox = rect?.left ?? 0;
            const oy = rect?.top ?? 0;
            setTooltip({ node, x: screen.x - ox + 12, y: screen.y - oy - 8 });
          }
        }, 200);
      } else {
        setTooltip(null);
      }
    },
    [onNodeHover],
  );

  const handleNodeRightClick = useCallback(
    (node: GraphNodeObject, event: MouseEvent) => {
      event.preventDefault();
      onNodeRightClick(event.clientX, event.clientY, node.id);
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [onNodeRightClick],
  );

  const handleLinkClick = useCallback((link: GraphLinkObject) => {
    setSelectedEdge(link);
  }, []);

  const handleZoom = useCallback((transform: { k: number }) => {
    zoomRef.current = transform.k;
  }, []);

  const fittedRef = useRef(false);

  // Auto-fit once after initial layout
  useEffect(() => {
    fittedRef.current = false;
  }, [data]);

  const handleEngineStop = useCallback(() => {
    if (!fittedRef.current) {
      fittedRef.current = true;
      setTimeout(() => {
        fgRef.current?.zoomToFit(300, 50);
      }, 200);
    }
  }, []);

  const handleZoomIn = useCallback(() => fgRef.current?.zoom(zoomRef.current * 1.5, 300), []);
  const handleZoomOut = useCallback(() => fgRef.current?.zoom(zoomRef.current / 1.5, 300), []);
  const handleFitView = useCallback(() => fgRef.current?.zoomToFit(300, 40), []);
  const handleResetZoom = useCallback(() => fgRef.current?.zoom(1, 300), []);

  return (
    <div className={styles.canvas}>
      <GraphToolbar
        onSearch={setSearchQuery}
        layoutMode={layoutMode}
        onLayoutChange={onLayoutChange}
        onFullscreen={onFullscreen}
        onExportPng={() => {/* TODO: implement PNG export */}}
      />

      <div ref={containerRef} className={styles.graphContainer}>
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeColor={nodeColor}
          nodeVal={nodeSize}
          nodeLabel=""
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkLineDash={linkLineDash}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={0.85}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onNodeRightClick={handleNodeRightClick}
          onLinkClick={handleLinkClick}
          onZoom={handleZoom}
          backgroundColor="rgba(0,0,0,0)"
          linkDirectionalParticles={0}
          cooldownTicks={80}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={30}
          onEngineStop={handleEngineStop}
          dagMode={layoutMode === "hierarchy" ? "td" : undefined}
          nodeCanvasObjectMode={() => "replace" as const}
          nodeCanvasObject={(node: GraphNodeObject, ctx: CanvasRenderingContext2D) => {
            if (node.x == null || node.y == null) return;
            const isDimmed = adjacentToHovered !== null && !adjacentToHovered.has(node.id);
            renderNode(ctx, {
              x: node.x,
              y: node.y,
              type: node.type,
              label: node.label,
              connectionCount: node.connectionCount ?? 0,
              isCenter: node.id === centerId,
              isSelected: selectedNodeIds.has(node.id),
              isHovered: hoveredNodeId === node.id,
              isDimmed,
              isPep: false,
              zoom: zoomRef.current,
            });
          }}
        />

        <GraphLegend visible={sidebarCollapsed} />
        <GraphMinimap nodes={minimapNodes} />
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onResetZoom={handleResetZoom}
        />

        {tooltip && (
          <NodeTooltip
            node={{
              id: tooltip.node.id,
              label: tooltip.node.label,
              type: tooltip.node.type,
              connectionCount: tooltip.node.connectionCount ?? 0,
              document_id: tooltip.node.document_id ?? undefined,
            }}
            x={tooltip.x}
            y={tooltip.y}
          />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            nodeId={contextMenu.nodeId}
            onClose={() => setContextMenu(null)}
            actions={[
              { id: "expand", label: t("graph.expand"), handler: () => setContextMenu(null) },
              { id: "hide", label: t("graph.hide"), handler: () => { setContextMenu(null); } },
              { id: "detail", label: t("graph.viewDetail"), handler: () => { onNodeClick(contextMenu.nodeId); setContextMenu(null); } },
            ]}
          />
        )}
      </div>

      {selectedEdge && (
        <EdgeDetail edge={selectedEdge} onClose={() => setSelectedEdge(null)} />
      )}
    </div>
  );
}

export const GraphCanvas = memo(GraphCanvasInner);
