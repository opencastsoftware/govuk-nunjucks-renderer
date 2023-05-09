import Koa from "koa";
import Router from "@koa/router";

export const acceptJson: Router.Middleware<
  Koa.DefaultState,
  Koa.DefaultContext,
  unknown
> = async (ctx, next) => {
  if (ctx.is("application/json")) {
    return await next();
  } else {
    // Unsupported Media Type
    ctx.throw(415);
  }
};

export const returnHtml: Router.Middleware<
  Koa.DefaultState,
  Koa.DefaultContext,
  unknown
> = async (ctx, next) => {
  if (ctx.request.accepts("html")) {
    ctx.type = "html";
    return await next();
  } else {
    // Not Acceptable
    ctx.throw(406);
  }
};
