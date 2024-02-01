import initTSNE from "./lib.js";
import { TProcessed } from "../../types.js";

export default function tSNE(
  processed: TProcessed,
  options: {
    epsilon: number;
    perplexity: number;
    dim: number;
    steps: number;
  }
): Array<{ x: number; y: number }> {
  const { steps, ...tsneOptions } = options;
  const tSNE = initTSNE() as any;
  const tSNEInstance = new tSNE(tsneOptions);
  tSNEInstance.initDataDist(processed.map((v) => v.vector));
  for (let k = 0; k < steps; k++) {
    tSNEInstance.step();
  }
  return tSNEInstance.getSolution().map(([x, y]: any) => ({ x, y }));
}
