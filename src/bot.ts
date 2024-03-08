import { Message } from "grammy/types";
import { Context, GrammyError, HttpError, InlineKeyboard } from "grammy";
import { igdl, youtube, fbdown } from "btch-downloader";

import bot from "./app";
import User from "./model/user.model";
import { checkIfJoinedChannels, restrictToPrivateChat } from "./middleware";
import { getMediaGroup, getOptions } from "./utils/media.utils";
import { isValidLink } from "./middleware/isValidLink.middleware";

bot.use(checkIfJoinedChannels);
bot.use(restrictToPrivateChat);
bot.use(isValidLink);

bot.command("start", async (ctx) => {
  await ctx.reply(
    `✨ Simply send me the link of the content you want to download`
  );

  try {
    const userId = ctx.update.message?.from.id;
    const existingUser = await User.findOne({ telegram_id: userId });
    if (!userId || existingUser) return;

    const user = new User({
      telegram_id: userId,
      first_name: ctx.update.message?.from.first_name,
      username: ctx.update.message?.from.username,
    });
    await user.save();
  } catch (error) {
    console.log(error);
  }
});

bot.on("message", async (ctx) => {
  const msg = ctx.update.message;
  if (!msg.text) return;

  try {
    const processingMsg = await ctx.reply(`⏳ Downloading...`);

    if (msg.text.startsWith("https://www.instagram.com/")) {
      await downloadInstagramContent(ctx, msg);
      await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);
    } else if (msg.text.startsWith("https://youtu.be/")) {
      await downloadYouTubeContent(ctx, msg);
      await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);
    }
  } catch (error) {
    console.log(error);
    ctx.reply(`📛Sorry, something went wrong. Please try again later.`);
  }
});

// checking if user has joined to the required channels
bot.callbackQuery("joined_pressed", async (ctx) => {
  await ctx.reply(
    `Thank you for joining our channel! You can now access to the bot.`
  );
  await ctx.reply(
    `✨ Simply send me the link of the content you want to download`
  );
});

const downloadInstagramContent = async (ctx: Context, msg: Message) => {
  const response = await igdl(msg.text);

  const downloadKeyboard = new InlineKeyboard().url(
    "🔹Tap to download",
    response[0].url
  );

  await ctx.reply(`[.](${response[0].thumbnail})`, {
    reply_markup: downloadKeyboard,
    parse_mode: "Markdown",
  });
};

const downloadYouTubeContent = async (ctx: Context, msg: Message) => {
  const response = await youtube(msg.text);

  const downloadOptions = new InlineKeyboard()
    .url("🔹🎥Video", response.mp4)
    .row()
    .url("🔻🎧Audio", response.mp3);

  await ctx.reply(`In which format do you want to download?`, {
    reply_markup: downloadOptions,
  });
};

bot.catch((err) => {
  const ctx = err.ctx;
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error(`Error in request:, ${e.description}`);
  } else if (e instanceof HttpError) {
    console.error(`Could not contact Telegram:, ${e}`);
  } else {
    console.error(`Unknown error:, ${e}`);
  }
});
