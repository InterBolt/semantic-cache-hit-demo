import React from "react";
import { createRoot } from "react-dom/client";
import initTSNE from "./algos/t-SNE.js";
import {
  ScatterChart,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  YAxis,
  XAxis,
  ZAxis,
} from "recharts";
import { useWindowSize } from "usehooks-ts";
import fakeVectors from "./data/fakeVectors.json";

const CosineSimilarityChart = (props: { vectors: Array<Array<number>> }) => {
  const windowSize = useWindowSize();

  const [chartPoints, setChartPoints] = React.useState<null | Array<{
    x: number;
    y: number;
  }>>(null);

  React.useEffect(() => {
    const tSNE = initTSNE() as any;
    const tSNEInstance = new tSNE({
      epsilon: 10,
      perplexity: 30,
      dim: 2,
    });
    tSNEInstance.initDataDist(props.vectors);
    for (let k = 0; k < 2000; k++) {
      tSNEInstance.step();
    }

    setChartPoints(tSNEInstance.getSolution().map(([x, y]: any) => ({ x, y })));
  }, [props.vectors]);

  if (!chartPoints) {
    return null;
  }
  return (
    <ScatterChart
      width={Math.min(windowSize.width, 400)}
      height={250}
      margin={{
        top: 20,
        right: 20,
        bottom: 10,
        left: 10,
      }}
    >
      <XAxis dataKey="x" type="number" hide={true} />
      <YAxis dataKey="y" type="number" hide={true} />
      <Scatter data={chartPoints} fill="#8884d8" />
    </ScatterChart>
  );
};

const testTSNE = () => {
  const opt: any = {};
  opt.epsilon = 10; // epsilon is learning rate (10 = default)
  opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
  opt.dim = 2; // dimensionality of the embedding (2 = default)

  const tSNE = initTSNE() as any;
  const tsne = new tSNE(opt); // create a tSNE instance

  // initialize data. Here we have 3 points and some example pairwise dissimilarities
  const dists = [
    [1.0, 0.1, 0.2],
    [0.1, 1.0, 0.3],
    [0.2, 0.1, 1.0],
  ];
  tsne.initDataDist(dists);

  for (let k = 0; k < 500; k++) {
    tsne.step(); // every time you call this, solution gets better
  }

  return tsne.getSolution().map(([x, y]: any) => ({ x, y }));
};

const App = () => {
  const plotData = React.useMemo(() => testTSNE(), []);
  const windowSize = useWindowSize();

  return (
    <>
      <h1
        style={{
          textAlign: "center",
        }}
      >
        Semantic Caching Demo
      </h1>
      <section
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "lightgray",
        }}
      >
        <h1>Controls</h1>
      </section>
      <section
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "lightgray",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
          }}
        >
          <CosineSimilarityChart vectors={fakeVectors} />
        </div>
      </section>
    </>
  );
};

window.onload = () => {
  const root = createRoot(document.getElementById("app"));
  root.render(<App />);
};
