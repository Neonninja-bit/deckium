const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const commandList = [
  { name: "daily", emoji: "🎁", category: "Economy", description: "Collect daily coins and a random card" },
  { name: "balance", emoji: "💰", category: "Economy", description: "Check your or another user’s balance" },
  { name: "beg", emoji: "🧎", category: "Economy", description: "Beg for coins if you’re broke" },
  { name: "gamble", emoji: "🎲", category: "Economy", description: "Risk your money and test your luck" },
  { name: "drop", emoji: "🎴", category: "Cards", description: "Drop a random card!" },
  { name: "card", emoji: "🃏", category: "Cards", description: "View details of a card using its code" },
  { name: "inventory", emoji: "🎒", category: "Cards", description: "See your card collection" },
  { name: "sell", emoji: "💸", category: "Cards", description: "Sell a card you own for coins" },
  { name: "buy", emoji: "🛒", category: "Cards", description: "Buy a card from the shop" },
  { name: "upgrade", emoji: "⚙️", category: "Cards", description: "Upgrade your card’s level" },
  { name: "leaderboard", emoji: "🏆", category: "Social", description: "Show top collectors and richest users (Coming Soon)" },
  { name: "vote", emoji: "🗳️", category: "Social", description: "Vote for rewards (Coming Soon)" },
  { name: "mine", emoji: "⛏️", category: "Economy", description: "Mine coins and treasures (Coming Soon)" },
  { name: "trade", emoji: "🔁", category: "Social", description: "Trade cards with your friends (Coming Soon)" },
  { name: "give", emoji: "🎁", category: "Social", description: "Gift cards to your friends (Coming Soon)" },
  { name: "War", emoji: "🎁", category: "Social", description: "Fight With You Friends Using Your Cards (The Biggest command, Comming Soon)" },
];

module.exports = {
  data: {
    name: 'help',
    description: 'Shows a list of all commands or details about a specific command',
    options: [
      {
        name: 'command',
        description: 'Get help for a specific command',
        type: ApplicationCommandOptionType.String,
        required: false,
      }
    ]
  },

  run: async ({ interaction, client }) => {
    const query = interaction.options.getString('command');

    if (query) {
      const cmd = commandList.find(c => c.name.toLowerCase() === query.toLowerCase());
      if (!cmd) {
        return interaction.reply({ content: `❌ Command \`${query}\` not found.`, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`${cmd.emoji || "✨"} Command: /${cmd.name}`)
        .setDescription(cmd.description)
        .setColor('#5865F2')
        .addFields(
          { name: 'Category', value: cmd.category || 'General', inline: true },
          { name: 'Status', value: cmd.description.includes('Soon') ? '🚧 Coming Soon' : '✅ Available', inline: true },
        )
        .setFooter({ text: 'Use /help to see all available commands!' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // Group by category for a better layout
    const categories = [...new Set(commandList.map(c => c.category))];
    const description = categories.map(cat => {
      const cmds = commandList.filter(c => c.category === cat);
      return `**${cat} Commands**\n${cmds.map(c => `> ${c.emoji} **/${c.name}** – ${c.description}`).join('\n')}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setTitle('🧭 Deckium Help Menu')
      .setDescription(
        "Use `/help <command>` for details on a specific command.\n" +
        "⚙️ More features are coming soon — we’re still in Stage 2!\n" +
        "💬 Join our [Main Server](https://discord.gg/f6PVKrN5k4) for updates and events.\n\n" +
        description
      )
      .setColor('#2b2d31')
      .setThumbnail('https://cdn.discordapp.com/emojis/1148813009457369168.webp?size=96&quality=lossless')
      .setFooter({ text: 'Collect • Trade • Upgrade • Dominate | Deckium', iconURL: 'https://cdn.discordapp.com/icons/1148813009457369168.webp' })
      .setTimestamp();

    // 🔗 Button Row
    const inviteButton = new ButtonBuilder()
      .setLabel('Add to Your Server')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);

    const supportButton = new ButtonBuilder()
      .setLabel('Join Support Server')
      .setStyle(ButtonStyle.Link)
      .setURL('https://discord.gg/f6PVKrN5k4');

    const row = new ActionRowBuilder().addComponents(inviteButton, supportButton);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
