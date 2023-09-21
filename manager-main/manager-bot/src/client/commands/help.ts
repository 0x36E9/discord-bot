import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, Client, CommandInteraction, TextChannel } from "discord.js";
import { CommandCooldown, msToMinutes } from "discord-command-cooldown";
import logger from "../utils/logger";

const userCommandCooldown = new CommandCooldown('help', 7200000);

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Creates a new help thread.")
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("Describe your problem!")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction, client: Client) {
  try {
    const channel = await client.channels.fetch(interaction.channelId);
    if (!channel || channel.type != ChannelType.GuildText) return;

    const userCooldowned = await userCommandCooldown.getUser(interaction.user.id);
    if (userCooldowned) {
      const timeLeft = msToMinutes(userCooldowned.msLeft, false);
      return interaction.reply({
        content: `You need to wait ${ timeLeft.hours + ' hours, ' + timeLeft.minutes + ' minutes, ' + timeLeft.seconds + ' seconds' } before running command again!`,
        ephemeral: true,
      });
    }

    const thread = await (channel as TextChannel).threads.create({
      name: `support-${Date.now()}`,
      reason: `Support ticket ${Date.now()}`,
      type: ChannelType.PrivateThread,
      autoArchiveDuration: 10080
    });

    const Description = interaction.options.get("description")?.value;

    const Embed = {
      color: 0x8587fc,
      title: `Thread`,
      description: `**Description:** ${Description}`,
      timestamp: new Date().toISOString(),
      footer: {
        text: interaction.user.tag,
        icon_url: interaction.user.avatarURL() as string,
      },
    };

    await thread.send({
      content: `<@${interaction.user.id}>`,
      embeds: [Embed],
    });

    await logger.create(interaction, "Help", `**Description:** ${Description}\n**Thread**: <#${thread.id}>`);

    await userCommandCooldown.addUser(interaction.user.id);

    return interaction.reply({
      content: "Created with successfully!",
      ephemeral: true,
    });
  } catch (e) {
    return interaction.reply({
      content: "Internal error, please try again later!",
      ephemeral: true,
    });
  }
}
