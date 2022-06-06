import moment from "moment";
import { getRandomItem } from "./";
import { getRandomGIF } from "./giphy";

type MessageText = string;
type MessageImageUrl = string;

export interface MessageContents {
  messageText: MessageText;
  imageUrl: MessageImageUrl;
}

const presetMessages: MessageText[] = [
  "I think we need to discuss what you're wearing today … Where the heck is your birthday hat?!!! HAPPY BIRTHDAY!",
  ":shea-stares: It's your birthday. :alice-stares:",
  "In honor of your birthday, the team decided it should be party time. We'll go out to party while you stay here and work. HAPPY BIRTHDAY!!",
  "Wishing you a great birthday and a memorable year. From all of us. :heart:",
];

export const generateRandomMessageContents =
  async (): Promise<MessageContents> => {
    return {
      messageText: getRandomItem(presetMessages),
      imageUrl: await getRandomGIF(),
    };
  };

export const generateBirthdayStatus = (
  userName?: string,
  birthday?: moment.Moment
): string => {
  if (!birthday) return "You currently have no birthday registered.";
  const daysAway = birthday.diff(moment().utc().startOf("day"), "days");
  switch (daysAway) {
    case 0:
      return `:tada: ${
        userName || "Cowabunga"
      }, it's your birthday *today*! Cake :birthday: and ice cream :ice_cream: is on it's way! :enoch-fish:`;
    case 1:
      return `Your birthday is currently set to *tomorrow*! :ahh:`;
    default:
      return `Your birthday is currently set to *${birthday.format(
        "MMMM Do"
      )}* - that's ${daysAway} days away!`;
  }
};
