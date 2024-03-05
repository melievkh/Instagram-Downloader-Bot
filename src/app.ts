import { Bot } from "grammy";
import mongoose from "mongoose";
import { config } from "./config";

const bot = new Bot(config.BOT_TOKEN!);

bot
  .start()
  .then(() => console.log("Bot started on long polling"))
  .catch((err) => console.log(err));

mongoose
  .connect(config.MONGODB_URI!)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err));

export default bot;
