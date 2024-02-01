"use client";

import React from "react";
import { useDebounce, useWindowSize } from "usehooks-ts";
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
  <div className="flex items-center gap-2">
    <div className="flex flex-col justify-center items-center py-4 min-w-[4rem] w-[4rem] rounded-md  bg-gradient-to-r from-gray-800 to-gray-950">
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
  const [epsilon, setEpsilon] = React.useState<null | number>(10);
  const [perplexity, setPerplexity] = React.useState<null | number>(30);
  const [steps, setSteps] = React.useState<null | number>(500);

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
          <section className="p-6 mt-0 bg-white rounded-lg shadow-md container-width sm:mt-8 sm:p-8">
            <CExplanation />
          </section>
          <section
            className="gap-4 p-6 bg-gray-300 rounded-lg shadow-md container-width sm:gap-8 sm:p-8"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: "1rem",
                alignItems: "start",
                flexDirection: "column",
              }}
            >
              <h3
                style={{
                  marginBottom: ".3rem",
                }}
              >
                <strong>Legend:</strong>
              </h3>
              <LegendLabel
                shape="dot"
                name="Blue dot"
                description="a new user prompt"
                color={styles.colors.chartQuery}
              />
              <LegendLabel
                shape="dot"
                name="White dot"
                description="a cached user prompt"
                color={styles.colors.chartCached}
              />
              <LegendLabel
                name="Green line"
                shape="line"
                description="indicates that the new user prompt (blue dot) will result in a cache hit where the cache hit is the white dot."
                color={styles.colors.chartCacheHitLine}
              />
              <h3
                style={{
                  margin: 0,
                  marginTop: "1rem",
                }}
              >
                <strong>Usage notes:</strong>
              </h3>
              <p
                style={{
                  margin: 0,
                }}
              >
                Hover over the dots to see the user prompt and its associated
                completion. And use the slider to change the similarity
                threshold.
              </p>
              <h3
                style={{
                  margin: 0,
                  marginTop: "1rem",
                }}
              >
                <strong>Controls:</strong>
              </h3>
              <div className="flex flex-col w-full">
                <label
                  className="inline-flex flex-col gap-2 sm:flex-row"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    marginBottom: ".8rem",
                  }}
                >
                  Change similarity threshold -
                  <span style={{ fontWeight: "bold" }}>
                    {" "}
                    currently {debouncedSimilarityThreshold}
                  </span>
                </label>
                <input
                  style={{
                    width: "100%",
                    marginTop: 0,
                  }}
                  onChange={(e) =>
                    setSimilarityThreshold(
                      Number((parseFloat(e.target.value) / 100).toFixed(2))
                    )
                  }
                  value={similarityThreshold * 100}
                  type="range"
                  id="similarityThreshold"
                  name="Similarity Threshold"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex flex-col w-full">
                <label
                  className="inline-flex flex-col gap-2 sm:flex-row"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    marginBottom: ".8rem",
                  }}
                >
                  Adjust t-SNE parameters -{" "}
                  <a href="https://distill.pub/2016/misread-tsne/">
                    learn more
                  </a>
                </label>
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-col w-full gap-1">
                    <label className="">
                      Perplexity (0-100) - <strong>currently 30</strong>
                    </label>
                    {perplexityError ? (
                      <label className="font-semibold text-red-400">
                        {perplexityError}
                      </label>
                    ) : null}
                    <input
                      {...(perplexity ? { value: perplexity } : {})}
                      onChange={(e) => {
                        if (
                          Number(e.target.value) < 0 ||
                          Number(e.target.value) > 100
                        ) {
                          setPerplexity(null);
                          setPerplexityError("Must be between 0-100");
                        } else {
                          setPerplexity(
                            Number(Number(e.target.value).toFixed(0))
                          );
                          setPerplexityError("");
                        }
                      }}
                      style={{
                        borderColor: perplexityError
                          ? "red"
                          : "rgba(0, 0, 0, .2)",
                      }}
                      min={0}
                      max={100}
                      className="border-2 rounded-md"
                      name="perplexity"
                      type="number"
                    />
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <label className="">
                      Epsilon (1-20) - <strong>currently 10</strong>
                    </label>
                    {epsilonError ? (
                      <label className="font-semibold text-red-400">
                        {epsilonError}
                      </label>
                    ) : null}
                    <input
                      {...(epsilon ? { value: epsilon } : {})}
                      onChange={(e) => {
                        if (
                          Number(e.target.value) < 1 ||
                          Number(e.target.value) > 1000
                        ) {
                          setEpsilon(null);
                          setEpsilonError("Must be between 1-20");
                        } else {
                          setEpsilon(Number(Number(e.target.value).toFixed(0)));
                          setEpsilonError("");
                        }
                      }}
                      style={{
                        borderColor: epsilonError ? "red" : "rgba(0, 0, 0, .2)",
                      }}
                      min={1}
                      max={20}
                      className="border-2 rounded-md"
                      name="epsilon"
                      type="number"
                    />
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <label className="">
                      Steps (1 - 1000) - <strong>currently 500</strong>
                    </label>
                    {stepError ? (
                      <label className="font-semibold text-red-400">
                        {stepError}
                      </label>
                    ) : null}
                    <input
                      {...(steps ? { value: steps } : {})}
                      onChange={(e) => {
                        if (
                          Number(e.target.value) < 1 ||
                          Number(e.target.value) > 1000
                        ) {
                          setSteps(null);
                          setStepError("Must be between 1-1000");
                        } else {
                          setSteps(Number(Number(e.target.value).toFixed(0)));
                          setStepError("");
                        }
                      }}
                      style={{
                        borderColor: stepError ? "red" : "rgba(0, 0, 0, .2)",
                      }}
                      className="border-2 rounded-md"
                      name="steps"
                      min={1}
                      max={1000}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section
          className="mobile-border-radius"
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
              epsilon={debouncedEpsilon || 10}
              perplexity={debouncedPerplexity || 30}
              steps={debouncedSteps || 500}
              similarityThreshold={debouncedSimilarityThreshold}
            />
          )}
        </section>
      </main>
    </>
  );
}
