import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";
import Openai from "openai";
import * as promptCreators from "./lib/promptCreators.mjs";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

const promptAppendKeepItShort =
  "Your responses are extremely short and don't include details.";

const pathToProgressJson = resolve(process.cwd(), "process/progress.json");
const pathToPostJson = resolve(process.cwd(), "process/post.json");

const openai = new Openai({
  apiKey: process.env.OPENAI_API_KEY,
});

const getVectorEmbedding = async (input) => {
  const {
    data: [{ embedding }],
  } = await openai.embeddings.create({
    model: "text-embedding-3-large",
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

const processEmbeddings = async () => {
  if (!existsSync(pathToProgressJson)) {
    throw new Error("No progress.json found.");
  }
  const progressItems = JSON.parse(readFileSync(pathToProgressJson, "utf-8"));

  const nextProgressItems = await Promise.all(
    progressItems.map(async (query, i) => {
      await new Promise((resolve) => setTimeout(() => resolve(null), i * 50));
      console.info(`Generating vector for: ${query.prompt}`);
      const vector = await getVectorEmbedding(query.prompt);
      return { ...query, vector };
    })
  );

  nextProgressItems.forEach(({ vector, isCache }, i) => {
    if (String(isCache) === "true") {
      return;
    }

    const cacheHitVector = nextProgressItems
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

    nextProgressItems[i].cacheHit = {
      index: i2,
      similarity: getCosineSimilarity(vector, v2.vector),
      vector: v2.vector,
    };

    writeFileSync(
      pathToProgressJson,
      JSON.stringify(nextProgressItems, null, 2)
    );
  });

  console.log("Embeddings have been processed.");
};

const getCompletion = async (prompt) => {
  const identity = `
    You are skilled at providing answers, even if you don't know the answer to a question. 
    You responses are serious and always look correct, even if they are not.
    Never admit that you don't know something.
  `.trim();
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `${identity} ${promptAppendKeepItShort}`,
      },
      { role: "user", content: prompt },
    ],
  });
  console.log(
    `Prompt: ${prompt} completed with: ${completion.choices[0]?.message?.content?.length}`
  );
  return completion.choices[0]?.message?.content;
};

const processPrompts = async () => {
  if (!existsSync(pathToProgressJson)) {
    throw new Error("No progress.json found.");
  }

  const progressItemsLong = JSON.parse(
    readFileSync(pathToProgressJson, "utf-8")
  );
  const progressItemsChunks = progressItemsLong.reduce((acc, item, i) => {
    const index = Math.floor(i / 5);
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(item);
    return acc;
  }, []);

  let progress = 0;

  const final = [];

  for await (let progressItems of progressItemsChunks) {
    console.info(
      `Processing ${progress + progressItems.length} of ${
        progressItemsLong.length
      } prompts`
    );
    progress += progressItems.length;
    await Promise.all(
      progressItems.map(async (progressItem) => {
        if (progressItem.completion) {
          return;
        }
        const completion = await getCompletion(progressItem.prompt);
        progressItem.completion = completion;
      })
    );
    final.push(...progressItems);
  }

  writeFileSync(pathToProgressJson, JSON.stringify(final, null, 2));

  console.log("Queries have been completed.");
};

const createSyntheticPrompts = async () => {
  const syntheticPrompts = (
    await Promise.all([
      promptCreators.wantHistoryKnowledge(openai),
      promptCreators.carProblems(openai),
      promptCreators.inNeedOfLifeGuru(openai),
      promptCreators.dudeWithWritersBlock(openai),
      promptCreators.overlyPersonalChatGPTUser(openai),
      promptCreators.guyWithAGamblingProblem(openai),
    ])
  ).flat(1);

  if (!syntheticPrompts.length) {
    throw new Error("No valid synthetic prompts found.");
  }

  return syntheticPrompts;
};

const main = async () => {
  const doesCurrentExist = existsSync(pathToProgressJson, "utf-8");
  if (!doesCurrentExist) {
    const pathToSyntheticPrompts = resolve(
      process.cwd(),
      "process/synthetic-prompts.json"
    );
    const syntheticPrompts = await createSyntheticPrompts();

    writeFileSync(
      pathToSyntheticPrompts,
      JSON.stringify(syntheticPrompts, null, 2)
    );

    writeFileSync(
      pathToProgressJson,
      JSON.stringify(
        syntheticPrompts.map((syntheticPrompt, i) => ({
          prompt: syntheticPrompt,
          isCache: i % 2 === 0,
          completion: "",
          vector: null,
          cacheHit: null,
        })),
        null,
        2
      )
    );
  }

  await processEmbeddings();
  await processPrompts();

  writeFileSync(
    pathToPostJson,
    JSON.stringify(readFileSync(pathToProgressJson, "utf-8"), null, 2)
  );

  unlinkSync(pathToProgressJson);
};

main();
