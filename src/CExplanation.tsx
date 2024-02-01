"use client";

import React from "react";

const CExplanation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full">
        <h1
          style={{
            lineHeight: "2.9rem",
          }}
        >
          An interactive cluster visualization of a semantic cache
        </h1>
        <p
          style={{
            marginTop: 0,
            fontWeight: "bold",
            color: "rgba(120, 0, 0, 0.7)",
          }}
        >
          Demo is at the bottom!
        </p>
      </div>
      <img
        style={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "20px",
          border: "1px solid gray",
        }}
        src="/images/visual-semantic-space.webp"
      />
      <p>
        Image credit goes to{" "}
        <a href="http://opentranscripts.org/transcript/semantic-space-literal-robots/">
          Allison Parish
        </a>
      </p>
      <p>
        <strong>How it works:</strong>
        {` `}In the section below with the dark background, white dots are
        cached queries, blue dots are new queries, and the green lines
        connecting the two represent a cache hit. As the similarity threshold
        goes up, expect fewer and fewer connecting lines between the blue and
        white dots, and when it goes down, expect more.
        <br />
        <br />
        <strong>
          Why the line lengths below can't be exactly proportional to
          similarities between the queries they connect:
        </strong>{" "}
        A line <i>only</i> indicates that the similarity between the two queries
        is greater than the similarity threshold. The distribution of the dots
        (or queries) are meant to visualize local clusters of semantically
        similar queries, but it's impossible to accurately represent the global
        structure of a higher dimensional space in a lower dimensional space. As
        a result, it's possible for longer lines to represent a higher
        similarity than shorter lines. For more info about the clustering algo,{" "}
        <a href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
          t-distributed stochastic neighbor embedding
        </a>
        , read{" "}
        <a href="https://distill.pub/2016/misread-tsne/">
          https://distill.pub/2016/misread-tsne/.
        </a>
        <br />
        <br />
        <strong>Additional background info:</strong>
        {` `}"Similarity" between each query refers to the{" "}
        <a href="https://en.wikipedia.org/wiki/Cosine_similarity">
          cosine similarity
        </a>{" "}
        between their{" "}
        <a href="https://platform.openai.com/docs/guides/embeddings">
          vector embeddings
        </a>
        . Cosine similarity is math trick to find the similarity between two
        high dimension numerical vector arrays. The{" "}
        <strong>similarity threshold</strong> slider adjusts the minimum
        semantic similarity to a previously cached key that is required to
        result in a cache hit. Lastly,{" "}
        <a href="https://platform.openai.com/docs/guides/embeddings">
          vector embeddings
        </a>{" "}
        are a way to represent some text's semantic structure as a numerical
        vector array. <br />
        <br />
        Credit to <a href="https://twitter.com/karpathy">karpathy</a>
        {` `}for <a href="https://github.com/karpathy/tsnejs">tsnejs</a>.
        <br />
        <br />
        <a href="https://interbolt.org/blog/semantic-cache-demo/">
          Read more about vector embeddings and how they're used in AI
        </a>
        <br />
        <br />
        <a href="https://twitter.com/interbolt_colin">Find me on Twitter</a>
      </p>
    </div>
  );
};

export default CExplanation;
