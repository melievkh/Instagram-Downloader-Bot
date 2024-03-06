import axios from "axios";
import { Message } from "grammy/types";
import { Context, GrammyError, HttpError } from "grammy";

import bot from "./app";
import User from "./model/user.model";
import { checkIfJoinedChannels, restrictToPrivateChat } from "./middleware";
import { getMediaGroup, getOptions } from "./utils/media.utils";

// Use middleware to check if the user has joined specific channels
bot.use(checkIfJoinedChannels);
bot.use(restrictToPrivateChat);

bot.command("start", async (ctx) => {
  await ctx.reply(
    `✨ Simply send me the link of the content you want to download`
  );

  try {
    const userId = ctx.update.message?.from.id;
    const existingUser = await User.findOne({ telegram_id: userId });
    if (!userId) return;

    if (!existingUser) {
      const user = new User({
        telegram_id: userId,
        first_name: ctx.update.message?.from.first_name,
        username: ctx.update.message?.from.username,
      });

      await user.save();
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("message", async (ctx) => {
  const msg = ctx.update.message;

  if (msg.text === "/start") return;
  if (!msg.text || !msg.text?.startsWith("https://www.instagram.com/")) {
    ctx.reply(`📛Please, send me a valid link!`);
    return;
  }

  try {
    const processingMsg = await ctx.reply(`⏳ Downloading...`);

    const options = getOptions(msg.text);
    const response = await axios.get(options.url, {
      params: options.params,
      headers: options.headers,
    });
    const { data } = response;

    await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);
    await ctx.reply(`✅ Downloaded`);

    await handleInstagramData(data, ctx, msg);

    if (msg.text?.startsWith("https://www.instagram.com/stories/")) {
      await handleInstagramStoryData(data, ctx, msg);
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
});

// Handle various Instagram media types
const handleInstagramData = async (
  data: any,
  ctx: Context,
  msg: Message
): Promise<void> => {
  const { Type, media } = data;

  switch (Type) {
    case "Post-Video":
      {
        await ctx.replyWithVideo(media, {
          caption: `<i>@insta_downloader_yuklovchi_bot</i>`,
          parse_mode: "HTML",
          reply_to_message_id: msg.message_id,
        });
      }
      break;
    case "Carousel":
      {
        const mediaGroup = getMediaGroup(data);
        await ctx.replyWithMediaGroup(mediaGroup, {
          reply_to_message_id: msg.message_id,
        });
      }
      break;
    case "Post-Image": {
      await ctx.replyWithPhoto(media, {
        caption: `<i>@insta_downloader_yuklovchi_bot</i>`,
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
      });
    }
    default:
      break;
  }
};

// handle various Instagram Story media types
const handleInstagramStoryData = async (
  data: any,
  ctx: Context,
  msg: Message
): Promise<void> => {
  const { story_by_id } = data;

  console.log(data);
  if (story_by_id.Type === "Story-Video") {
    await ctx.replyWithVideo(story_by_id.media, {
      caption: `<i>@insta_downloader_yuklovchi_bot</i>`,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });
  } else if (story_by_id.Type === "Story-Photo") {
    await ctx.replyWithPhoto(story_by_id.media, {
      caption: `<i>@insta_downloader_yuklovchi_bot</i>`,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });
  }
};

// handling error
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
