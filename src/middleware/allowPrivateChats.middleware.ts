import { Context, MiddlewareFn } from "grammy";

export const restrictToPrivateChat: MiddlewareFn<Context> = async (
  ctx,
  next
) => {
  if (ctx.chat?.type !== "private") return;
  await next();
};
