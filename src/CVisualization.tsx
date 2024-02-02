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
  link: number | null;
};

type TCacheHitLines<
  GQuery = { x: number; y: number },
  GCached = { x: number; y: number }
> = Array<[GQuery, GCached]>;

const processed =
  typeof untypedProcessed === "object"
    ? (untypedProcessed as TProcessed)
    : (JSON.parse(untypedProcessed as any) as TProcessed);

const convertVectorsToChartQuerys = <GAlgo extends keyof typeof algos>(
  algo: GAlgo,
  algoParams: Parameters<(typeof algos)[GAlgo]>[1],
  processed: TProcessed,
  similarityThreshold: number
) => {
  return algos[algo](processed, algoParams).map(
    (point: { x: number; y: number }, i: number) => {
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
        link: link,
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

const TooltipContent = (props: any) => {
  const prompt = props.payload?.[0]?.payload?.prompt;
  const link = props.payload?.[0]?.payload?.link;
  const isCache = props.payload?.[0]?.payload?.isCache || false;
  const completion = props.payload?.[0]?.payload?.completion;
  const cachedCompletion = link
    ? props.payload?.[0]?.payload?.cachedCompletion
    : undefined;
  const cachedPrompt = link
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

const CVisualization = React.memo(
  (props: {
    similarityThreshold: number;
    epsilon: number;
    perplexity: number;
    steps: number;
  }) => {
    const windowSize = useWindowSize();
    const { epsilon, steps, perplexity, similarityThreshold } = props;

    const [expands, setExpands] = React.useState<string[]>([]);
    const [cacheHitLines, setCacheHitLines] =
      React.useState<null | TCacheHitLines>([]);
    const [chartQueries, setChartQuerys] =
      React.useState<null | Array<TChartQuery>>(null);

    React.useEffect(() => {
      const points = convertVectorsToChartQuerys(
        "tsne",
        {
          epsilon,
          perplexity,
          dim: 2,
          steps,
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

    React.useEffect(() => {
      const points = convertVectorsToChartQuerys(
        "tsne",
        {
          epsilon,
          perplexity,
          dim: 2,
          steps,
        },
        processed,
        similarityThreshold
      );
      setChartQuerys(points);
      setCacheHitLines(findCacheHitLines(points));
    }, [epsilon, steps, perplexity]);

    const isMobile = windowSize?.width <= 700;

    return !!chartQueries ? (
      <ScatterChart
        height={isMobile ? windowSize?.height - 200 : windowSize?.height - 200}
        width={
          isMobile ? windowSize?.width : ((windowSize?.width || 0) * 2) / 3
        }
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
                  r={
                    expands.includes(`${x.toFixed(2)}-${y.toFixed(2)}`) ? 15 : 6
                  }
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
      <div
        style={{
          width: "100%",
          height: "800px",
        }}
      >
        <div />
      </div>
    );
  }
);

export default CVisualization;
