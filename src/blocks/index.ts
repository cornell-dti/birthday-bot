import { Block, KnownBlock } from "@slack/bolt";
import moment from "moment";
import { generateBirthdayStatus, getRandomMessage } from "../util/messages";
import { BDAY_EDIT, BDAY_MODAL_OPEN } from "./actions";

type Blocks = (KnownBlock | Block)[];

export const generateHomeBlocks = (
  userName?: string,
  birthdayRaw?: Date
): Blocks => {
  const birthday =
    birthdayRaw &&
    moment()
      .utc()
      .month(birthdayRaw.getUTCMonth())
      .date(birthdayRaw.getUTCDate());
  if (birthday?.isBefore(moment().utc().startOf("day"), "day")) {
    birthday?.add(1, "year");
  }
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: ":bust_in_silhouette: Your Summary",
        emoji: true,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Welcome to DTI Birthday Bot!",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "Set your birthday so we can celebrate it together!",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: generateBirthdayStatus(userName, birthday),
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          style: birthday ? undefined : "primary",
          text: {
            type: "plain_text",
            text: birthday ? "Edit Birthday" : `Set Birthday`,
            emoji: true,
          },
          value: birthday?.format("YYYY-MM-DD"),
          action_id: BDAY_MODAL_OPEN,
        },
      ],
    },
  ];
};

export const welcomeInitBlocks = (slackUser: string): Blocks => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Hey <@${slackUser}>, I'm the DTI Birthday Bot, the coolest bot in DTI!`,
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "When the special day arrives, I share a fun birthday wish for each member of the team. :tada:",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: ":cake: Add Birthday",
          emoji: true,
        },
        action_id: BDAY_MODAL_OPEN,
      },
    ],
  },
];

export const welcomeResBlocks = (slackUser: string): Blocks => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Hey <@${slackUser}>, I'm the DTI Birthday Bot, the coolest bot in DTI!`,
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "When the special day arrives, I share a fun birthday wish for each member of the team. :tada:",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Thanks adding your birthday! You can head to my Home tab for more details.`,
    },
  },
];

export const birthdayInputBlocks = (initialDate?: string): Blocks => [
  {
    type: "input",
    element: {
      type: "datepicker",
      initial_date: initialDate,
      placeholder: {
        type: "plain_text",
        text: "Select a date",
        emoji: true,
      },
      action_id: BDAY_EDIT,
    },
    optional: true,
    label: {
      type: "plain_text",
      text: "Birthday",
      emoji: true,
    },
    hint: {
      type: "plain_text",
      text: "(i will ignore the year)",
      emoji: true,
    },
  },
];

export const generateBirthdayMessage = async (
  slackUser: string
): Promise<Blocks> => {
  const { messageText, imageURL } = await getRandomMessage();
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Hey <@${slackUser}>,`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: messageText,
      },
    },
    {
      type: "image",
      image_url: imageURL,
      alt_text: "birthday celebration",
    },
  ];
};
