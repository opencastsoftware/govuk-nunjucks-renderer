import * as fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { describe, expect, it } from "vitest";
import * as git from "./git";
import { createTmpDir } from "./tmpdir";

const withTmpDir = async (
  version: string,
  test: (version: string, versionDir: string) => Promise<void>,
) => {
  const tmpDir = await createTmpDir();
  const versionDir = path.join(tmpDir, version);
  try {
    return await test(version, versionDir);
  } finally {
    await fs.rm(tmpDir, { force: true, recursive: true });
  }
};

describe("cloneRepo", () => {
  it(
    "should clone the repo if it doesn't already exist",
    () =>
      withTmpDir("4.9.0", async (version, tmpDir) => {
        const mainTemplate = path.join(tmpDir, "src", "govuk", "template.njk");
        expect(fsSync.existsSync(mainTemplate)).toBeFalsy();
        await git.cloneRepo(tmpDir, version);
        expect(fsSync.existsSync(mainTemplate)).toBeTruthy();
      }),
    10000,
  );

  it("should not clone the repo if it already exists", () =>
    withTmpDir("4.9.0", async (_version, tmpDir) => {
      const govukDir = path.join(tmpDir, "src", "govuk");
      const gitDir = path.join(tmpDir, ".git");
      const mainTemplate = path.join(govukDir, "template.njk");
      // Create the .git directory
      await fs.mkdir(gitDir, { recursive: true });
      // Try to clone the repo
      await git.cloneRepo(tmpDir, "4.5.0");
      // The rest of the repo should not have been cloned
      expect(fsSync.existsSync(mainTemplate)).toBeFalsy();
    }));
});
