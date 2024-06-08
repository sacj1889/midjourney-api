import type { Request, Response } from "express";
import { getClient } from "../helpers/base";
import "dotenv/config";
import { Midjourney } from "../../src";
import { error } from "console";

export const imagineHandler = async (req: Request, res: Response) => {
  const { prompt, output_ratio } = req.body;
  if (!prompt || !output_ratio) {
    return res
      .status(400)
      .json({ message: "Prompt and output_ratio are required" });
  }

  try {
    const result = await main(prompt, output_ratio);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error processing the imagine request:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function main(prompt: string, output_ratio: string) {
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
    // Concatenate aspect ratio to the prompt
    const fullPrompt = `${prompt} --ar ${output_ratio}`;
    const imagine = await client.Imagine(fullPrompt);
    console.log({ Imagine: imagine });

    if (!imagine) {
      throw new Error("Failed to create imagine.");
    }

    const url = imagine.uri;

    // Parse the aspect ratio
    const [widthRatio, heightRatio] = output_ratio.split(":").map(Number);
    let width: number;
    let height: number;

    // Calculate dimensions based on the aspect ratio
     if (widthRatio < heightRatio) {
       width = 2048;
       height = Math.floor((2048 * heightRatio) / widthRatio);
     } else {
       height = 2048;
       width = Math.floor((2048 * widthRatio) / heightRatio);
     }

    const modifiedUrl = `${url}width=${width}&height=${height}`;

    return { url, modifiedUrl };
  } finally {
    client.Close();
  }
}
