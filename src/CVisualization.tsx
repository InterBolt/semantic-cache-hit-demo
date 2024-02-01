"use client";

import React from "react";
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
  link: number | null;
};

type TCacheHitLines<
  GQuery = { x: number; y: number },
  GCached = { x: number; y: number }
> = Array<[GQuery, GCached]>;

const processed = untypedProcessed as TProcessed;

const convertVectorsToChartQuerys = <GAlgo extends keyof typeof algos>(
  algo: GAlgo,
  algoParams: Parameters<(typeof algos)[GAlgo]>[1],
  processed: TProcessed,
  similarityThreshold: number
) => {
  return algos[algo](processed, algoParams).map(
    (point: { x: number; y: number }, i: number) => {
      const processedQuery = processed[i];
      return {
        point,
        isCache: processedQuery.isCache,
        prompt: processedQuery.prompt,
        completion: processedQuery.completion,
        link: !processedQuery.cacheHit
          ? null
          : processedQuery.cacheHit.similarity > similarityThreshold
          ? processedQuery.cacheHit.index
          : null,
      };
    }
  );
};

const ticks = [...Array(2000).keys()].map((_, i) => -1 + i * 0.001);

const findCacheHitLines = (chartQueries: Array<TChartQuery>) => {
  const lines: TCacheHitLines = [];
  chartQueries.forEach((chartQuery, i) => {
    if (chartQuery.isCache) {
      return;
    }
    const linkedPoint = chartQuery.link;
    if (typeof linkedPoint === "number") {
      const linkedChartQuery = chartQueries[linkedPoint];
      if (!linkedChartQuery.isCache) {
        return;
      }
      lines.push([chartQuery.point, linkedChartQuery.point]);
    }
  });
  return lines;
};

const CVisualization = React.memo((props: { similarityThreshold: number }) => {
  const windowSize = useWindowSize();
  const { similarityThreshold } = props;
  const [cacheHitLines, setCacheHitLines] =
    React.useState<null | TCacheHitLines>([]);
  const [chartQueries, setChartQuerys] =
    React.useState<null | Array<TChartQuery>>(null);

  React.useEffect(() => {
    const points = convertVectorsToChartQuerys(
      "tsne",
      {
        epsilon: 10,
        perplexity: 5,
        dim: 2,
      },
      processed,
      similarityThreshold
    );
    let nextPoints;
    if (!chartQueries) {
      nextPoints = points;
    } else {
      nextPoints = chartQueries.map((cp, i) => ({
        ...cp,
        link: points[i].link,
      }));
    }
    setChartQuerys(nextPoints);
    setCacheHitLines(findCacheHitLines(nextPoints));
  }, [similarityThreshold]);

  const isMobile = windowSize?.width <= 700;

  return !!chartQueries ? (
    <ScatterChart
      height={isMobile ? windowSize?.height - 200 : windowSize?.height - 200}
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
          strokeWidth={2}
        />
      ))}
      <Tooltip
        position={{ x: 20, y: 20 }}
        content={(v) => {
          const prompt = v.payload?.[0]?.payload?.prompt;
          const completion = v.payload?.[0]?.payload?.completion;
          return (
            <div
              style={{
                maxWidth: windowSize?.width - 80,
                padding: "1rem",
                backgroundColor: "white",
                borderRadius: ".5rem",
                boxShadow: "0 0 10px rgba(0,0,0,.5)",
              }}
            >
              <p>
                <strong>Prompt:</strong> {prompt}
              </p>
              <p>
                <strong>GPT-4 completion:</strong> {completion}
              </p>
            </div>
          );
        }}
      />

      <Scatter
        isAnimationActive={false}
        style={{
          backgroundColor: "gray",
        }}
        data={chartQueries.map((cp) => ({ ...cp.point, ...cp }))}
        fill="#ffffff"
        shape={(props: any) => {
          const { cx, cy, payload } = props;

          return (
            <g>
              <circle
                cx={cx}
                cy={cy}
                r={isMobile ? 6 : 5}
                fill={
                  payload.isCache
                    ? styles.colors.chartCached
                    : styles.colors.chartQuery
                }
              />
            </g>
          );
        }}
      />
    </ScatterChart>
  ) : (
    <div
      style={{
        width: "100%",
        height: "800px",
      }}
    >
      <div />
    </div>
  );
});

export default CVisualization;
