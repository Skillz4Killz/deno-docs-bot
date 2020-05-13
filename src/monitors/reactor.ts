import { Message } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/v1/structures/message.ts";
import { configs } from "../../configs.ts";

export const reactorMonitor = async (message: Message) => {
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
  message.addReaction("🔖");
};
