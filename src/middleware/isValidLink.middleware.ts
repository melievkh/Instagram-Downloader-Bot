import { Context, MiddlewareFn } from "grammy";

export const isValidLink: MiddlewareFn<Context> = async (ctx, next) => {
  const text = ctx.update.message?.text;

  const isValid =
    text?.startsWith("https://www.instagram.com/") ||
    text?.startsWith("https://youtu.be/");

  if (text === "/start") return;
  if (!isValid) {
    return await ctx.reply(`📛Please, send me a valid link!`);
  }

  await next();
};
