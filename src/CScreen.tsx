"use client";

import React from "react";
import { useDebounce } from "usehooks-ts";
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

const HyperParamNumericInput = ({
  name,
  onChange,
  onError,
  error,
  value,
  range: [min, max],
}: {
  name: string;
  onChange: (str: string) => void;
  onError: (error: string) => void;
  error: string;
  value: string;
  range: [number, number];
}) => {
  return (
    <>
      <label htmlFor={name} className="">
        {name[0].toUpperCase() + name.slice(1)} ({min}-{max}) -{" "}
        <strong>currently {value}</strong>
      </label>
      {error ? <p className="font-semibold text-red-400">{error}</p> : null}
      <input
        aria-label={name}
        value={value}
        id={name}
        onChange={(e) => {
          const nextNumber = Number(e.target.value);
          const isError = nextNumber < min || nextNumber > max;
          onError(isError ? "Must be between 0-100" : "");
          if (e.target.value === "") {
            onChange("");
          } else {
            onChange(nextNumber.toFixed(0));
          }
        }}
        style={{
          borderColor: error ? "red" : "rgba(0, 0, 0, .2)",
        }}
        min={min}
        max={max}
        className="border-2 rounded-md"
        name={name}
        type="number"
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
  const [epsilon, setEpsilon] = React.useState<string>("10");
  const [perplexity, setPerplexity] = React.useState<string>("5");
  const [steps, setSteps] = React.useState<string>("900");

  const [epsilonError, setEpsilonError] = React.useState("");
  const [perplexityError, setPerplexityError] = React.useState("");
  const [stepError, setStepError] = React.useState("");

  const [similarityThreshold, setSimilarityThreshold] = React.useState(0.2);

  const debouncedEpsilon = useDebounce(epsilon, 1000);
  const debouncedPerplexity = useDebounce(perplexity, 1000);
  const debouncedSteps = useDebounce(steps, 1000);
  const debouncedSimilarityThreshold = useDebounce(similarityThreshold, 100);

  const visualizationWillError =
    !!epsilonError || !!perplexityError || !!stepError;

  return (
    <>
      <main className="flex flex-col w-full gap-4 sm:gap-8">
        <div className="flex flex-col w-full gap-4 p-4 pb-0 sm:gap-8 sm:p-0">
          <section className="p-4 mt-0 bg-white rounded-lg shadow-md container-width sm:mt-8 sm:p-8">
            <CExplanation />
          </section>
          <section
            className="gap-4 p-4 bg-gray-300 rounded-lg shadow-md container-width sm:gap-8 sm:p-8"
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
                <h2>Usage notes:</h2>
                <PanelContainer>
                  <p>
                    Hover over the dots to see the prompt request and its
                    associated completion. And use the slider to change the
                    similarity threshold.
                  </p>
                </PanelContainer>
              </div>
              <div className="flex flex-col w-full gap-4">
                <h2>Customize the params:</h2>
                <div className="flex flex-col w-full gap-4">
                  <PanelContainer>
                    <>
                      <h3>
                        <a href="https://distill.pub/2016/misread-tsne/">
                          t-SNE clustering
                        </a>{" "}
                        parameters
                      </h3>
                      <div className="flex flex-col w-full gap-4">
                        <div className="flex flex-col w-full gap-1">
                          <HyperParamNumericInput
                            name="perplexity"
                            onChange={setPerplexity}
                            onError={setPerplexityError}
                            error={perplexityError}
                            value={perplexity}
                            range={[0, 100]}
                          />
                        </div>
                        <div className="flex flex-col w-full gap-1">
                          <HyperParamNumericInput
                            name="epsilon"
                            onChange={setEpsilon}
                            onError={setEpsilonError}
                            error={epsilonError}
                            value={epsilon}
                            range={[1, 20]}
                          />
                        </div>
                        <div className="flex flex-col w-full gap-1">
                          <HyperParamNumericInput
                            name="steps"
                            onChange={setSteps}
                            onError={setStepError}
                            error={stepError}
                            value={steps}
                            range={[100, 1000]}
                          />
                        </div>
                      </div>
                    </>
                  </PanelContainer>
                  <PanelContainer>
                    <>
                      <h3>Semantic cache parameters</h3>
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
          {visualizationWillError ? (
            <div className="py-4 h-[700px]"></div>
          ) : (
            <LazyCVisualization
              epsilon={Number(debouncedEpsilon || 10)}
              perplexity={Number(debouncedPerplexity || 30)}
              steps={Number(debouncedSteps || 500)}
              similarityThreshold={debouncedSimilarityThreshold}
            />
          )}
        </section>
      </main>
    </>
  );
}
