import type { Request, Response } from "express";
import { getClient } from "../helpers/base";
import "dotenv/config";
import { Midjourney } from "../../src";
import { error } from "console";

export const imagineHandler = async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const result = await main(prompt);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error processing the imagine request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function main(prompt: string) {
  const client = new Midjourney({
    ServerId: process.env.SERVER_ID as string,
    ChannelId: process.env.CHANNEL_ID as string,
    SalaiToken: process.env.SALAI_TOKEN as string,
    HuggingFaceToken: process.env.HUGGINGFACE_TOKEN as string,
    Debug: true,
    Ws: true,
  });

  await client.Connect();
  try {
    const imagine = await client.Imagine(prompt);
    console.log({ Imagine: imagine });

    if (!imagine) {
      throw new Error("Failed to create imagine.");
    }

    const url = imagine.uri;
    const modifiedUrl = `${url}width=2048&height=2048`;

    return { url, modifiedUrl };
  } finally {
    client.Close();
  }
}
