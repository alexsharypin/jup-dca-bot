import { Connection, PublicKey } from "@solana/web3.js";
import { Idl, BorshCoder } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { Notifier } from "./notifier";

export class DCA {
  coder: BorshCoder;
  subscriptionId: number;
  programId: string;
  endpoint: string;
  connection: Connection;
  notifier: Notifier;

  constructor(programId: string, endpoint: string, notifier: Notifier) {
    this.programId = programId;
    this.endpoint = endpoint;
    this.notifier = notifier;

    this.coder = new BorshCoder(IDL as unknown as Idl);
    this.connection = new Connection(endpoint);

    console.log("Connected to", this.endpoint);
  }

  start() {
    if (this.subscriptionId) throw new Error("Subscription already running");

    const programId = new PublicKey(this.programId);

    this.subscriptionId = this.connection.onLogs(
      programId,
      (data) => {
        if (data.logs[1].includes("OpenDcaV2")) {
          return this.openDcaV2(data.signature);
        }
        if (data.logs[1].includes("CloseDca")) {
          return this.closeDca(data.signature);
        }
        if (data.logs[3].includes("EndAndClose")) {
          return this.endAndClose(data.signature);
        }
      },
      "confirmed"
    );
  }

  async openDcaV2(signature: string) {
    const tx = await this.connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      console.log("openDcaV2", signature, "tx not found");
      return;
    }

    // @ts-ignore
    const { data, accounts } = tx.transaction.message.instructions[0];

    const dca = accounts[0].toString();
    const user = accounts[1].toString();
    const input = accounts[3].toString();
    const output = accounts[4].toString();

    const ix = this.coder.instruction.decode(data, "base58");

    // @ts-ignore
    const inAmount = ix?.data.inAmount;

    // @ts-ignore
    const inAmountPerCycle = ix?.data.inAmountPerCycle;

    // @ts-ignore
    const cycleFrequency = ix?.data.cycleFrequency;

    const result = {
      dca,
      user,
      input,
      output,
      inAmount,
      inAmountPerCycle,
      cycleFrequency,
    };

    console.log("openDcaV2", signature, result);

    this.notifier.openDcaV2(result);
  }

  async closeDca(signature: string) {
    const tx = await this.connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      console.log("closeDca", signature, "tx not found");
      return;
    }

    const user = tx?.transaction.message.accountKeys[0].pubkey.toString();
    const dca = tx?.transaction.message.accountKeys[1].pubkey.toString();
    const input = tx?.transaction.message.accountKeys[3].pubkey.toString();
    const output = tx?.transaction.message.accountKeys[4].pubkey.toString();

    const result = {
      dca,
      user,
      input,
      output,
    };

    console.log("closeDca", signature, result);
  }

  async endAndClose(signature: string) {
    const tx = await this.connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      console.log("endAndClose", signature, "tx not found");
      return;
    }

    const dca = tx?.transaction.message.accountKeys[1].pubkey.toString();
    const user = tx?.transaction.message.accountKeys[4].pubkey.toString();
    const input = tx?.transaction.message.accountKeys[8].pubkey.toString();
    const output = tx?.transaction.message.accountKeys[9].pubkey.toString();

    const result = {
      dca,
      user,
      input,
      output,
    };

    console.log("endAndClose", signature, result);
  }
}
