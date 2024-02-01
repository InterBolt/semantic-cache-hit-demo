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
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      margin: 0,
    }}
  >
    <div
      className="flex items-center justify-center p-8 rounded-md bg-gradient-to-r from-gray-800 to-gray-950"
      style={{
        marginRight: ".5rem",
      }}
    >
      {shape === "dot" ? (
        <div
          style={{
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "50%",
            backgroundColor: color,
          }}
        >
          <div />
        </div>
      ) : (
        <div
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
    {description}
  </div>
);

export default function CScreen() {
  const windowSize = useWindowSize();
  const [similarityThreshold, setSimilarityThreshold] = React.useState(0.2);
  const debouncedSimilarityThreshold = useDebounce(similarityThreshold, 100);

  return (
    <>
      <section className="bg-white shadow container-width">
        <CExplanation />
      </section>
      <section
        className="bg-gray-300 container-width"
        style={{
          width: "100%",
          display: "flex",
          gap: "1.5rem",
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
          <div
            style={{
              marginBottom: ".3rem",
            }}
          >
            <strong>Legend:</strong>
          </div>
          <LegendLabel
            shape="dot"
            name="Blue dot"
            description="a new query"
            color={styles.colors.chartQuery}
          />
          <LegendLabel
            shape="dot"
            name="White dot"
            description="a cached query"
            color={styles.colors.chartCached}
          />
          <LegendLabel
            name="Green line"
            shape="line"
            description="indicates that the new query (blue dot) will result in a cache hit where the cache hit is the white dot."
            color={styles.colors.chartCacheHitLine}
          />
          <p
            style={{
              margin: 0,
              marginTop: "1rem",
            }}
          >
            <strong>Usage notes:</strong>
          </p>
          <p
            style={{
              margin: 0,
            }}
          >
            You can hover over the dots to see the query prompt and its
            associated completion. Every query in the visualization was
            generated using GPT-4.
          </p>
        </div>
        <div
          style={{
            width: "100%",
          }}
        >
          <label
            style={{
              display: "inline-flex",
              width: "100%",
              marginBottom: ".8rem",
            }}
          >
            Change similarity threshold -
            <span style={{ fontWeight: "bold", marginLeft: ".5rem" }}>
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
      </section>
      <section
        className="-ml-4 mobile-border-radius sm:-ml-0"
        style={{
          position: "relative",
          width: windowSize?.width || "100%",
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
    </>
  );
}
