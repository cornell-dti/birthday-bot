import './util/env';
import moment from 'moment';
import { generateBirthdayMessage } from './util/blocks';
import { prisma } from './util/db';
import { WebClient } from '@slack/web-api';

// Right now we schedule in UTC, does not account for daylight savings
const CELEBRATION_HOUR = 14; // 14 = 2pm UTC = 10am EDT = 9am EST
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID!;

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

const schedulePosts = async () => {
  try {
    // TODO: Make timezone configurable
    const postAt = moment()
      .utc()
      .set({
        hour: CELEBRATION_HOUR,
        minute: 0,
        second: 0,
      })
      .unix();
    // Birthday representations in DB are stored with year 0
    const dbToday = moment().utc().year(0).toDate();
    const users = await prisma.birthday.findMany({
      select: {
        slackUser: true,
      },
      where: {
        birthday: {
          equals: dbToday,
        },
      },
    });
    const scheduled = await client.chat.scheduledMessages.list({
      channel: TARGET_CHANNEL_ID,
      oldest: moment.utc().startOf('day').unix(),
      latest: moment.utc().endOf('day').unix(),
    });
    console.log(scheduled);
    await Promise.all(
      users.map(async ({ slackUser }) => {
        const alreadyScheduled = scheduled.scheduled_messages?.some((msg) =>
          msg.text?.includes(`<@${slackUser}>`)
        );
        if (alreadyScheduled) return;
        client.chat.scheduleMessage({
          channel: TARGET_CHANNEL_ID,
          post_at: postAt,
          text: `Happy Birthday <@${slackUser}>!`,
          ...generateBirthdayMessage(slackUser),
        });
      })
    );
  } catch (error) {
    console.error(error);
  }
};
schedulePosts();
