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
      await interaction.editReply('This command can only be executed in a server.');
      return;
    }

    let userProfile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      userProfile = new UserProfile({
        userId: interaction.user.id,
        balance: 0,
        cards: [],
        slots: 10,
      });
      await userProfile.save();
    }

    const cardcode = interaction.options.getString('code').toUpperCase();
    const card = await Card.findOne({ code: cardcode });

    if (!card) {
      await interaction.editReply({ content: '❌ No card found with that code.', ephemeral: true });
      return;
    }

    const hasCard = userProfile.cards.some(c => c.cardId.toString() === card._id.toString());
    if (!hasCard) {
      await interaction.editReply({ content: `<:40915whalecard:1429749194993827890> You don’t own the **${card.name}** card.`, ephemeral: true });
      return;
    }

    const cardSell = Math.floor(card.price * 0.5);

    // 🎴 Deckium Cinematic Confirmation Embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle(`<:5376itemcommonchest:1429755307952832563> Sell **${card.name}** Card.`)
      .setDescription(
        `**${card.name}**\n` +
        `Are you sure you want to sell this card for <:Coinprt3:1429743100477309039> **${cardSell}**?`
      )
      .setImage(card.image) // 🖼️ Card image added
      .setColor('#00B894')
      .setFooter({ text: `Deckium • Sell`, iconURL: interaction.user.displayAvatarURL() })
      .setThumbnail('https://cdn.discordapp.com/emojis/1289329081923020830.webp?size=96&quality=lossless')

    // 🎨 Sleek Custom Buttons (Emojis Only)
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_sell')
        .setEmoji('<:CheckMark:1433885524275363921>')
        .setStyle(ButtonStyle.Secondary), // neutral look
      new ButtonBuilder()
        .setCustomId('cancel_sell')
        .setEmoji('<:ErrorMark:1433888233854599361>')
        .setStyle(ButtonStyle.Secondary)
    );

    const replyMsg = await interaction.editReply({
      embeds: [confirmEmbed],
      components: [buttons],
      fetchReply: true,
    });

    // Collector for response
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = replyMsg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'confirm_sell') {
        userProfile.cards = userProfile.cards.filter(
          c => c.cardId.toString() !== card._id.toString()
        );
        userProfile.balance += cardSell;
        await userProfile.save();

        const soldEmbed = new EmbedBuilder()
          .setTitle(`<:143910verified:1429754669240160408> Successfully Sold The **${card.name}** card.`)
          .setDescription(`**${card.name}** card sold for <:Coinprt3:1429743100477309039> **${cardSell}!**`)
          .setColor('#00ff9c')
          .setImage(card.image)
          .setFooter({ text: 'Deckium • Sell' });

        await i.update({
          embeds: [soldEmbed],
          components: [],
        });
      } else if (i.customId === 'cancel_sell') {
        const cancelEmbed = new EmbedBuilder()
          .setTitle(`<:ErrorMark:1433888233854599361> You Cancelled Selling The **${card.name}** card.`)
          .setDescription(`You did not sell the **${card.name}** card.`)
          .setColor('#5865F2')
          .setImage(card.image)
          .setFooter({text: 'Deckium • Sell'});

        await i.update({
          embeds: [cancelEmbed],
          components: [],
        });
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
    name: 'sell',
    description: 'Sell a card from your collection.',
    options: [
      {
        name: 'code',
        description: `The card's code that you want to sell.`,
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
};
