import { Message, addReaction } from "../../deps.ts";
import { configs } from "../../configs.ts";
import { botCache } from "../../mod.ts";

botCache.monitors.set("reactor", {
  name: "monitor",
  ignoreEdits: true,
  botChannelPermissions: [
    "ADD_REACTIONS",
    "READ_MESSAGE_HISTORY",
    "SEND_MESSAGES",
    "EMBED_LINKS",
  ],
  execute: async function (message) {
    // If the message was sent by a bot we can just ignore it
    if (message.author.bot) return;
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

    if (issue.message === "Not Found" && pull.message === "Not Found") return;

    // Its a valid issue or pull request number so we can react to it.
    addReaction(message.channelID, message.id, "🔖");
  },
});
