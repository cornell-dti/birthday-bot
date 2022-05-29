import { WebClient } from "@slack/web-api";
import moment from "moment";

export const getRandomItem = <T>(list: T[]) =>
  list[Math.floor(Math.random() * list.length)];

export const getScheduledPosts = async (client: WebClient, channel: string) => {
  return await client.chat.scheduledMessages.list({
    channel,
    oldest: moment.utc().startOf("day").unix(),
    latest: moment.utc().endOf("day").unix(),
  });
};
