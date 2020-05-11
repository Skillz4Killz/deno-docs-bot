import { Message } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/master/structures/message.ts";
import { configs } from "../../configs.ts";
import {
  MessageReactionPayload,
  Reaction_Payload,
} from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/master/types/message.ts";
import { cache } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/master/utils/cache.ts";
function isMessage(
  message: Message | MessageReactionPayload,
): message is Message {
  return (message as Message).raw !== undefined;
}

export const reactionAdd = async (
  message: Message | MessageReactionPayload,
  emoji: Reaction_Payload,
  userID: string,
) => {
  if (!isMessage(message) || !message.guild_id) return;

  const guild = cache.guilds.get(message.guild_id);
  if (!guild) return;

  const reactingUser = cache.users.get(userID);
  if (!reactingUser) return;

  if (emoji.name === "🔖") {
    if (reactingUser.bot) return;
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

    const response = await message.channel.sendMessage({
      embed: {
        description: data.body.substring(0, 2048),
        thumbnail: {
          url: "https://i.imgur.com/GsVUS41.gif",
        },
        author: {
          name: data.user.login,
          icon_url: data.user.avatar_url,
          url: data.user.html_url,
        },
        title: data.title,
        url: data.html_url,
        timestamp: new Date(data.created_at).toISOString(),
        fields: [
          { name: "__**Status:**__", value: data.state, inline: true },
          {
            name: "__**Labels:**__",
            value: data.labels.map((label: { name: any }) => label.name).join(
              ", ",
            ) || "None",
            inline: true,
          },
        ],
        color:
          // If it is an issue
          isIssue
            ? data.state === "open" ? 0xd1d134 : 0x2d32be
            : // If it is a pull request
              data.state === "open"
              ? 0x2cbe4e
              : data.state === "closed"
              ? 0xcb2431
              : // Merged PR
                0x6f42c1,
      },
    });

    response.addReaction("🗑");
  } else if (emoji.name === "🗑") {
    if (message.author.id !== configs.botID) return;
    if (userID === configs.botID) return;
    message.delete().catch(() => undefined);
  }
};
