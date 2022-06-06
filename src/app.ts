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
  BirthdayInput,
  HomeView,
  WelcomeMessage,
  WelcomePrompt,
  WelcomePromptResponse,
} from "./blocks";
import {
  BDAY_EDIT,
  BDAY_MODAL,
  ModalMetadata,
  BDAY_MODAL_OPEN,
} from "./blocks/actions";
import { findBirthdayOfUser, upsertBirthday } from "./util/db";
import { getNextInstanceOfDay, getScheduledPosts } from "./util";

const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID!;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
  port: Number(process.env.PORT) || 3000,
  customRoutes: [
    {
      path: "/health",
      method: ["GET"],
      handler: (_req, res) => {
        res.writeHead(200);
        res.end("ok");
      },
    },
  ],
});

app.event("app_home_opened", async ({ event, client, logger }) => {
  try {
    const { user } = event;
    const userInfo = await client.users.info({ user });
    if (userInfo.error) {
      logger.error(userInfo.error);
      // TODO: Publish error in home view
    }
    const { birthday } = (await findBirthdayOfUser(event.user)) || {};
    const publishResponse = await client.views.publish({
      user_id: user,
      view: HomeView(
        userInfo.user?.profile?.display_name,
        getNextInstanceOfDay(birthday)
      ),
    });
    logger.info(publishResponse);
  } catch (error) {
    logger.error(error);
  }
});

app.event("team_join", async ({ event, client, logger }) => {
  try {
    const msg = await client.chat.postMessage(WelcomeMessage(event.user.id));
    logger.info(msg);
    const prompt = await client.chat.postMessage(WelcomePrompt(event.user.id));
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
      const initialDate = action.value ? new Date(action.value) : undefined;
      const result = await client.views.open({
        trigger_id: body.trigger_id,
        view: BirthdayInput(initialDate, JSON.stringify(metadata)),
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

      const userInfo = await client.users.info({ user });
      logger.info(userInfo);

      const publishResponse = await client.views.publish({
        user_id: user,
        view: HomeView(
          userInfo.user?.profile?.display_name,
          getNextInstanceOfDay(birthday)
        ),
      });
      logger.info(publishResponse);

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

      const metadata: ModalMetadata | undefined = JSON.parse(
        body.view.private_metadata
      );
      if (metadata?.ts && metadata?.channel) {
        client.chat.update({
          ...WelcomePromptResponse(metadata.channel),
          ts: metadata.ts,
        });
      }
      birthday?.setFullYear(0);
      await upsertBirthday(user, birthday);
    } catch (error) {
      logger.error(error);
    }
  }
);

(async () => {
  await app.start();
  console.log(`⚡️ Bolt app is running}!`);
})();
