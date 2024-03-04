import { followMessage } from "../messages";

require("dotenv").config();

const APIKey = process.env.RAPID_API_KEY;
const APIHost = process.env.RAPID_API_HOST;

const getOptions = (url: string) => {
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

const getMediaGroup = (data: any) => {
  const mediaGroup = data.media_with_thumb.map((item: any) => ({
    type: item.Type === "Video" ? "video" : "photo",
    media: item.media,
    caption: followMessage,
    parse_mode: "HTML",
  }));

  return mediaGroup;
};

export { getOptions, getMediaGroup };
