import './util/env';
import {
  App,
  BlockAction,
  ButtonAction,
  InputBlock,
  LogLevel,
  ViewSubmitAction,
} from '@slack/bolt';
import {
  birthdayInputBlocks,
  generateBirthdayMessage,
  generateHomeBlocks,
  welcomeInitBlocks,
  welcomeResBlocks,
} from './util/blocks';
import {
  BDAY_EDIT,
  BDAY_MODAL,
  ModalMetadata,
  BDAY_MODAL_OPEN,
} from './util/actions';

import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import cron from 'node-cron';

const MAIN_CHANNEL = 'C03FJ2V7LCT';

const prisma = new PrismaClient();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
  port: Number(process.env.PORT) || 3000,
});

app.use(async ({ next }) => {
  // TODO: This can be improved in future versions
  await next!();
});

app.event('app_home_opened', async ({ event, client, logger }) => {
  const userInfo = await client.users.info({
    user: event.user,
  });
  if (userInfo.error) {
    logger.error(userInfo.error);
  }
  const result = await prisma.birthday.findFirst({
    select: {
      birthday: true,
    },
    where: {
      slackUser: event.user,
    },
  });
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      ...generateHomeBlocks(
        userInfo?.user?.profile?.display_name,
        result?.birthday
      ),
    },
  });
});

app.event('team_join', async ({ event, client, logger }) => {
  try {
    const result = await client.chat.postMessage({
      channel: event.user.id,
      ...welcomeInitBlocks(event.user.id),
    });
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.action<BlockAction<ButtonAction>>(
  BDAY_MODAL_OPEN,
  async ({ ack, body, client, logger, action }) => {
    try {
      await ack();
      const metadata: ModalMetadata = {
        ts: body.message?.ts,
        channel: body.channel?.id,
        response_url: body.response_url,
      };
      const result = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          private_metadata: JSON.stringify(metadata),
          type: 'modal',
          callback_id: BDAY_MODAL,
          title: {
            type: 'plain_text',
            text: 'Add your birthday!',
          },
          submit: {
            type: 'plain_text',
            text: 'Save',
          },
          close: {
            type: 'plain_text',
            text: 'Cancel',
          },
          ...birthdayInputBlocks(action.value),
        },
      });
      logger.info(result);
    } catch (error) {
      logger.error(error);
    }
  }
);

app.action(BDAY_EDIT, async ({ ack, logger }) => {
  try {
    await ack();
  } catch (error) {
    logger.error(error);
  }
});

app.view<ViewSubmitAction>(
  BDAY_MODAL,
  async ({ ack, body, view, client, logger }) => {
    try {
      await ack();

      const block = view.blocks.find(
        (block: InputBlock) => block.element?.action_id === BDAY_EDIT
      )!;
      const value = view.state.values[block.block_id][BDAY_EDIT].selected_date;

      const slackUser = body.user.id;
      const birthday = value ? new Date(value) : undefined;
      birthday?.setFullYear(0);

      const userInfo = await client.users.info({
        user: slackUser,
      });
      if (userInfo.error) {
        logger.error(userInfo.error);
      }
      const result = await client.views.publish({
        user_id: slackUser,
        view: {
          type: 'home',
          ...generateHomeBlocks(userInfo?.user?.profile?.display_name, birthday),
        },
      });
      logger.info(result);

      if (birthday) {
        const metadata: ModalMetadata | undefined = JSON.parse(
          body.view.private_metadata
        );
        if (metadata?.ts && metadata?.channel) {
          client.chat.update({
            ts: metadata.ts,
            channel: metadata.channel,
            ...welcomeResBlocks(slackUser),
          });
        }

        await prisma.birthday.upsert({
          create: { slackUser, birthday },
          update: { birthday },
          where: { slackUser },
        });
      } else {
        await prisma.birthday.deleteMany({
          where: { slackUser },
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }
);

const schedulePosts = async () => {
  try {
    const postTime = moment().utc().hour(14).minute(0).second(0).unix();
    const today = moment().utc().year(0).toDate();
    const users = await prisma.birthday.findMany({
      select: {
        slackUser: true,
      },
      where: {
        birthday: {
          equals: today,
        },
      },
    });
    await Promise.all(
      users.map(async ({ slackUser }) => {
        await app.client.chat.scheduleMessage({
          channel: MAIN_CHANNEL,
          post_at: postTime,
          text: `Happy Birthday <@${slackUser}>!`,
          ...generateBirthdayMessage(slackUser),
        });
      })
    );
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await app.start();
  schedulePosts();
  cron.schedule('0 9 * * *', schedulePosts, { timezone: 'UTC' });

  console.log(`⚡️ Bolt app is running}!`);
})();