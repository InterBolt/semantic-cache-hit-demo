import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";
import Openai from "openai";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

const tones = ["happy", "sad", "angry", "fearful", "surprised", "neutral"];
const getRandomTone = () => tones[Math.floor(Math.random() * tones.length)];

const promptAppendKeepItShort =
  "Your responses are extremely short and don't include details.";

const pathToProgressJson = resolve(process.cwd(), "process/progress.json");
const pathToPostJson = resolve(process.cwd(), "process/post.json");

const openai = new Openai({
  apiKey: process.env.OPENAI_API_KEY,
});

const requesterFarmer = async () => {
  const identity = `You are a scottish farmer who knows nothing about fitness.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `${identity} Your responses are serious. ${promptAppendKeepItShort}`,
      },
      {
        role: "user",
        content: `
          Respond as if you are asking for a new fitness routine that involves your farm animals.
          Your tone is ${getRandomTone()}.
        `.trim(),
      },
    ],
  });
  return completion.choices[0]?.message?.content;
};

const requesterOldCatLady = async () => {
  const identity = `You are an old cat lady who lives in a small town in the midwest.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `${identity} Your responses are serious. ${promptAppendKeepItShort}`,
      },
      {
        role: "user",
        content: `
          Respond as if you are asking for a new fitness routine that involves your cats.
          Your tone is ${getRandomTone()}.
        `.trim(),
      },
    ],
  });
  return completion.choices[0]?.message?.content;
};

const requesterUnderwaterRobotMan = async () => {
  const identity = `You are a robot who lives underwater.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `${identity} Your responses are serious. ${promptAppendKeepItShort}`,
      },
      {
        role: "user",
        content: `
          Respond as if you are asking for a new fitness routine that involves your underwater lifestyle.
          Your tone is ${getRandomTone()}.
        `.trim(),
      },
    ],
  });
  return completion.choices[0]?.message?.content;
};

const requesterFitnessExpert = async () => {
  const identity = `You are a fitness expert with preference for cardio exercies.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `${identity} Your responses are serious. ${promptAppendKeepItShort}`,
      },
      {
        role: "user",
        content: `
          Respond as if you are asking for a new fitness routine that involves your expertise.
          Your tone is ${getRandomTone()}.
        `.trim(),
      },
    ],
  });
  return completion.choices[0]?.message?.content;
};

const requesterSamurai = async () => {
  const identity = `You are a samurai who is always ready for battle.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `${identity} Your responses are serious. ${promptAppendKeepItShort}`,
      },
      {
        role: "user",
        content: `
          Respond as if you are asking for a new fitness routine that involves your samurai lifestyle.
          Your tone is ${getRandomTone()}.
        `.trim(),
      },
    ],
  });
  return completion.choices[0]?.message?.content;
};

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

const getCompletion = async (prompt) => {
  const identity = `You are fitness expert with a serious informative tone. You specialize in creating creative fitness routines tailored to the user's preferences.`;
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
  const r1 = await Promise.all([
    requesterSamurai(),
    requesterFitnessExpert(),
    requesterUnderwaterRobotMan(),
    requesterOldCatLady(),
    requesterFarmer(),
  ]);
  const r2 = await Promise.all([
    requesterSamurai(),
    requesterFitnessExpert(),
    requesterUnderwaterRobotMan(),
    requesterOldCatLady(),
    requesterFarmer(),
  ]);
  const r3 = await Promise.all([
    requesterSamurai(),
    requesterFitnessExpert(),
    requesterUnderwaterRobotMan(),
    requesterOldCatLady(),
    requesterFarmer(),
  ]);
  const r4 = await Promise.all([
    requesterSamurai(),
    requesterFitnessExpert(),
    requesterUnderwaterRobotMan(),
    requesterOldCatLady(),
    requesterFarmer(),
  ]);
  const r5 = await Promise.all([
    requesterSamurai(),
    requesterFitnessExpert(),
    requesterUnderwaterRobotMan(),
    requesterOldCatLady(),
    requesterFarmer(),
  ]);
  const r6 = await Promise.all([
    requesterSamurai(),
    requesterFitnessExpert(),
    requesterUnderwaterRobotMan(),
    requesterOldCatLady(),
    requesterFarmer(),
  ]);
  const syntheticPrompts = [...r1, ...r2, ...r3, ...r4, ...r5, ...r6];
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
