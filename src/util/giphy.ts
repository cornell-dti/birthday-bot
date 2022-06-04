import giphyAPI from "giphy-api";

const giphy = giphyAPI(process.env.GIPHY_API_KEY);

export const getRandomGIF = async (tag = "birthday celebration") => {
  const { data } = await giphy.random({
    tag,
    rating: "g",
    fmt: "json",
  });
  return data.images.downsized.url;
};
