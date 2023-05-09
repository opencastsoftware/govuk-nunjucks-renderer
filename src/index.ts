import dotenv from "dotenv";
import { createServer } from "./server";
import { createTmpDir } from "./tmpdir";

if (require.main === module) {
  main();
}

async function main() {
  dotenv.config();
  const PORT = process.env["PORT"] || "3000";
  const tmpdir = await createTmpDir();
  createServer(tmpdir).listen(PORT);
}
