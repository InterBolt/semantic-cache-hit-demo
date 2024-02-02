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
    <div className="flex flex-col w-full gap-4 p-4 bg-white rounded-md shadow sm:p-8">
      {children}
    </div>
  );
};

const SliderInput = ({
  denominator,
  name,
  value,
  range: [min, max],
  onChange,
}: {
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
        <span style={{ fontWeight: "bold" }}> currently {value}</span>
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
    <div className="flex flex-col justify-center items-center py-4 min-w-[4rem] w-[4rem] min-h-[4rem] h-[4rem] rounded-md  bg-gradient-to-r from-gray-800 to-gray-950">
      {shape === "dot" ? (
        <div
          className="m-auto"
          style={{
            width: "2rem",
            height: "2rem",
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
            width: "2rem",
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
      <main className="flex flex-col w-full gap-0 sm:gap-8">
        <div className="flex flex-col w-full gap-0 sm:gap-8">
          <section className="p-4 mt-0 bg-white rounded-none shadow-none sm:shadow-md sm:rounded-lg container-width sm:mt-8 sm:p-8">
            <CExplanation />
          </section>
          <section
            className="gap-4 p-4 bg-gray-300 rounded-none shadow-none sm:shadow-md sm:rounded-lg container-width sm:gap-8 sm:p-8"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="flex flex-col w-full gap-8">
              <div className="flex flex-col w-full gap-4">
                <h2>Legend:</h2>
                <PanelContainer>
                  <>
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
              <div className="flex flex-col w-full gap-4">
                <PanelContainer>
                  <>
                    <p>
                      Hover over the dots to see the prompt request and its
                      associated completion. And use the slider to change the
                      similarity threshold.
                    </p>
                    <div className="flex flex-col w-full">
                      <SliderInput
                        denominator={100}
                        name="similarity threshold"
                        value={similarityThreshold}
                        range={[0, 100]}
                        onChange={setSimilarityThreshold}
                      />
                    </div>
                  </>
                </PanelContainer>
              </div>
            </div>
          </section>
        </div>
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
      </main>
    </>
  );
}
