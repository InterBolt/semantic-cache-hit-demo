import { TProcessed } from "../../types.js";
import { UMAP } from "umap-js";

export default function umap(
  processed: TProcessed
): Array<{ x: number; y: number }> {
  const umap = new UMAP({
    nNeighbors: 5,
    minDist: 1,
  });
  const embedding = umap.fit(processed.map((v) => v.vector));

  return embedding.map(([x, y]: any) => ({ x, y }));
}
