import { Telegraf } from "telegraf";
import { addressToToken } from "./utils";

export class Notifier {
  bot: Telegraf;
  chatId: number;

  constructor(bot: Telegraf) {
    this.bot = bot;
    this.chatId = 516742342;
  }

  async openDcaV2(data: any) {
    if (!this.chatId) return;

    const {
      dca,
      user,
      input,
      output,
      inAmount,
      inAmountPerCycle,
      cycleFrequency,
    } = data;

    const inputToken = await addressToToken(input);
    const outputToken = await addressToToken(output);

    const msg = `*OpenDcaV2* \n\nDeposit *${inAmount.toString()} ${
      inputToken.symbol
    }* to buy *${outputToken.symbol}* \\(*${inAmountPerCycle.toString()} ${
      inputToken.symbol
    }* per *${cycleFrequency.toString()}*\\)\n\n👨🏻‍💻 [${user}](https://solscan.io/account/${user}) \n💰 [${dca}](https://solscan.io/account/${dca}) \n`;

    this.bot.telegram.sendMessage(this.chatId, msg, {
      parse_mode: "MarkdownV2",
    });
  }
}
