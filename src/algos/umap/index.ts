import { TProcessed } from "../../types.js";
import { UMAP } from "umap-js";

export default async function umap(
  processed: TProcessed,
  onLoading: (progress: number) => void,
  isAsync: boolean
): Promise<Array<{ x: number; y: number }>> {
  const umap = new UMAP({
    nNeighbors: 5,
    minDist: 1,
  });
  if (isAsync) {
    const embedding = await umap.fitAsync(
      processed.map((v) => v.vector),
      onLoading
    );

    return embedding.map(([x, y]: any) => ({ x, y }));
  } else {
    const embedding = umap.fit(processed.map((v) => v.vector));
    return embedding.map(([x, y]: any) => ({ x, y }));
  }
}
