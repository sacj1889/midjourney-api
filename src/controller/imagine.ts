import type { Request, Response } from "express";
import { getClient } from "../helpers/base";
import "dotenv/config";
import { Midjourney } from "../../src";
import { error } from "console";

export const imagineHandler = async (req: Request, res: Response) => {
   const { prompt } = req.body;
  try {
    main(prompt)
      .then(() => {
        console.log("finished");
        // process.exit(0);
      })
      .catch((err) => {
        console.log("finished");
        console.error(err);
        process.exit(1);
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
};

async function main(prompt: string) {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    HuggingFaceToken: <string>process.env.HUGGINGFACE_TOKEN,
    Debug: true,
    Ws: true, // required  `Only you can see this`
  });
  await client.Connect(); // required
  const Imagine = await client.Imagine(
    prompt,
    (uri: string, progress: string) => {
      console.log("Imagine.loading", uri, "progress", progress);
    }
  );
  console.log({ Imagine });
  if (!Imagine) {
    return;
  }
  const reroll = await client.Reroll({
    msgId: <string>Imagine.id,
    hash: <string>Imagine.hash,
    flags: Imagine.flags,
    loading: (uri: string, progress: string) => {
      console.log("Reroll.loading", uri, "progress", progress);
    },
  });
  console.log({ reroll });

  // const Variation = await client.Variation({
  //   index: 2,
  //   msgId: <string>Imagine.id,
  //   hash: <string>Imagine.hash,
  //   flags: Imagine.flags,
  //   loading: (uri: string, progress: string) => {
  //     console.log("Variation.loading", uri, "progress", progress);
  //   },
  // });

  // console.log({ Variation });
  // if (!Variation) {
  //   return;
  // }
  const Upscale = await client.Upscale({
    index: 2,
    msgId: <string>Imagine.id,
    hash: <string>Imagine.hash,
    flags: Imagine.flags,
    loading: (uri: string, progress: string) => {
      console.log("Upscale.loading", uri, "progress", progress);
    },
  });
  console.log({ Upscale });

  client.Close();
}
