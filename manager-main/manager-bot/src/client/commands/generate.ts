import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import logger from "../utils/logger";
import User from "../../database/models/User";
import config from "../../config";
import crypto from "crypto";

export const data = new SlashCommandBuilder()
  .setName("generate")
  .setDescription("Generates a user key.");

export async function execute(interaction: CommandInteraction, client: Client) {
  try {
    if (!config.OWNERS.includes(interaction.user.id))
      return interaction.reply({
        content: "Command only for staffs!",
        ephemeral: true,
      });

    const sha = crypto
      .createHash("sha1")
      .update(crypto.randomBytes(32))
      .digest("hex");

    await User.create({ key: sha });

    await logger.create(interaction, "Generate", sha, true);

    return interaction.reply({
      content: "The key has been sent to logs channel!",
      ephemeral: true,
    });
  } catch (e) {
    return interaction.reply({
      content: "Critical error!",
      ephemeral: true,
    });
  }
}
