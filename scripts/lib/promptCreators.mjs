import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config({
  path: resolve(process.cwd(), ".env"),
});

export const carProblems = async (openai) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `You are a skilled impersonator who can mimic the tone of any person or character.`,
      },
      {
        role: "user",
        content: `
          Respond with a list 20 of common questions that someone might have about their car problems.
          10 questions you provide should be unique and not a variation of another question. 
          The other 10 questions should be variations of the first 10 questions.
          Respond in JSON format likeso: { questions: Array<string> }.
        `.trim(),
      },
    ],
  });
  const response = completion.choices[0]?.message?.content;
  const parsedQuestions = (() => {
    try {
      return JSON.parse(response)?.questions;
    } catch (err) {
      return null;
    }
  })();
  if (Array.isArray(parsedQuestions)) {
    return parsedQuestions;
  } else {
    console.warn(
      `Failed to get car problems questions. Got this instead: ${response}`
    );
    return [];
  }
};

export const inNeedOfLifeGuru = async (openai) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `You are a skilled impersonator who can mimic the tone of any person or character.`,
      },
      {
        role: "user",
        content: `
          Respond with a list 20 questions someone might ask a life guru, like Tony Robbins, for how to improve their life.
          10 questions you provide should be unique and not a variation of another question. 
          The other 10 questions should be variations of the first 10 questions.
          Respond in JSON format likeso: { questions: Array<string> }.
          Be creative.
        `.trim(),
      },
    ],
  });
  const response = completion.choices[0]?.message?.content;
  const parsedQuestions = (() => {
    try {
      return JSON.parse(response)?.questions;
    } catch (err) {
      return null;
    }
  })();
  if (Array.isArray(parsedQuestions)) {
    return parsedQuestions;
  } else {
    console.warn(
      `Failed to get car problems questions. Got this instead: ${response}`
    );
    return [];
  }
};

export const wantHistoryKnowledge = async (openai) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `You are a skilled impersonator who can mimic the tone of any person or character.`,
      },
      {
        role: "user",
        content: `
          Respond with a list 20 questions someone might ask an expert on West African History.
          10 questions you provide should be unique and not a variation of another question. 
          The other 10 questions should be variations of the first 10 questions.
          Respond in JSON format likeso: { questions: Array<string> }.
          Be creative.
        `.trim(),
      },
    ],
  });
  const response = completion.choices[0]?.message?.content;
  const parsedQuestions = (() => {
    try {
      return JSON.parse(response)?.questions;
    } catch (err) {
      return null;
    }
  })();
  if (Array.isArray(parsedQuestions)) {
    return parsedQuestions;
  } else {
    console.warn(
      `Failed to get car problems questions. Got this instead: ${response}`
    );
    return [];
  }
};
