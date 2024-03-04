"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const mongoose_1 = __importDefault(require("mongoose"));
const messages_1 = require("./messages");
const bot_utils_1 = require("./utils/bot.utils");
const user_model_1 = __importDefault(require("./model/user.model"));
require("dotenv").config();
const token = process.env.BOT_TOKEN;
const bot = new grammy_1.Bot(token);
const dbURI = process.env.MONGODB_URI;
mongoose_1.default
    .connect(dbURI)
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.log(err));
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    ctx.reply(messages_1.welcomeMessage, { parse_mode: "Markdown" });
    try {
        const userId = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.from.id;
        const existingUser = yield user_model_1.default.findOne({ telegram_id: userId });
        if (!existingUser) {
            const user = new user_model_1.default({
                telegram_id: userId,
                first_name: (_b = ctx.update.message) === null || _b === void 0 ? void 0 : _b.from.first_name,
                username: (_c = ctx.update.message) === null || _c === void 0 ? void 0 : _c.from.username,
            });
            yield user.save();
        }
        const channels = new grammy_1.InlineKeyboard()
            .url("My music list", "https://t.me/my_mus_ic_list")
            .row()
            .text("✅Joined");
        ctx.reply(`In order to use this bot, you need to join following channels`, {
            reply_markup: channels,
        });
    }
    catch (error) {
        console.log(error);
    }
}));
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const msg = ctx.update.message;
    if (msg.text === "/start")
        return;
    if ((_d = msg.text) === null || _d === void 0 ? void 0 : _d.includes("https://www.instagram.com/")) {
        try {
            const processingMsg = yield ctx.reply(`⏳ **Downloading...**`, {
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
        }
        catch (error) {
            console.log(error);
            ctx.reply(`📛*Sorry, something went wrong. Please try again later.*`, {
                parse_mode: "Markdown",
            });
        }
    }
    else {
        ctx.reply(`📛Please, send me a valid instagram video link!`, {
            parse_mode: "Markdown",
        });
    }
}));
const handleInstagramData = (data, ctx, msg) => __awaiter(void 0, void 0, void 0, function* () {
    const { Type, media } = data;
    if (Type === "Post-Video") {
        yield ctx.replyWithVideo(media, {
            caption: messages_1.followMessage,
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id,
        });
    }
    else if (Type === "Carousel") {
        const mediaGroup = (0, bot_utils_1.getMediaGroup)(data);
        yield ctx.replyWithMediaGroup(mediaGroup, {
            reply_to_message_id: msg.message_id,
        });
    }
    else if (Type === "Post-Image") {
        yield ctx.replyWithPhoto(media, {
            caption: messages_1.followMessage,
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id,
        });
    }
});
const handleInstagramStoryData = (data, ctx, msg) => __awaiter(void 0, void 0, void 0, function* () {
    const { story_by_id } = data;
    if (story_by_id.Type === "Story-Video") {
        yield ctx.replyWithVideo(story_by_id.media, {
            caption: messages_1.followMessage,
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id,
        });
    }
});
bot.start();
