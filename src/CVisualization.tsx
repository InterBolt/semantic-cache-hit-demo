"use client";

import React, { MouseEventHandler } from "react";
import {
  ScatterChart,
  Tooltip,
  Scatter,
  YAxis,
  XAxis,
  ReferenceLine,
} from "recharts";
import { useWindowSize } from "usehooks-ts";
import * as algos from "./algos/index";
import { TProcessed } from "./types";
import styles from "./styles";
import untypedProcessed from "@/process/post.json";

type TChartQuery = {
  point: {
    x: number;
    y: number;
  };
  isCache: boolean;
  prompt: string;
  completion: string;
  cacheLink: number | null;
};

type TCacheHitLines<
  GQuery = { x: number; y: number },
  GCached = { x: number; y: number }
> = Array<[GQuery, GCached]>;

const processed =
  typeof untypedProcessed === "object"
    ? (untypedProcessed as TProcessed)
    : (JSON.parse(untypedProcessed as any) as TProcessed);

const convertVectorsToChartQuerys = async <GAlgo extends keyof typeof algos>(
  algo: GAlgo,
  processed: TProcessed,
  similarityThreshold: number,
  onLoading: (n: number) => void,
  isAsync: boolean
) => {
  const vals = await algos[algo](processed, onLoading, isAsync);
  return vals.map((point: { x: number; y: number }, i: number) => {
    const processedQuery = processed[i];
    const link = !processedQuery.cacheHit
      ? null
      : processedQuery.cacheHit.similarity > similarityThreshold
      ? processedQuery.cacheHit.index
      : null;
    return {
      point,
      isCache: processedQuery.isCache,
      prompt: processedQuery.prompt,
      completion: processedQuery.completion,
      cachedPrompt: link ? processed[link].prompt : null,
      cachedCompletion: link ? processed[link].completion : null,
      cacheLink: link,
    };
  });
};

const ticks = [...Array(2000).keys()].map((_, i) => -1 + i * 0.001);

const findCacheHitLines = (chartQueries: Array<TChartQuery>) => {
  const lines: TCacheHitLines = [];
  chartQueries.forEach((chartQuery, i) => {
    if (chartQuery.isCache) {
      return;
    }
    const cacheLink = chartQuery.cacheLink;
    if (typeof cacheLink === "number") {
      const linkedChartQuery = chartQueries[cacheLink];
      if (!linkedChartQuery.isCache) {
        return;
      }
      lines.push([chartQuery.point, linkedChartQuery.point]);
    }
  });
  return lines;
};

const TooltipContent = (props: any) => {
  const prompt = props.payload?.[0]?.payload?.prompt;
  const cacheLink = props.payload?.[0]?.payload?.cacheLink;
  const isCache = props.payload?.[0]?.payload?.isCache || false;
  const completion = props.payload?.[0]?.payload?.completion;

  const cachedCompletion = cacheLink
    ? props.payload?.[0]?.payload?.cachedCompletion
    : undefined;
  const cachedPrompt = cacheLink
    ? props.payload?.[0]?.payload?.cachedPrompt
    : undefined;

  return (
    <div
      id="tooltip-prompt-request"
      className="relative z-50 flex flex-col gap-4 max-w-full w-[90vw] sm:w-[700px] p-4 bg-white rounded-md shadow-md"
    >
      <div className="flex flex-col w-full">
        {isCache ? <h4>Request:</h4> : <h4>Request:</h4>}
        <p>{prompt}</p>
      </div>
      {cachedCompletion ? (
        <>
          <div className="flex flex-col w-full">
            <h4>Response:</h4>
            <p>{cachedCompletion}</p>
          </div>
          <div className="flex flex-col w-full">
            <h4>Semantically similar prompt request:</h4>
            <p>{cachedPrompt}</p>
          </div>
          <div className="flex flex-col w-full text-gray-600">
            <h4>Response if the cache didn't exist:</h4>
            <p>{completion}</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col w-full">
            {isCache ? <h4>Response:</h4> : <h4>Response:</h4>}
            <p>{completion}</p>
          </div>
        </>
      )}
    </div>
  );
};

const CVisualization = React.memo((props: { similarityThreshold: number }) => {
  const windowSize = useWindowSize();
  const { similarityThreshold } = props;

  const [progress, setProgress] = React.useState<number | null>(null);
  const [expands, setExpands] = React.useState<string[]>([]);
  const [cacheHitLines, setCacheHitLines] =
    React.useState<null | TCacheHitLines>([]);
  const [chartQueries, setChartQuerys] =
    React.useState<null | Array<TChartQuery>>(null);

  const handleSimilarityThresholdChange = async (n: number) => {
    const points = await convertVectorsToChartQuerys(
      "umap",
      processed,
      n,
      (epoch: number) => {
        setProgress(Number(((epoch / 500) * 100).toFixed(0)));
      },
      !chartQueries
    );
    setProgress(null);
    let nextPoints;
    if (!chartQueries) {
      nextPoints = points;
    } else {
      nextPoints = chartQueries.map((cp, i) => ({
        ...cp,
        cachedPrompt: points[i].cachedPrompt,
        cachedCompletion: points[i].cachedCompletion,
        cacheLink: points[i].cacheLink,
      }));
    }
    setChartQuerys(nextPoints);
    setCacheHitLines(findCacheHitLines(nextPoints));
  };

  React.useEffect(() => {
    handleSimilarityThresholdChange(similarityThreshold);
  }, [similarityThreshold]);

  const isMobile = windowSize?.width <= 700;

  return !!chartQueries ? (
    <ScatterChart
      height={700}
      width={windowSize?.width}
      margin={{
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <XAxis
        width={windowSize?.width}
        range={[-1, 1]}
        ticks={ticks}
        tickSize={0.001}
        allowDecimals={true}
        tickMargin={0}
        dataKey="x"
        type="number"
        name="query"
        hide={true}
      />
      <YAxis
        width={windowSize?.width}
        range={[-1, 1]}
        ticks={ticks}
        tickSize={0.001}
        tickMargin={0}
        allowDecimals={true}
        dataKey="y"
        type="number"
        hide={true}
      />
      {(cacheHitLines || []).map((segment, i) => (
        <ReferenceLine
          key={"cache-line-" + i}
          segment={segment}
          stroke={styles.colors.chartCacheHitLine}
          strokeWidth={1}
        />
      ))}
      <Tooltip
        active={expands.length > 0}
        position={{ x: 20, y: 20 }}
        content={(props) => (
          <TooltipContent
            onClose={(x: number, y: number) => {
              setExpands((prev) =>
                prev.filter(
                  (e: string) => e !== `${x.toFixed(2)}-${y.toFixed(2)}`
                )
              );
            }}
            {...props}
          />
        )}
      />
      <Scatter
        isAnimationActive={false}
        style={{
          backgroundColor: "gray",
          position: "relative",
          zIndex: 0,
        }}
        data={chartQueries.map((cp) => ({ ...cp.point, ...cp }))}
        fill="#ffffff"
        shape={(props: any) => {
          const { x, cy, cx, y, payload } = props;

          return (
            <g>
              <circle
                className="transition-all"
                r={expands.includes(`${x.toFixed(2)}-${y.toFixed(2)}`) ? 15 : 6}
                cx={cx}
                cy={cy}
                fill={
                  payload.isCache
                    ? styles.colors.chartCached
                    : styles.colors.chartQuery
                }
              />
              <circle
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpands((prev) =>
                    prev
                      .filter(
                        (e: string) => e !== `${x.toFixed(2)}-${y.toFixed(2)}`
                      )
                      .concat(`${x.toFixed(2)}-${y.toFixed(2)}`)
                  );
                }}
                onMouseOut={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpands((prev) =>
                    prev.filter(
                      (e: string) => e !== `${x.toFixed(2)}-${y.toFixed(2)}`
                    )
                  );
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpands((prev) =>
                    prev.filter(
                      (e: string) => e !== `${x.toFixed(2)}-${y.toFixed(2)}`
                    )
                  );
                }}
                r={windowSize?.width > 700 ? 6 : 10}
                cx={cx}
                cy={cy}
                fill={"transparent"}
              />
            </g>
          );
        }}
      />
    </ScatterChart>
  ) : (
    <>
      <div
        className="flex justify-center w-full px-8 py-12 text-lg font-bold text-center text-white"
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        <p>One sec. Computing semantic clusters using UMAP...</p>
      </div>
      <div
        style={{
          width: "100%",
          height:
            typeof progress === "number"
              ? `${400 * (progress / 100)}px`
              : "0px",
        }}
      >
        <div />
      </div>
    </>
  );
});

export default CVisualization;
