import {
  addReaction,
  botID,
  cache,
  deleteMessage,
  Message,
  MessageReactionPayload,
} from "../../deps.ts";
import { botCache } from "../../mod.ts";
import { configs } from "../../configs.ts";
import { Embed } from "../utils/Embed.ts";
import { sendEmbed } from "../utils/helpers.ts";
import { processReactionCollectors } from "../utils/collectors.ts";

function isMessage(
  message: Message | MessageReactionPayload,
): message is Message {
  return (message as Message).content !== undefined;
}

botCache.eventHandlers.reactionAdd = async function (message, emoji, userID) {
  // Process reaction collectors.
  processReactionCollectors(message, emoji, userID);

  if (userID === botID) return;

  if (!isMessage(message) || !message.guildID) return;

  const guild = cache.guilds.get(message.guildID);
  if (!guild) return;

  if (emoji.name === "🔖") {
    // If the message does not have a issue/pull request number in it cancel.
    const number = message.content.split(" ").find((word) =>
      word.startsWith("#") && Number(word.substring(1))
    );
    if (!number) return;

    // A possible number was found
    const [issue, pull] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${configs.repositoryURL}/issues/${
          number.substring(1)
        }`,
      ).then((res) => res.json()),
      fetch(
        `https://api.github.com/repos/${configs.repositoryURL}/pulls/${
          number.substring(1)
        }`,
      ).then((res) => res.json()),
    ]);

    let data;
    const isIssue = pull.message === "Not Found";

    if (issue.message !== "Not Found") data = issue;
    else if (!isIssue) data = pull;
    else return;

    const isOpen = data.state === "open";

    const embed = new Embed()
      .setDescription(data.body)
      .setThumbnail("https://i.imgur.com/GsVUS41.gif")
      .setAuthor(data.user.login, data.user.avatar_url, data.user.html_url)
      .setTitle(data.title, data.html_url)
      .setTimestamp(data.created_at)
      .addField("__**Status:**__", data.state, true)
      .addField(
        "__**Labels:**__",
        data.labels.map((label: { name: any }) => label.name).join(", ") ||
          "None",
        true,
      )
      .setColor( // If it is an issue
        isIssue ? isOpen ? 0xd1d134 : 0x2d32be : // If it is a pull request
          isOpen
          ? 0x2cbe4e
          : !isOpen
          ? 0xcb2431
          : // Merged PR
            0x6f42c1,
      );

    const response = await sendEmbed(message.channel, embed);
    addReaction(response.channelID, response.id, "🗑");
  } else if (emoji.name === "🗑") {
    if (message.author.id !== botID) return;
    if (userID === botID) return;
    deleteMessage(message).catch(() => undefined);
  }
};
