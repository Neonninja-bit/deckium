const Card = require('../../schemas/cards.js');
const UserProfile = require("../../schemas/Userprofile.js");
const { 
  ApplicationCommandOptionType, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

module.exports = {
  run: async ({ interaction }) => {
    await interaction.deferReply();

    if (!interaction.inGuild()) {
      return interaction.editReply({ content: 'This command can only be executed in a server.', ephemeral: true });
    }

    // Fetch or create user profile
    let userProfile = await UserProfile.findOne({ userId: interaction.user.id }).populate('cards.cardId');
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: interaction.user.id,
        balance: 0,
        cards: [],
        slots: 10
      });
      await userProfile.save();
    }

    // Check inventory slots
    if (userProfile.cards.length >= userProfile.slots) {
      return interaction.editReply({
        content: "🚫 Your inventory is full! Buy more slots to add more cards.",
        ephemeral: true
      });
    }

    // Get the card code
    const cardCode = interaction.options.getString('code').toUpperCase();
    const card = await Card.findOne({ code: cardCode });

    if (!card) {
      return interaction.editReply({
        content: '❌ No card found with that code.',
        ephemeral: true
      });
    }

    // Check if user already owns the card
    const hasCard = userProfile.cards.some(c => c.cardId && c.cardId._id.toString() === card._id.toString());
    if (hasCard) {
      return interaction.editReply({
        content: "❌ You already own this card.",
        ephemeral: true
      });
    }

    // Check balance
    if (userProfile.balance < card.price) {
      return interaction.editReply({
        content: `❌ You need **⬡ ${card.price - userProfile.balance}** more coins to buy this card.`,
        ephemeral: true
      });
    }

    // 🪙 Deckium Cinematic Buy Confirmation
    const confirmEmbed = new EmbedBuilder()
      .setTitle(`<:5376itemcommonchest:1429755307952832563> Buy **${card.name}** Card`)
      .setDescription(
        `**${card.name}** card \n` +
        `Are you sure you want to buy this card for <:Coinprt3:1429743100477309039> **${card.price}**?\n\u200B`
      )
      .setImage(card.image)
      .setColor('#00B894')
      .setFooter({ text: `Deckium • Buy`, iconURL: interaction.user.displayAvatarURL() })
      .setThumbnail('https://cdn.discordapp.com/emojis/1289329081923020830.webp?size=96&quality=lossless');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_buy')
        .setEmoji('<:CheckMark:1433885524275363921>')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel_buy')
        .setEmoji('<:ErrorMark:1433888233854599361>')
        .setStyle(ButtonStyle.Danger)
    );

    const replyMsg = await interaction.editReply({
      embeds: [confirmEmbed],
      components: [buttons],
      fetchReply: true,
    });

    // 🎯 Collector for buttons
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = replyMsg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'confirm_buy') {
        // Deduct balance and add card
        userProfile.balance -= card.price;
        userProfile.cards.push({ cardId: card._id, level: 1 });
        await userProfile.save();
        await userProfile.populate('cards.cardId');

        const boughtEmbed = new EmbedBuilder()
          .setTitle(`<:143910verified:1429754669240160408> Purchase Successful!`)
          .setDescription(
            `You bought **${card.name}** card for <:Coinprt3:1429743100477309039> **${card.price}**!\n` +
            `You now have <:Coinprt3:1429743100477309039> **${userProfile.balance}** left.`
          )
          .setColor('#00ff9c')
          .setImage(card.image)
          .setFooter({ text: 'Deckium • Buy' });

        await i.update({ embeds: [boughtEmbed], components: [] });
      } else if (i.customId === 'cancel_buy') {
        const cancelEmbed = new EmbedBuilder()
          .setTitle(`<:ErrorMark:1433888233854599361> Purchase Canceled`)
          .setDescription(`You decided not to buy **${card.name}**.`)
          .setColor('#5865F2')
          .setImage(card.image)
          .setFooter({ text: 'Deckium • Buy' });

        await i.update({ embeds: [cancelEmbed], components: [] });
      }
    });

    collector.on('end', async (collected) => {
      if (!collected.size) {
        await replyMsg.edit({
          content: '⌛ Timed out — no action taken.',
          embeds: [],
          components: [],
        });
      }
    });
  },

  data: {
    name: 'buy',
    description: 'You can buy cards using this command.',
    options: [
      {
        name: 'code',
        description: "The card's code that you want to buy",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
};
