import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";
import Openai from "openai";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

const openai = new Openai({
  apiKey: process.env.OPENAI_API_KEY,
});

const getVectorEmbedding = async (input) => {
  const {
    data: [{ embedding }],
  } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
    encoding_format: "float",
  });
  return embedding;
};

const getCosineSimilarity = (A, B) => {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;

  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = dotproduct / (mA * mB);

  return similarity;
};

const processEmebddings = async () => {
  const queries = JSON.parse(
    readFileSync(resolve(process.cwd(), "process/progress.json"), "utf-8")
  );

  const vectors = await Promise.all(
    queries.map(async (query) => {
      const vector = await getVectorEmbedding(query.prompt);
      return { ...query, vector };
    })
  );

  vectors.forEach(({ vector, isCache }, i) => {
    if (String(isCache) === "true") {
      return;
    }

    const cacheHitVector = vectors
      .slice()
      .map((v, i) => [v, i])
      .sort(([a], [b]) => {
        return (
          getCosineSimilarity(vector, b.vector) -
          getCosineSimilarity(vector, a.vector)
        );
      })
      .slice(1)
      .find(([v]) => v.isCache);

    if (!cacheHitVector) {
      throw new Error("No cacheHit vector found. That's not possible.");
    }

    const [v2, i2] = cacheHitVector;

    vectors[i].cacheHit = {
      index: i2,
      similarity: getCosineSimilarity(vector, v2.vector),
      vector: v2.vector,
    };
  });

  writeFileSync(
    resolve(process.cwd(), "process/progress.json"),
    JSON.stringify(vectors, null, 2)
  );

  console.log("Embeddings have been processed.");
};

const getCompletion = async (prompt) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are fitness expert and always respond with a short description of a routine to best help the user reach their goals. Your responses are extremely short and don't include details.",
      },
      { role: "user", content: prompt },
    ],
  });
  console.log(
    `Prompt: ${prompt} completed with: ${completion.choices[0]?.message?.content?.length}`
  );
  return completion.choices[0]?.message?.content;
};

// TODO: this just re-process but needs to handle taking the pre.json as an input
const processPrompts = async () => {
  const queries = JSON.parse(
    readFileSync(resolve(process.cwd(), "process/progress.json"), "utf-8")
  );

  for await (const query of queries) {
    if (query.completion) {
      continue;
    }
    const completion = await getCompletion(query.prompt);
    query.completion = completion;
  }

  writeFileSync(
    resolve(process.cwd(), "process/progress.json"),
    JSON.stringify(queries, null, 2)
  );

  console.log("Queries have been completed.");
};

const main = async () => {
  const doesCurrentExist = existsSync(
    resolve(process.cwd(), "process/progress.json"),
    "utf-8"
  );
  if (!doesCurrentExist) {
    writeFileSync(
      resolve(process.cwd(), "process/progress.json"),
      readFileSync(resolve(process.cwd(), "process/pre.json"), "utf-8")
    );
  }

  await processEmebddings();
  await processPrompts();

  unlinkSync(resolve(process.cwd(), "process/progress.json"));
};

main();
