"use client";

import React from "react";

const CExplanation = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full gap-4">
        <h1
          style={{
            lineHeight: "2.9rem",
          }}
        >
          An interactive clustering visualization of a semantic cache
        </h1>
        <img
          style={{
            width: "100%",
            height: "auto",
            borderRadius: ".5rem",
          }}
          src="/images/banner.webp"
        />
        <p>
          The visualizaton below uses a pairwise clustering algorithm called{" "}
          <a href="https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding">
            t-SNE
          </a>{" "}
          (could also use something like{" "}
          <a href="https://pair-code.github.io/understanding-umap/">UMAP</a>) to
          visualize clusters of semantically similar user prompts. Each user
          prompt is represented by a single dot and is meant to represent a
          hypothetical request to an AI that specializes in generating fitness
          routines. White dots denote user prompts that were previously cached,
          and blue dots denote user prompts that might occur in the future. The
          line between a blue and white dot represents a cache hit where the new
          user prompt (blue dot) would use the response from a previously cached
          user prompt (white dot). A cache hit implies that the previously
          cached user prompt is semantically similar to the new user prompt.
        </p>
      </div>
      <p>
        <strong>What is a similarity threshold?</strong>
        {` `}A similarity threshold is a value between 0-1 which represents the
        minimum similarity between a new user prompt and a cached user prompt to
        result in a cache hit. As the similarity threshold goes up, expect fewer
        and fewer connecting lines between the blue and white dots, and when it
        goes down, expect more.
        <br />
        <br />
        <strong>How is semantic similarity calculated?</strong>
        {` `}"Similarity" between any two user prompts refers to the{" "}
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
        <a href="https://interbolt.org/blog/semantic-cache-demo/">Learn more</a>
        .{" "}
        <i>
          Vector embeddings for the user prompts in the visualization were
          generated using one of OpenAI's latest embedding model,{" "}
          <a href="https://platform.openai.com/docs/guides/embeddings">
            text-embedding-3-small
          </a>
          .
        </i>{" "}
        The <strong>similarity threshold</strong> slider adjusts the minimum
        semantic similarity to a previously cached key that is required to
        result in a cache hit.
        <br />
        <br />
        <strong>Line lengths are meaningless.</strong>
        {` `}The distribution of individual dots (or user prompts) is only meant
        to visualize <i>clusterings</i> of semantically similar user prompts.
        But the exact distance between any two specific user prompts is not a
        precise measurement of their semantic similarity. This is because it's
        impossible to accurately represent the global structure of a higher
        dimensional space in a 2D space. For more info about the clustering
        algo,{" "}
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
