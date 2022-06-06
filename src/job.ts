import "./util/env";
import moment from "moment";
import { findUsersWithBirthday } from "./util/db";
import { WebClient } from "@slack/web-api";
import { getScheduledPosts } from "./util";
import { generateRandomMessageContents } from "./util/messages";
import { BirthdayCelebrationMessage } from "./blocks";

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
    // Birthdays are normalized with year 0 in db
    const dbToday = moment().utc().year(0).toDate();
    const users = await findUsersWithBirthday(dbToday);
    const scheduled = await getScheduledPosts(client, TARGET_CHANNEL_ID);
    await Promise.all(
      users.map(async ({ user }) => {
        const alreadyScheduled = scheduled.scheduled_messages?.some((msg) =>
          msg.text?.includes(`<@${user}>`)
        );
        if (alreadyScheduled) return;
        const contents = await generateRandomMessageContents();
        client.chat.scheduleMessage({
          ...BirthdayCelebrationMessage(user, contents),
          channel: TARGET_CHANNEL_ID,
          post_at: postAt,
        });
      })
    );
  } catch (error) {
    console.error(error);
  }
};
schedulePosts();
