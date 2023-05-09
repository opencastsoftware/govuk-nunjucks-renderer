import Koa from "koa";
import logger from "koa-logger";
import { createRouter } from "./routes";

const app = new Koa();

export const createServer = (tmpdir: string) => {
  const router = createRouter(tmpdir);
  return app.use(logger()).use(router.routes()).use(router.allowedMethods());
};
