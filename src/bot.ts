import axios from "axios";
import { Bot, InlineKeyboard } from "grammy";
import mongoose from "mongoose";
import { Message } from "grammy/types";
import { followMessage, welcomeMessage } from "./messages";
import { getMediaGroup, getOptions } from "./utils/bot.utils";
import User from "./model/user.model";

require("dotenv").config();

const token = process.env.BOT_TOKEN;
const bot = new Bot(token!);

const dbURI = process.env.MONGODB_URI;
mongoose
  .connect(dbURI!)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err));

bot.command("start", async (ctx) => {
  ctx.reply(welcomeMessage, { parse_mode: "Markdown" });

  try {
    const userId = ctx.update.message?.from.id;
    const existingUser = await User.findOne({ telegram_id: userId });

    if (!existingUser) {
      const user = new User({
        telegram_id: userId,
        first_name: ctx.update.message?.from.first_name,
        username: ctx.update.message?.from.username,
      });

      await user.save();
    }

    const channels = new InlineKeyboard()
      .url("My music list", "https://t.me/my_mus_ic_list")
      .row()
      .text(`✅ Joined`);

    ctx.reply(`In order to use this bot, you need to join following channels`, {
      reply_markup: channels,
    });
  } catch (error) {
    console.log(error);
  }
});

bot.on("message", async (ctx) => {
  const msg = ctx.update.message;
  if (msg.text === "/start") return;

  if (msg.text?.includes("https://www.instagram.com/")) {
    try {
      const processingMsg = await ctx.reply(`⏳ **Downloading...**`, {
        parse_mode: "Markdown",
      });

      //   const options = getOptions(msg.text);
      //   const response = await axios.request(options);
      //   const { data } = response;

      //   await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);
      //   await ctx.reply(`✅ **Downloaded**`, { parse_mode: "Markdown" });

      //   await handleInstagramData(data, ctx, msg);

      //   if (msg.text?.includes("https://www.instagram.com/stories/")) {
      //     await handleInstagramStoryData(data, ctx, msg);
      //   }
    } catch (error) {
      console.log(error);
      ctx.reply(`📛*Sorry, something went wrong. Please try again later.*`, {
        parse_mode: "Markdown",
      });
    }
  } else {
    ctx.reply(`📛Please, send me a valid instagram video link!`, {
      parse_mode: "Markdown",
    });
  }
});

const handleInstagramData = async (
  data: any,
  ctx: any,
  msg: Message
): Promise<void> => {
  const { Type, media } = data;

  if (Type === "Post-Video") {
    await ctx.replyWithVideo(media, {
      caption: followMessage,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });
  } else if (Type === "Carousel") {
    const mediaGroup = getMediaGroup(data);
    await ctx.replyWithMediaGroup(mediaGroup, {
      reply_to_message_id: msg.message_id,
    });
  } else if (Type === "Post-Image") {
    await ctx.replyWithPhoto(media, {
      caption: followMessage,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });
  }
};

const handleInstagramStoryData = async (
  data: any,
  ctx: any,
  msg: Message
): Promise<void> => {
  const { story_by_id } = data;

  if (story_by_id.Type === "Story-Video") {
    await ctx.replyWithVideo(story_by_id.media, {
      caption: followMessage,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });
  }
};

bot.start();
