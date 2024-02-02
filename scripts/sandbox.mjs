import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
const main = () => {
  const post = readFileSync(
    resolve(process.cwd(), "process/post.json"),
    "utf-8"
  );

  writeFileSync(
    resolve(process.cwd(), "process/post.json"),
    JSON.stringify(JSON.parse(post), null, 2)
  );
};

main();
