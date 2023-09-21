import { CommandInteraction, ChannelType, TextChannel } from "discord.js";
import Log from "../../database/models/Log";

class Logger {
  async create(interaction: CommandInteraction, title: string, text: string, store: boolean = false): Promise<void> {
    try {
      const channels = await interaction.guild?.channels.fetch();

      const channel = await channels?.find(
        (c) => c?.name == "logs" && c?.type == ChannelType.GuildText
      );

      const Embed = {
        color: 0x8587fc,
        title: `Logs - ${title}`,
        description: text,
        timestamp: new Date().toISOString(),
        footer: {
          text: interaction.user.tag,
          icon_url: interaction.user.avatarURL() as string,
        },
      };

      if (channel) {
        await (channel as TextChannel).send({ embeds: [Embed] });
      }

      if (store) {
        await Log.create({
          userid: interaction.user.id,
          description: `${title} - ${text}`,
        });
      }
    } catch (e) {
      console.log(e, interaction.user.id, title, text);
    }
  }
}

export default new Logger();
