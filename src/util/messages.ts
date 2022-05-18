import moment from 'moment';
import { getRandomItem } from './helpers';

interface BirthdayMessage {
  messageText: string;
  imageURL: string;
}

const birthdayMessagePresets: BirthdayMessage[] = [
  {
    messageText:
      "I think we need to discuss what you're wearing today … Where the heck is your birthday hat?!!! HAPPY BIRTHDAY!",
    imageURL:
      'https://d31h9pijuvf29u.cloudfront.net/media/c_images/8e5746a116.gif',
  },
];

export const getRandomBirthdayMessage = () =>
  getRandomItem(birthdayMessagePresets);

export const generateBirthdayStatus = (
  userName?: string,
  birthday?: moment.Moment
) => {
  if (!birthday) return 'You currently have no birthday registered.';
  const daysAway = birthday.diff(moment().utc().startOf('day'), 'days');
  switch (daysAway) {
    case 0:
      return `:tada: ${
        userName || 'Cowabunga'
      }, it's your birthday *today*! Cake :birthday: and ice cream :ice_cream: is on it's way! :enoch-fish:`;
    case 1:
      return `Your birthday is currently set to *${birthday.format(
        'MMMM Do'
      )}* - that's *tomorrow*! :ahh:`;
    default:
      return `Your birthday is currently set to *${birthday.format(
        'MMMM Do'
      )}* - that's ${daysAway} days away!`;
  }
};
