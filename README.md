# Deno Docs Discord Bot

This bot although being designed mainly to test the [Discordeno](https://discordeno.js.org/) library, can also be used by anyone to have easy and beautiful access to their projects on their own server.

[Discord Server](https://discord.gg/J4NqJ72)

## Pre-requisites

- Deno

## Step By Step

1. Clone the repo. `git clone https://github.com/Skillz4Killz/deno-docs-bot.git`
2. Create your `configs.ts` file in the main folder.

```ts
export const configs = {
  token: "YOUR_TOKEN_HERE",
  prefix: "!",
  botID: "YOUR_BOT_ID_HERE",
  // REPLACE THIS WITH YOUR GITHUB_USERNAME/REPO_NAME
  repositoryURL: "denoland/deno",
}
```

4. Start the bot `deno run --allow-net --allow-read mod.ts`

## Features

- [x] Whenever a user types #123 anywhere in the message it will add a reaction. If that reaction is tapped, the bot will show information for that repositories issue or pull request.
- [x] Adds a 🗑 to all messages sent by the bot so it can be deleted at ease. To prevent spam.

## Acknowledgements

- [Klasa Docs Bot](https://github.com/dirigeants/klasa-docs-bot)
