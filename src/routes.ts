import Router from "@koa/router";
import fs from "fs";
import * as yaml from "js-yaml";
import bodyParser from "koa-bodyparser";
import nunjucks, { FileSystemLoader } from "nunjucks";
import path from "path";
import * as semver from "semver";
import { ZodError } from "zod";
import * as git from "./git";
import logger from "./logger";
import { acceptJson, returnHtml } from "./middleware";
import { ComponentSchema, createZodSchema } from "./schema";

export const createRouter = (tmpDir: string) => {
  return new Router().post(
    "post-components",
    "/govuk/:version/components/:name",
    acceptJson,
    returnHtml,
    bodyParser(),
    postComponentsRoute(tmpDir)
  );
};

const postComponentsRoute: (tmpDir: string) => Router.Middleware =
  (tmpDir: string) => async (ctx, next) => {
    const version = ctx.params["version"] as string;
    const name = ctx.params["name"] as string;
    const basePath = semver.gte("5.0.0", version)
      ? "src/govuk"
      : "packages/govuk-frontend/src/govuk";

    try {
      const versionDir = path.join(tmpDir, version);

      await git.cloneRepo(versionDir, version);

      const schema = await fs.promises.readFile(
        path.join(versionDir, `${basePath}/components/${name}/${name}.yaml`),
        { encoding: "utf-8" }
      );

      const yamlData = yaml.load(schema) as ComponentSchema;

      const zodSchema = createZodSchema(name, yamlData);

      const data = await zodSchema.parseAsync(ctx.request.body);

      const fileSystemLoader = new FileSystemLoader(
        path.join(versionDir, basePath)
      );

      const env = new nunjucks.Environment(fileSystemLoader, {
        autoescape: true,
      });

      const result = await new Promise<string | null>((resolve, reject) => {
        env.render(`components/${name}/template.njk`, data, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      ctx.body = result;
      return await next();
    } catch (err) {
      if (err instanceof ZodError) {
        ctx.throw(JSON.stringify(err.issues), 400);
      } else {
        logger.error(err);
        ctx.throw(500);
      }
    }
  };
