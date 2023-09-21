import { Events, CommandInteraction } from "discord.js";
import { client } from "../bot";
import * as commandModules from "../commands";
import config from "../../config";

const commands = Object(commandModules);

export default {
  name: Events.InteractionCreate,
  async execute(interaction: CommandInteraction) {
    try {
      if (!interaction.isCommand()) return;
      if (!interaction?.channelId) return;
      if (interaction.channelId != config.CHANNEL)
        return interaction.reply({
          content: `Don't use commands here, try using in <#${config.CHANNEL}>.`,
          ephemeral: true,
        });

      const { commandName } = interaction;
      commands[commandName].execute(interaction, client);
    } catch (e) {}
  },
};
