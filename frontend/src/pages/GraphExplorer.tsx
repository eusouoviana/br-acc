import { useParams } from "react-router";

export function GraphExplorer() {
  const { entityId } = useParams<{ entityId: string }>();

  return (
    <div>
      <p style={{ color: "var(--text-secondary)" }}>
        Graph explorer for entity: <span style={{ color: "var(--accent)" }}>{entityId}</span>
      </p>
      {/* TODO: react-force-graph-2d integration */}
    </div>
  );
}
