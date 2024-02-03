"use client";

import React from "react";
import { useDebounceValue } from "usehooks-ts";
import CExplanation from "./CExplanation";
import styles from "./styles";
import dynamic from "next/dynamic";

const LazyCVisualization = dynamic(() => import("@/src/CVisualization"), {
  loading: () => (
    <div className="w-full h-[700px]">
      <div />
    </div>
  ),
});

const PanelContainer = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex flex-col w-full gap-4 p-4 bg-white rounded-md shadow">
      {children}
    </div>
  );
};

const SliderInput = ({
  denominator,
  name,
  extra,
  value,
  range: [min, max],
  onChange,
}: {
  extra?: string;
  denominator: number;
  range: [number, number];
  value: number;
  name: string;
  onChange: (num: number) => void;
}) => {
  return (
    <>
      <label
        htmlFor={name}
        className="w-full"
        style={{
          width: "100%",
          marginBottom: ".8rem",
        }}
      >
        {name[0].toUpperCase() + name.slice(1)} -{" "}
        <span style={{ fontWeight: "bold" }}> currently {value}</span>{" "}
        {extra || ""}
      </label>
      <input
        className="w-full"
        onChange={(e) =>
          onChange(
            Number((parseFloat(e.target.value) / denominator).toFixed(2))
          )
        }
        value={value * denominator}
        type="range"
        id={name}
        name={name}
        min={min}
        max={max}
      />
    </>
  );
};

const LegendLabel = ({
  shape,
  description,
  color,
}: {
  shape: "dot" | "line";
  name: string;
  description: string;
  color: string;
}) => (
  <div className="flex items-center gap-4">
    <div className="flex flex-col justify-center items-center py-2 min-w-[2rem] w-[2rem] min-h-[2rem] h-[2rem] rounded-md  bg-gradient-to-r from-gray-800 to-gray-950">
      {shape === "dot" ? (
        <div
          className="m-auto"
          style={{
            width: "1rem",
            height: "1rem",
            borderRadius: "50%",
            backgroundColor: color,
          }}
        >
          <div />
        </div>
      ) : (
        <div
          className="m-auto"
          style={{
            width: "1rem",
            height: "3px",
            backgroundColor: color,
          }}
        >
          <div />
        </div>
      )}
    </div>{" "}
    <div className="flex">{description}</div>
  </div>
);

export default function CScreen() {
  const [similarityThreshold, setSimilarityThreshold] = React.useState(0.6);

  const [debouncedSimilarityThreshold] = useDebounceValue(
    similarityThreshold,
    200
  );

  return (
    <>
      <main className="flex flex-col w-full">
        <section className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-center w-full px-2 py-4 text-center">
            <h1>Semantic Cache Hits</h1>
            <p className="mt-2 text-lg text-gray-700">
              An interactive clustering visualization of a semantic cache.
            </p>
            <p className="mt-4 italic text-gray-700">
              <strong>Scroll below</strong> for the legend and an explanation of
              the visualization and <strong>hover/touch the dots</strong> for
              more info.
            </p>
          </div>
          <div className="flex justify-center w-full py-2 bg-gray-200 border-0 border-t border-gray-300 sm:py-4">
            <div className="w-full max-w-[600px] px-8 flex-col flex">
              <SliderInput
                denominator={100}
                name="similarity threshold"
                value={similarityThreshold}
                range={[0, 100]}
                onChange={setSimilarityThreshold}
              />
            </div>
          </div>
        </section>
        <section
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            overflow: "hidden",
            borderRadius: 0,
            flexDirection: "column",
            border: "none",
            alignItems: "center",
            background: `radial-gradient(circle, ${styles.colors.chartBackgroundFrom} 0%, ${styles.colors.chartBackgroundTo} 100%)`,
          }}
        >
          <LazyCVisualization
            similarityThreshold={debouncedSimilarityThreshold}
          />
        </section>
        <div className="flex flex-col w-full pb-0 mt-0 sm:pb-16 sm:mt-4">
          <section className="flex flex-col items-center justify-center w-full gap-4 p-4 mx-auto bg-gray-300 rounded-none shadow-none sm:shadow-md sm:rounded-lg container-width">
            <div className="flex flex-col w-full gap-4">
              <div className="flex flex-col w-full gap-4">
                <PanelContainer>
                  <>
                    <h2>Legend:</h2>
                    <LegendLabel
                      shape="dot"
                      name="Blue dot"
                      description="Represents a potential prompt request"
                      color={styles.colors.chartQuery}
                    />
                    <LegendLabel
                      shape="dot"
                      name="White dot"
                      description="Represents a cached prompt request"
                      color={styles.colors.chartCached}
                    />
                    <LegendLabel
                      name="Green line"
                      shape="line"
                      description="Connects a potential prompt to a cached prompt if the potential prompt is sufficiently semantically similar to the cached prompt. AKA a cache hit."
                      color={styles.colors.chartCacheHitLine}
                    />
                  </>
                </PanelContainer>
              </div>
            </div>
          </section>
          <section className="p-4 pb-16 mx-auto mt-0 bg-white rounded-none shadow-none sm:pb-0 sm:mt-4 sm:p-6 sm:shadow-md sm:rounded-lg container-width">
            <CExplanation />
          </section>
        </div>
      </main>
    </>
  );
}
