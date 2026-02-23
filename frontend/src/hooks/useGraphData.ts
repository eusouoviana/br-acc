import { useEffect, useRef, useState } from "react";

import { type GraphData, getGraphData } from "@/api/client";

const cache = new Map<string, GraphData>();

interface UseGraphDataResult {
  data: GraphData | null;
  loading: boolean;
  error: string | null;
}

export function useGraphData(
  entityId: string | undefined,
  depth: number,
): UseGraphDataResult {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!entityId) return;

    const key = `${entityId}:${depth}`;
    const cached = cache.get(key);
    if (cached) {
      setData(cached);
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    getGraphData(entityId, depth, undefined, controller.signal)
      .then((result) => {
        cache.set(key, result);
        setData(result);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [entityId, depth]);

  return { data, loading, error };
}
