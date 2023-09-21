import { Events, Message } from "discord.js";
import { client } from "../bot";
import config from "../../config";

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    try {
      if (message.author.id == client?.user?.id) return;
      if (message.channelId != config.CHANNEL) return;

      message.delete();
    } catch (e) {}
  },
};
