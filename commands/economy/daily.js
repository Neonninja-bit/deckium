const { EmbedBuilder, Colors } = require('discord.js');
const UserProfile = require('../../schemas/Userprofile.js');
const Card = require('../../schemas/cards.js');

const dailyAmount = 10000;
const coinEmoji = '<:Coinprt3:1429743100477309039>';

const rarityColors = {
  Common: Colors.Gray,
  Uncommon: Colors.Green,
  Rare: Colors.Blue,
  Legendary: Colors.Gold,
  Impossible: Colors.Purple
};

module.exports = {
  run: async ({ interaction }) => {
    await interaction.deferReply();

    try {
      let userProfile = await UserProfile.findOne({ userId: interaction.user.id });

      if (!userProfile) {
        userProfile = new UserProfile({
          userId: interaction.user.id,
          balance: 0,
          cards: [],
          slots: 10,
        });
      }

      const lastDailyDate = userProfile.lastDailyCollected?.toDateString();
      const currentDate = new Date().toDateString();

      if (lastDailyDate === currentDate) {
        return interaction.editReply('You have already collected your daily reward. Come back tomorrow..!');
      }

      if (userProfile.cards.length >= userProfile.slots) {
        return interaction.editReply({
          content: "🚫 Your inventory is full! Buy more slots to take your daily reward."
        });
      }

      userProfile.balance += dailyAmount;
      userProfile.lastDailyCollected = new Date();

      const totalCards = await Card.countDocuments();
      if (totalCards === 0) {
        return interaction.editReply("❌ No cards available to reward!");
      }

      const ownedIds = userProfile.cards.map(c => c.cardId);
      const unownedCards = await Card.find({ _id: { $nin: ownedIds } });

      if (unownedCards.length === 0) {
        return interaction.editReply("You already own all cards!");
      }

      const randomIndex = Math.floor(Math.random() * unownedCards.length);
      const dailyCard = unownedCards[randomIndex];

      userProfile.cards.push({ cardId: dailyCard._id, level: 1 });
      await userProfile.save();

      const embed = new EmbedBuilder()
        .setTitle("<:65115tada:1429757397252968579> Daily Reward Collected!")
        .setDescription(
          `${coinEmoji} **+${dailyAmount.toLocaleString()} coins**\n` +
          `<:40915whalecard:1429749194993827890> New Card: ${dailyCard.name} (${dailyCard.rarity})`
        )
        .setImage(dailyCard.image)
        .setColor(rarityColors[dailyCard.rarity] || Colors.Random)
        .setFooter({ text: ` New Balance: ${userProfile.balance.toLocaleString()}` });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("Error handling /daily:", error);
      try { await interaction.editReply("⚠️ Something went wrong while collecting your daily reward."); } catch {}
    }
  },

  data: {
    name: 'daily',
    description: 'Collect your daily reward (coins + card)',
  },
};
