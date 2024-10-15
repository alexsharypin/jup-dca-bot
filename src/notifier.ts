import { Telegraf } from "telegraf";
import { addressToToken, amountToMarkdown, secondsToMarkdown } from "./utils";

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

    const header = "*OpenDcaV2 🟢*";

    const body = `Deposit *${amountToMarkdown(inAmount, inputToken.decimals)} ${
      inputToken.symbol
    }* to buy *${outputToken.symbol}* \\(*${amountToMarkdown(
      inAmountPerCycle,
      inputToken.decimals
    )} ${inputToken.symbol}* per *${secondsToMarkdown(cycleFrequency)}*\\)`;

    const footer = `👨🏻‍💻 [${user}](https://solscan.io/account/${user}) \n💰 [${dca}](https://solscan.io/account/${dca})`;

    const msg = `${header}\n\n${body}\n\n${footer}`;

    this.bot.telegram.sendMessage(this.chatId, msg, {
      parse_mode: "MarkdownV2",
      link_preview_options: {
        is_disabled: true,
      },
    });
  }

  async closeDca(data: any) {
    const { dca, user, input, output, totalInWithdrawn, totalOutWithdrawn } =
      data;

    const inputToken = await addressToToken(input);
    const outputToken = await addressToToken(output);

    const header = "*CloseDCA* 🟠";

    const body = `Withdraw *${amountToMarkdown(
      totalInWithdrawn,
      inputToken.decimals
    )} ${inputToken.symbol}* and *${amountToMarkdown(
      totalOutWithdrawn,
      outputToken.decimals
    )} ${outputToken.symbol}*`;

    const footer = `👨🏻‍💻 [${user}](https://solscan.io/account/${user}) \n💰 [${dca}](https://solscan.io/account/${dca})`;

    const msg = `${header}\n\n${body}\n\n${footer}`;

    this.bot.telegram.sendMessage(this.chatId, msg, {
      parse_mode: "MarkdownV2",
      link_preview_options: {
        is_disabled: true,
      },
    });
  }

  async endAndClose(data: any) {
    const { dca, user, input, output, totalInWithdrawn, totalOutWithdrawn } =
      data;

    const inputToken = await addressToToken(input);
    const outputToken = await addressToToken(output);

    const header = "*EndAndClose* 🔴";

    const body = `Withdraw *${amountToMarkdown(
      totalInWithdrawn,
      inputToken.decimals
    )} ${inputToken.symbol}* and *${amountToMarkdown(
      totalOutWithdrawn,
      outputToken.decimals
    )} ${outputToken.symbol}*`;

    const footer = `👨🏻‍💻 [${user}](https://solscan.io/account/${user}) \n💰 [${dca}](https://solscan.io/account/${dca})`;

    const msg = `${header}\n\n${body}\n\n${footer}`;

    this.bot.telegram.sendMessage(this.chatId, msg, {
      parse_mode: "MarkdownV2",
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
