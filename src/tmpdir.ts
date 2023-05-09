import fs from "fs/promises";
import os from "os";
import path from "path";

export const createTmpDir = async () => {
  const tmpDirPrefix = path.join(os.tmpdir(), "govuk-nunjucks-renderer-");
  return await fs.mkdtemp(tmpDirPrefix);
};
