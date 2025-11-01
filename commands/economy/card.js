const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Card = require("../../schemas/cards.js");
const UserProfile = require("../../schemas/Userprofile.js");

module.exports = {
    run: async ({ interaction }) => {
        const cardCode = interaction.options.getString("code").toUpperCase();
        const card = await Card.findOne({ code: cardCode });

        if (!card) {
            return interaction.reply({
                content: "❌ No Card Found With That Code",
                ephemeral: true,
            });
        }

        // Find or create user profile
        let userProfile = await UserProfile.findOne({ userId: interaction.user.id });
        if (!userProfile) {
            userProfile = new UserProfile({
                userId: interaction.user.id,
                balance: 0,
                cards: [],
            });
            await userProfile.save();
        }

        // Check if the user owns the card
        const hasCard = userProfile.cards.some(c => c.cardId && c.cardId._id.toString() === card._id.toString());

        // Build the embed
        const embed = new EmbedBuilder()
            .setTitle(`**${card.name}**`)
            .setURL(`https://example.com/cards/${card.code}`)
            .setDescription(`
            An official card from the **${card.name}** collection.
            
            <:854998stars:1429756376661364817> **Rarity:** \`${card.rarity}\`
            <a:4297pepehacker:1429756834255999057> **Code:** \`${card.code}\`
            <a:98074money:1429747976825471016> **Price:** **⬡** ${card.price}
            `)
            .setImage(card.image)
            .setColor(card.rarity === "Impossible" ? "#FFD700" : "#C0C0C0")
            .setFooter({
                text: hasCard ? "✅ You have this card" : "❌ You don't have this card",
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    data: {
        name: "card",
        description: "View Card Stats and Photos of the card",
        options: [
            {
                name: "code",
                description: "The code of the card that you want to view",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
};
