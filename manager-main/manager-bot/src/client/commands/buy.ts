import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType, Client, CommandInteraction, TextChannel, AttachmentBuilder } from "discord.js";
import { CommandCooldown, msToMinutes } from "discord-command-cooldown";
import crypto from "crypto";
import logger from "../utils/logger";
import User from "../../database/models/User";
import mercadopago from "../../wrappers/mercadopago";

const userCommandCooldown = new CommandCooldown('buy', 3600000);

export const data = new SlashCommandBuilder()
  .setName("buy")
  .setDescription("Creates a new buy thread.");

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
      name: `buy-${Date.now()}`,
      reason: `Buy ticket ${Date.now()}`,
      type: ChannelType.PrivateThread,
      autoArchiveDuration: 1440,
    });

    const payment = await mercadopago.create(`${interaction.user.tag} (${interaction.user.id})`, 0.01, "supremacy");

    if (payment.status != "pending") {
      await thread.delete();
      return interaction.reply({
        content: "Error generating the payment!",
        ephemeral: true,
      });
    }

    const buffer = Buffer.from(payment.qr_code_base64, "base64");
    const attachment = new AttachmentBuilder(buffer, { name: "qrcode.png" });
    const description = "Scan the QR Code below with your bank's app and make the payment. Payments not paid within 15 minutes will expire.\n```" + payment.qr_code + "```";

    const paymentEmbed = {
      color: 0x8587fc,
      title: "Buy",
      description: description,
      image: {
        url: "attachment://qrcode.png",
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: interaction.user.tag,
        icon_url: interaction.user.avatarURL() as string,
      },
    };

    thread.send({ content: `<@${interaction.user.id}>`, embeds: [paymentEmbed], files: [attachment] }).then(async (message) => {
        const intervalPaymentTimeout = setInterval(async () => {
          await mercadopago.cancel(payment.id);
          await message.delete();

          const timeoutEmbed = {
            color: 0x8587fc,
            title: `Buy - Timeout`,
            description: "Deleting thread in 10 seconds!",
            timestamp: new Date().toISOString(),
            footer: {
              text: interaction.user.tag,
              icon_url: interaction.user.avatarURL() as string,
            },
          };

          await thread.send({ embeds: [timeoutEmbed] });

          clearInterval(intervalPaymentStatus);
          clearInterval(intervalPaymentTimeout);

          setTimeout(() => thread.delete(), 10000);
        }, 900000);

        const intervalPaymentStatus = setInterval(async () => {
          if ((await mercadopago.status(payment.id)) == "approved") {
            await message.delete();

            const sha = crypto
              .createHash("sha1")
              .update(crypto.randomBytes(32))
              .digest("hex");

            await User.create({ key: sha });

            const approvedEmbed = {
              color: 0x8587fc,
              title: `Buy - Success`,
              description: "Your key: " + sha + "\nNow you have access to download/configuration channels and we recommend that you store your key elsewhere, this channel will be erased within 15 minutes.",
              timestamp: new Date().toISOString(),
              footer: {
                text: interaction.user.tag,
                icon_url: interaction.user.avatarURL() as string,
              },
            };

            await thread.send({ embeds: [approvedEmbed] });
            await logger.create(interaction, "Buy", sha, true);

            clearInterval(intervalPaymentTimeout);
            clearInterval(intervalPaymentStatus);

            setTimeout(() => thread.delete(), 900000);
          }
        }, 30000);
      });

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
