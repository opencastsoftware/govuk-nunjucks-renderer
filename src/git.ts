import syncFs from "fs";
import fs from "fs/promises";
import { clone as gitClone } from "isomorphic-git";
import http from "isomorphic-git/http/node";
import path from "path";
import logger from "./logger";

export const cloneRepo = async (tmpDir: string, version: string) => {
  try {
    await fs.access(path.join(tmpDir, ".git"));
  } catch (err) {
    // Used to use a TS type guard here, but ran into a complication of JS & TS problems:
    // * jest fiddles with Node globals, so we can't check `instanceof Error` - see https://github.com/jestjs/jest/issues/11808
    // * NodeJs.ErrnoException and Error have no mandatory fields at all
    // * caught errors have type `unknown` since TypeScript 4.4
    // I've set `useUnknownInCatchVariables` to false in tsconfig.json for now
    if (err.code && err.code === "ENOENT") {
      // We haven't cloned the repo yet
      logger.info(
        `Checking out repository at revision ${version} to ${tmpDir}`
      );
      await fs.mkdir(tmpDir, { recursive: true });

      await gitClone({
        fs: syncFs,
        http,
        dir: tmpDir,
        ref: `v${version}`,
        url: "https://github.com/alphagov/govuk-frontend",
        depth: 1,
        singleBranch: true,
      });
    } else {
      throw err;
    }
  }
};
