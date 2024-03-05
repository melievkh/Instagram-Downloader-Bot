import { Context, InlineKeyboard, MiddlewareFn } from "grammy";
import { channels } from "../utils/media.utils";

export const checkIfJoinedChannels: MiddlewareFn<Context> = async (
  ctx,
  next
) => {
  try {
    const channelId = channels[0].id;
    const userId = ctx.from?.id;

    if (!userId || !channelId) {
      console.error("Missing channel ID or user ID");
      await ctx.reply("An error occurred. Please try again later.");
      return;
    }

    const chatMember = await ctx.api.getChatMember(channelId, userId);

    if (
      chatMember.status === "left" ||
      chatMember.status === "kicked" ||
      chatMember.status === "restricted"
    ) {
      const channelsKeyboard = new InlineKeyboard()
        .url(channels[0].name, channels[0].url)
        .row()
        .text("Joined ✅", "joined_pressed");

      await ctx.reply(
        "In order to use this bot, you need to join the following channel",
        {
          reply_markup: channelsKeyboard,
        }
      );
    } else {
      await next();
    }
  } catch (error) {
    console.error("Error in checkIfJoinedChannels middleware:", error);
    await ctx.reply("An error occurred. Please try again later.");
  }
};
