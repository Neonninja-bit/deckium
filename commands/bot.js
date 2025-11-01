const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bot")
        .setDescription("Shows detailed information about the bot."),

    run: async ({ interaction, client }) => {
        const ping = client.ws.ping;
        const uptime = formatUptime(client.uptime);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`🤖 ${client.user.username} Information`)
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "📡 Ping", value: `${ping}ms`, inline: true },
                { name: "⏱ Uptime", value: uptime, inline: true },
                { name: "🧠 Memory", value: `${memoryUsage} MB`, inline: true },
                { name: "💻 System", value: `${platform} (${os.arch()})`, inline: true },
                { name: "⚙️ CPU", value: cpuModel, inline: false },
                { name: "🪄 Node.js", value: process.version, inline: true },
                { name: "📦 Discord.js", value: require("discord.js").version, inline: true }
            )
            .setFooter({ text: ` Test, Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
