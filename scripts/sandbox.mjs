import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

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

// const findSimilarVectorByTestingPossibleValuesOfASingleDimension = (
//   vector,
//   index,
//   targetDifference
// ) => {
//   const modifiedVector = [...vector];
//   const similarVectors = [];
//   for (let i = 0; i < 200; i++) {
//     modifiedVector[index] = Number((i / 100 - 1).toFixed(10));
//     const foundDifference = getCosineSimilarity(vector, modifiedVector);
//     if (
//       Number(foundDifference.toFixed(2)) === Number(targetDifference.toFixed(2))
//     ) {
//       similarVectors.push({
//         vector: [...modifiedVector],
//         modifiedTo: modifiedVector[index],
//         index,
//       });
//     }
//   }
//   const minMaxSimilarVectors = [
//     similarVectors[0],
//     similarVectors.at(-1),
//   ].filter((e) => e);
//   if (minMaxSimilarVectors.length > 0) {
//     console.log(
//       `Found min and max for dimension ${
//         minMaxSimilarVectors[0]?.index
//       }. MIN: ${minMaxSimilarVectors[0]?.modifiedTo}, MAX: ${
//         minMaxSimilarVectors[1]?.modifiedTo || null
//       }`
//     );
//   }
//   return minMaxSimilarVectors.map((e) => e.vector);
// };

// const sparseSample = (array, n) => {
//   const sample = [];
//   const step = Math.floor(array.length / n);
//   for (let i = 0; i < array.length; i += step) {
//     sample.push(array[i]);
//   }
//   return sample;
// };

// const main = async () => {
//   const vectors = JSON.parse(
//     readFileSync(resolve(process.cwd(), "src/data/vectors.json"), "utf-8")
//   );
//   for (let vectorIndex = 0; vectorIndex < vectors.length; vectorIndex++) {
//     console.log(`Processing vector ${vectorIndex}...`);
//     const vector = vectors[vectorIndex];
//     const radiusShell = [];
//     for (let i = 0; i < vectors.length; i++) {
//       const similarVectors =
//         findSimilarVectorByTestingPossibleValuesOfASingleDimension(
//           vector,
//           i,
//           0.91
//         );
//       if (similarVectors.length > 0) {
//         radiusShell.push(...similarVectors);
//       }
//     }
//     vectors[vectorIndex] = [...Array(10).keys()]
//       .map((_, i) => radiusShell[Math.floor(radiusShell.length / (i + 1))])
//       .filter((e) => e);
//     vectors[vectorIndex].push(vector);
//   }
//   console.log();
//   writeFileSync(
//     resolve(process.cwd(), "src/data/vectorsPlusProximities.json"),
//     JSON.stringify(vectors.flat(1), null, 2)
//   );
// };

// main();

const main = async () => {
  const vectors = JSON.parse(
    readFileSync(
      resolve(process.cwd(), "src/data/vectorsPlusCacheHits.json"),
      "utf-8"
    )
  );

  vectors.forEach((_, i) => {
    vectors[i].nearest = null;
  });

  vectors.forEach(({ vector, isCache }, i) => {
    if (String(isCache) === "true") {
      return;
    }

    const nearestVector = vectors
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

    if (!nearestVector) {
      throw new Error("No nearest vector found. That's not possible.");
    }

    const [v2, i2] = nearestVector;

    vectors[i].nearest = {
      index: i2,
      similarity: getCosineSimilarity(vector, v2.vector),
      vector: v2.vector,
    };
  });

  writeFileSync(
    resolve(process.cwd(), "src/data/vectorsCorrected.json"),
    JSON.stringify(vectors, null, 2)
  );
};

main();
