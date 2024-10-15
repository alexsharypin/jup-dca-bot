import { Connection, PublicKey } from "@solana/web3.js";
import { Idl, BorshCoder, utils, BorshEventCoder } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { Notifier } from "./notifier";

export class DCA {
  coder: BorshCoder;
  eventCoder: BorshEventCoder;
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
    this.eventCoder = new BorshEventCoder(IDL as unknown as Idl);
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
    const { accounts, data } = tx.transaction.message.instructions.find(
      (ix) => ix.programId.toString() === this.programId
    );

    const dca = accounts[0].toString();
    const user = accounts[1].toString();
    const input = accounts[3].toString();
    const output = accounts[4].toString();

    const {
      // @ts-ignore
      data: { inAmount, inAmountPerCycle, cycleFrequency },
    } = this.coder.instruction.decode(data, "base58");

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

    // @ts-ignore
    const { accounts } = tx.transaction.message.instructions.find(
      (ix) => ix.programId.toString() === this.programId
    );

    // @ts-ignore
    const { data } = tx.meta.innerInstructions[0].instructions.find(
      (ix) => ix.programId.toString() === this.programId
    );

    const ixData = utils.bytes.bs58.decode(data);
    const eventData = utils.bytes.base64.encode(ixData.subarray(8));
    const {
      data: { totalInWithdrawn, totalOutWithdrawn },
    } = this.eventCoder.decode(eventData);

    const dca = accounts[1].toString();
    const user = accounts[0].toString();
    const input = accounts[2].toString();
    const output = accounts[3].toString();

    const result = {
      dca,
      user,
      input,
      output,
      totalInWithdrawn,
      totalOutWithdrawn,
    };

    console.log("closeDca", signature, result);

    this.notifier.closeDca(result);
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

    // @ts-ignore
    const { accounts } = tx.transaction.message.instructions.find(
      (ix) => ix.programId.toString() === this.programId
    );

    // @ts-ignore
    const { data } = tx.meta.innerInstructions[0].instructions.find(
      (ix) => ix.programId.toString() === this.programId
    );

    const ixData = utils.bytes.bs58.decode(data);
    const eventData = utils.bytes.base64.encode(ixData.subarray(8));
    const {
      data: { totalInWithdrawn, totalOutWithdrawn },
    } = this.eventCoder.decode(eventData);

    const dca = accounts[1].toString();
    const user = accounts[6].toString();
    const input = accounts[2].toString();
    const output = accounts[3].toString();

    const result = {
      dca,
      user,
      input,
      output,
      totalInWithdrawn,
      totalOutWithdrawn,
    };

    console.log("endAndClose", signature, result);

    this.notifier.endAndClose(result);
  }
}
