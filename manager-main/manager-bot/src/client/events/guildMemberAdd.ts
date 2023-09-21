import { Events, GuildMember } from "discord.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    try {
      const role = member.guild.roles.cache.find(
        (r) => r.name === "User"
      );
      
      if (!role) return;

      await member.roles.add(role);
    } catch (e) {}
  },
};
