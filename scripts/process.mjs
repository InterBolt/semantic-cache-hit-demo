import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";
import Openai from "openai";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

const pathToProgressJson = resolve(process.cwd(), "process/progress.json");
const pathToPostJson = resolve(process.cwd(), "process/post.json");

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

const processEmbeddings = async () => {
  if (!existsSync(pathToProgressJson)) {
    throw new Error("No progress.json found.");
  }
  const progressItems = JSON.parse(readFileSync(pathToProgressJson, "utf-8"));

  const nextProgressItems = await Promise.all(
    progressItems.map(async (query) => {
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

const promptAppendKeepItShort =
  "Your responses are extremely short and don't include details.";

const getCompletion = async (prompt) => {
  const identity = `You are fitness expert with a sense of humor. You specialize in creating creative fitness routines that use a wide variety of skills, environments, and situations.`;
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

const getSemanticallyFlavoredPrompts = async (flavor) => {
  const semanticFlavors = {
    ocd: `
      You are obssessive and compulsive. 
      Details overwhelm you.
      You need to know the most important details about a fitness routine.
      You are a perfectionist and need to know the best way to do things.
      You get anxious when things are not perfect.
      You are a stickler for details.
      You have a great sense of humor.
      You are a perfectionist.
    `,
    paranoid: `
      You are paranoid
      You are constantly worried about the future.
      You are always looking over your shoulder.
      You are always on edge.
      You are always worried about the future.
      You are always worried about the government.
    `,
    outdoor_hippy: `
      You are a free spirit.
      You love yoga and meditation.
      You are a nature lover.
      You own lots of guinea pigs.
      You are a vegan.
      Your favorite color is green.
      You are a tree hugger.
      You are a hippy.
    `,
    introvert: `
      You are an introvert.
      You are shy.
      You are a homebody.
      You are a bookworm.
      You are a loner.
      You are a wallflower.
      You are a hermit.
    `,
    extrovert: `
      You are an extrovert.
      You are outgoing.
      You are a social butterfly.
      You are a party animal.
      You are a people person.
      You are a life of the party.
      You are a chatterbox.
    `,
  };
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `${semanticFlavors[flavor]} ${promptAppendKeepItShort}`,
      },
      {
        role: "user",
        content: `
          You have ten different imaginary friends, each one represents a different facet of your personality. 
          Each imaginary friend wants to start a new fitness routine. 
          Pretend to be each of your imaginary friends and request a fitness routine as if your were them. 
          Response in JSON likeso: { requests: Array<string> }
        `.trim(),
      },
    ],
  });
  return completion.choices[0]?.message?.content;
};

// TODO: this just re-process but needs to handle taking the pre.json as an input
const processPrompts = async () => {
  if (!existsSync(pathToProgressJson)) {
    throw new Error("No progress.json found.");
  }

  const progressItems = JSON.parse(readFileSync(pathToProgressJson, "utf-8"));

  for await (let progressItem of progressItems) {
    if (progressItem.completion) {
      continue;
    }
    const completion = await getCompletion(progressItem.prompt);
    progressItem.completion = completion;
    writeFileSync(pathToProgressJson, JSON.stringify(progressItems, null, 2));
  }

  console.log("Queries have been completed.");
};

const createSyntheticPrompts = async () => {
  // Get prompts for each flavor
  const flavors = [
    "ocd",
    "paranoid",
    "outdoor_hippy",
    "introvert",
    "extrovert",
  ];

  const responses = Promise.all(flavors.map(getSemanticallyFlavoredPrompts));
  const parsedResponses = (await responses).map((e) => JSON.parse(e));
  const syntheticPrompts = parsedResponses
    .map(({ requests }) => requests)
    .flat(1);
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
    console.log(syntheticPrompts);

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
