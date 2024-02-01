export type TProcessed = Array<{
  isCache: boolean;
  prompt: string;
  completion: string;
  vector: Array<number>;
  cacheHit: {
    index: number;
    similarity: number;
    vector: Array<number>;
  } | null;
}>;
