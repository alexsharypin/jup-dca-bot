import { BN } from "@coral-xyz/anchor";

export async function addressToToken(address: string) {
  try {
    const response = await fetch(`https://tokens.jup.ag/token/${address}`);

    // @ts-ignore
    const { symbol, decimals } = await response.json();

    return { symbol, decimals };
  } catch (e) {
    return { symbol: "UNDEFINED", decimals: 0 };
  }
}

export function amountToMarkdown(amount: BN, decimals: number): string {
  const divider = new BN(10 ** decimals);

  const { div, mod } = amount.divmod(divider);

  return div.toString().concat("\\.", mod.toString().slice(0, 4));
}

export function secondsToMarkdown(seconds: BN): string {
  const s = seconds.toNumber();

  const date = new Date(s * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getSeconds();

  if (hh) {
    return `${hh} hours`;
  } else if (mm) {
    return `${mm} minutes`;
  } else {
    return `${ss} seconds`;
  }
}
