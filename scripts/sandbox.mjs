import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
const main = () => {
  const progressItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const progressItemsChunks = progressItems.reduce((acc, item, i) => {
    const index = Math.floor(i / 5);
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(item);
    return acc;
  }, []);
  console.log(progressItemsChunks);
};

main();
