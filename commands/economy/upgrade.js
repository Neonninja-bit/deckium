const UserProfile = require("../../schemas/Userprofile"); // user schema 
const Card = require("../../schemas/cards");             // card schema
const mongoose = require("mongoose");
const { EmbedBuilder } = require( "discord.js" )

module.exports = {
    data: {
        name: "upgrade",
        description: "Upgrade one of your cards by code",
        options: [
            {
                name: "code",
                description: "Card code (e.g., HP2)",
                type: 3, // STRING
                required: true,
            }
        ]
    },

    run: async ({ interaction }) => {
        const code = interaction.options.getString("code").toUpperCase();
        const userId = interaction.user.id;

        try {
            // 1️⃣ Get card info
            const card = await Card.findOne({ code });
            if (!card) {
                return interaction.reply({ content: `❌ Card with code **${code}** not found.`, ephemeral: true });
            }

            // 2️⃣ Get user profile
            const profile = await UserProfile.findOne({ userId });
            if (!profile) {
                        profile = new Userprofile({ userId, balance: 0, cards: [], slots: 10 });
                        await profile.save();
                    }

            // 3️⃣ Find if user owns that card
            const userCard = profile.cards.find(c => c.cardId?.toString() === card._id.toString());
            if (!userCard) {
                return interaction.reply({ content: `❌ You don’t own **${card.name}** (${card.code}).`, ephemeral: true });
            }

            // 4️⃣ Check max level
            const MAX_LEVEL = 6;
            if (userCard.level >= MAX_LEVEL) {
                return interaction.reply({ content: `❌ **${card.name}** is already at max level (${MAX_LEVEL}).`, ephemeral: true });
            }

            // 5️⃣ Calculate upgrade cost per level
            const upgradeCosts = [1000000, 1500000, 2000000, 3500000, 5000000]; // level 1 → 2, 2 → 3, ...
            const upgradeCost = upgradeCosts[userCard.level - 1]; // level 1 costs index 0, etc.

            const needCost = upgradeCost - profile.balance
            if (profile.balance < upgradeCost) {
                return interaction.reply({ content: `💰 You need **${needCost}** coins to upgrade.`, ephemeral: true });
            }

            // 6️⃣ Deduct balance and upgrade
            profile.balance -= upgradeCost;
            userCard.level += 1;
            await profile.save();

            // 7️⃣ Reply
            const upgradeEmbed = new EmbedBuilder()
  .setColor("#000000") // black color
  .setTitle("<:143910verified:1429754669240160408> Card Upgraded!")
  .setDescription(
    `**${card.name}** (${card.code}) has been upgraded to level **${userCard.level}**!\n\n` +
    `<:50266diamond1criticalops:1429759118050201741> **Upgrade Cost:** ⬡ ${upgradeCost.toLocaleString()}\n` +
    `<a:98074money:1429747976825471016> **Remaining Balance:** ⬡ ${profile.balance.toLocaleString()}`
  )
  .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
  .setFooter({ text: "Deckium Bot • Upgrade" })
  .setTimestamp();

await interaction.reply({ embeds: [upgradeEmbed] });

        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "⚠️ An error occurred while upgrading.", ephemeral: true });
        }
    }
};
