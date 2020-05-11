import { Message } from "https://raw.githubusercontent.com/Skillz4Killz/Discordeno/master/structures/message.ts";
import { commandHandler } from "../monitors/commandHandler.ts";
import { reactorMonitor } from "../monitors/reactor.ts";

export const messageCreate = (message: Message) => {
  commandHandler(message);
  reactorMonitor(message);
};
