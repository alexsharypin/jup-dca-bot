export async function addressToToken(address: string) {
  try {
    console.log(address);
    const response = await fetch(`https://tokens.jup.ag/token/${address}`);

    // @ts-ignore
    const { symbol, decimals } = await response.json();

    return { symbol, decimals };
  } catch (e) {
    return { symbol: "UNDEFINED", decimals: 0 };
  }
}
