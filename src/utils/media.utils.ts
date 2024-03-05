import { config } from "../config";

const getOptions = (url: string) => {
  return {
    url: "https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index",
    params: { url },
    headers: {
      "X-RapidAPI-Key": config.RAPID_API_KEY!,
      "X-RapidAPI-Host": config.RAPID_API_HOST,
    },
  };
};

const getMediaGroup = (data: any) => {
  const mediaGroup = data.media_with_thumb.map((item: any) => ({
    type: item.Type === "Video" ? "video" : "photo",
    media: item.media,
    caption: `@insta_downloader_yuklovchi_bot`,
    parse_mode: "HTML",
  }));

  return mediaGroup;
};

type ChannelsType = {
  id: string;
  name: string;
  url: string;
};

const channels: ChannelsType[] = [
  {
    id: "-1001224633844",
    name: "My music list",
    url: "https://t.me/my_mus_ic_list",
  },
];

export { getOptions, getMediaGroup, channels };
