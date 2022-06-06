import {
  Actions,
  Button,
  DatePicker,
  Divider,
  Header,
  HomeTab,
  Image,
  Input,
  Message,
  Modal,
  Section,
} from "slack-block-builder";
import { getNextInstanceOfDay } from "../util";
import { MessageContents, generateBirthdayStatus } from "../util/messages";
import { BDAY_EDIT, BDAY_MODAL, BDAY_MODAL_OPEN } from "./actions";

export const HomeView = (displayName?: string, birthday?: Date) => {
  const nextBirthday = birthday && getNextInstanceOfDay(birthday);
  return HomeTab()
    .blocks(
      Header({ text: ":bust_in_silhouette: Your Summary" }),
      Divider(),
      Section({ text: "Set your birthday so we can celebrate it together!" }),
      Section({ text: generateBirthdayStatus(displayName, nextBirthday) }),
      Actions().elements(
        Button({
          actionId: BDAY_MODAL_OPEN,
          text: birthday ? "Edit Birthday" : `Set Birthday`,
          value: nextBirthday?.toISOString(),
        }).primary(!birthday)
      )
    )
    .buildToObject();
};

export const WelcomeMessage = (user: string) =>
  Message({ channel: user })
    .blocks(
      Section({
        text: `Hey <@${user}>, I'm the DTI Birthday Bot, the coolest bot in DTI!`,
      })
    )
    .buildToObject();

export const WelcomePrompt = (user: string) =>
  Message({ channel: user })
    .blocks(
      Actions().elements(
        Button({ text: ":cake: Add Birthday", actionId: BDAY_MODAL_OPEN })
      )
    )
    .buildToObject();

export const WelcomePromptResponse = (user: string) =>
  Message({ channel: user })
    .blocks(
      Section({
        text: `Thanks adding your birthday! You can head to my Home tab for more details.`,
      })
    )
    .buildToObject();

export const BirthdayInput = (initialDate?: Date, privateMetaData?: string) =>
  Modal({
    title: "Add Your Birthday!",
    submit: "Save",
    close: "Cancel",
    callbackId: BDAY_MODAL,
    privateMetaData,
  })
    .blocks(
      Input({
        label: "Birthday",
        hint: "(i will ignore the year)",
      })
        .element(
          DatePicker({
            actionId: BDAY_EDIT,
            initialDate,
            placeholder: "Select a date",
          })
        )
        .optional(!!initialDate)
    )
    .buildToObject();

export const BirthdayCelebrationMessage = (
  user: string,
  contents: MessageContents
) => {
  const { messageText, imageUrl } = contents;
  return Message({ text: `Happy Birthday <@${user}>!` })
    .blocks(
      Section({ text: `Hey <@${user}>,` }),
      Section({ text: messageText }),
      Image({ altText: "birthday celebration gif", imageUrl })
    )
    .buildToObject();
};
