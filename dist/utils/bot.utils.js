"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.channels = exports.getMediaGroup = exports.getOptions = void 0;
const messages_1 = require("../messages");
require("dotenv").config();
const APIKey = process.env.RAPID_API_KEY;
const APIHost = process.env.RAPID_API_HOST;
const getOptions = (url) => {
    const options = {
        method: "GET",
        url: "https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index",
        params: { url },
        headers: {
            "X-RapidAPI-Key": APIKey,
            "X-RapidAPI-Host": APIHost,
        },
    };
    return options;
};
exports.getOptions = getOptions;
const getMediaGroup = (data) => {
    const mediaGroup = data.media_with_thumb.map((item) => ({
        type: item.Type === "Video" ? "video" : "photo",
        media: item.media,
        caption: messages_1.followMessage,
        parse_mode: "HTML",
    }));
    return mediaGroup;
};
exports.getMediaGroup = getMediaGroup;
const channels = [
    {
        name: "My music list",
        url: "https://t.me/my_mus_ic_list",
    },
];
exports.channels = channels;
