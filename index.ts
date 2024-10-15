require("dotenv").config();

import { DCA } from "./dca";
import { Telegraf } from "telegraf";
import { Notifier } from "./notifier";

async function main() {
  const { SOLANA_RPC_ENDPOINT, TELEGRAM_BOT_TOKEN } = process.env;

  if (!SOLANA_RPC_ENDPOINT) throw new Error("SOLANA_RPC_ENDPOINT not defined");
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not defined");

  const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

  const notifier = new Notifier(bot);

  bot.start((ctx) => {
    notifier.chatId = ctx.chat.id;

    ctx.reply("Welcome");
  });

  bot.launch();

  process.once("SIGINT", () => this.bot.stop("SIGINT"));
  process.once("SIGTERM", () => this.bot.stop("SIGTERM"));

  const dca = new DCA(
    "DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
    SOLANA_RPC_ENDPOINT,
    notifier
  );

  dca.start();
}

main();
