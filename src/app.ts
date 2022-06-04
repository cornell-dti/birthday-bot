import "./util/env";
import {
  App,
  BlockAction,
  ButtonAction,
  InputBlock,
  LogLevel,
  ViewSubmitAction,
} from "@slack/bolt";
import {
  getBirthdayInputBlocks,
  getHomeBlocks,
  getWelcomeMessageBlocks,
  getWelcomePromptBlocks,
  getWelcomeResponseBlocks,
} from "./blocks";
import {
  BDAY_EDIT,
  BDAY_MODAL,
  ModalMetadata,
  BDAY_MODAL_OPEN,
} from "./blocks/actions";
import {
  findBirthdayOfUser,
  removeBirthdayEntry,
  upsertBirthdayEntry,
} from "./util/db";
import { getScheduledPosts } from "./util";

const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID!;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
  port: Number(process.env.PORT) || 3000,
});

app.event("app_home_opened", async ({ event, client, logger }) => {
  const { user } = event;
  const userInfo = await client.users.info({ user });
  if (userInfo.error) {
    logger.error(userInfo.error);
  }
  const result = await findBirthdayOfUser(event.user);
  await client.views.publish({
    user_id: user,
    view: {
      type: "home",
      blocks: getHomeBlocks(
        userInfo?.user?.profile?.display_name,
        result?.birthday
      ),
    },
  });
});

app.event("team_join", async ({ event, client, logger }) => {
  try {
    const message = await client.chat.postMessage({
      channel: event.user.id,
      blocks: getWelcomeMessageBlocks(event.user.id),
    });
    logger.info(message);
    const prompt = await client.chat.postMessage({
      channel: event.user.id,
      blocks: getWelcomePromptBlocks(),
    });
    logger.info(prompt);
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
          type: "modal",
          callback_id: BDAY_MODAL,
          title: {
            type: "plain_text",
            text: "Add your birthday!",
          },
          submit: {
            type: "plain_text",
            text: "Save",
          },
          close: {
            type: "plain_text",
            text: "Cancel",
          },
          blocks: getBirthdayInputBlocks(action.value),
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

      const user = body.user.id;
      const birthday = value ? new Date(value) : undefined;
      birthday?.setFullYear(0);

      const userInfo = await client.users.info({ user });
      if (userInfo.error) {
        logger.error(userInfo.error);
      }

      const result = await client.views.publish({
        user_id: user,
        view: {
          type: "home",
          blocks: getHomeBlocks(
            userInfo?.user?.profile?.display_name,
            birthday
          ),
        },
      });
      logger.info(result);

      const scheduled = await getScheduledPosts(client, TARGET_CHANNEL_ID);
      scheduled.scheduled_messages
        ?.filter((msg) => msg.text?.includes(`<@${user}>`))
        ?.forEach((msg) => {
          if (!msg.channel_id || !msg.id) return;
          client.chat.deleteScheduledMessage({
            channel: msg.channel_id,
            scheduled_message_id: msg.id,
          });
        });

      if (birthday) {
        const metadata: ModalMetadata | undefined = JSON.parse(
          body.view.private_metadata
        );
        if (metadata?.ts && metadata?.channel) {
          client.chat.update({
            ts: metadata.ts,
            channel: metadata.channel,
            blocks: getWelcomeResponseBlocks(),
          });
        }
        await upsertBirthdayEntry(user, birthday);
      } else {
        await removeBirthdayEntry(user);
      }
    } catch (error) {
      logger.error(error);
    }
  }
);

(async () => {
  await app.start();
  console.log(`⚡️ Bolt app is running}!`);
})();
