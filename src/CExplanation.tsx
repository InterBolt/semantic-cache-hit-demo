"use client";

import React from "react";

const CExplanation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col w-full">
          <h1>Semantic Cache Hits</h1>
          <p className="text-gray-700">
            An interactive clustering visualization of a semantic cache.
          </p>
        </div>
        <img
          alt="banner"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: ".5rem",
          }}
          src="/images/banner.webp"
        />
        <p>
          The visualizaton below uses a clustering algorithm called{" "}
          <a href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
            t-SNE
          </a>{" "}
          (
          <i>
            I might change this to{" "}
            <a href="https://pair-code.github.io/understanding-umap/">UMAP</a>
          </i>
          ) to visualize clusters of semantically similar prompt requests. Each
          prompt request is represented by a single dot and is meant to
          represent a hypothetical request to a generic AI. White dots denote
          prompt requests that were previously cached, and blue dots denote
          prompt requests that might occur in the future. The green line between
          a blue and white dot represents a cache hit where the new prompt
          request (blue dot) would use a cached response from a previous prompt
          request (white dot). A cache hit implies that the previously cached
          prompt request is semantically similar to the new prompt request.
        </p>
      </div>
      <p>
        <strong>What is a similarity threshold?</strong>
        {` `}A similarity threshold is a number between 0-1 that represents the
        minimum required similarity between a new prompt request and a cached
        prompt request to result in a cache hit. As the similarity threshold
        goes up, expect fewer connecting lines between the blue and white dots,
        and when it goes down, expect more.
        <br />
        <br />
        <strong>How is semantic similarity calculated?</strong>
        {` `}The "Similarity" between any two prompt requests refers to the{" "}
        <a href="https://en.wikipedia.org/wiki/Cosine_similarity">
          cosine similarity
        </a>{" "}
        of their generated{" "}
        <a href="https://platform.openai.com/docs/guides/embeddings">
          vector embeddings
        </a>
        . Vector embeddings encode semantic information within a high
        dimensional numerical vector array, and we can compare numerical vector
        arrays using cosine similarity.{" "}
        <a href="https://interbolt.org/blog/semantic-cache-demo/">
          I wrote about this
        </a>
        .{" "}
        <i>
          Vector embeddings for the prompt requests in the visualization were
          generated using one of OpenAI's latest embedding model,{" "}
          <a href="https://platform.openai.com/docs/guides/embeddings">
            text-embedding-3-large
          </a>
          .
        </i>
        <br />
        <br />
        <strong>Line length doesn't really mean anything.</strong>
        {` `}The distribution of individual dots (or prompt requests) is only
        meant to visualize <i>clusterings</i> of semantically similar prompt
        requests. But the exact distance between any two specific prompt
        requests in the visualization below is not a precise measurement of
        semantic similarity. It's impossible to accurately represent the global
        structure of a higher dimensional space in a 2D space. For more info
        about the clustering algo,{" "}
        <a href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
          t-distributed stochastic neighbor embedding
        </a>
        , read{" "}
        <a href="https://distill.pub/2016/misread-tsne/">
          https://distill.pub/2016/misread-tsne/.
        </a>
        <br />
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
