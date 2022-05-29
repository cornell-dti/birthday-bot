import giphyAPI from 'giphy-api';

const giphy = giphyAPI(process.env.GIPHY_API_KEY);

export const getRandomGIF = async (tag = 'birthday') => {
  const { data } = await giphy.random({
    tag,
    rating: 'g',
    fmt: 'json',
  });
  return data.bitly_url;
};
