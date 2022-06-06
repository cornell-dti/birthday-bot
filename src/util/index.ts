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

/**
 * Gives the closest day in the future that matches input date (month/day)
 */
export const getNextInstanceOfDay = (date: Date) => {
  const today = moment().utc().startOf("day");
  const next = today.clone().month(date.getUTCMonth()).date(date.getUTCDate());
  return next.isBefore(today, "day") ? next.add(1, "year") : next;
};
