import initTSNE from "./lib.js";
import { TProcessed } from "../../types.js";

export default function tSNE(
  processed: TProcessed
): Array<{ x: number; y: number }> {
  const tSNE = initTSNE() as any;
  const tSNEInstance = new tSNE({
    perpexlity: 5,
    epsilon: 10,
  });
  tSNEInstance.initDataDist(processed.map((v) => v.vector));
  for (let k = 0; k < 2000; k++) {
    tSNEInstance.step();
  }
  return tSNEInstance.getSolution().map(([x, y]: any) => ({ x, y }));
}
