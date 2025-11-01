const { EmbedBuilder, Colors } = require("discord.js");
const Card = require("../../schemas/cards.js");
const UserProfile = require("../../schemas/Userprofile.js");
const Cooldown = require("../../schemas/cooldown.js");

module.exports = {
    run: async ({ interaction }) => {
        // Only allow in server
        if (!interaction.inGuild()) {
            return interaction.reply({ content: "❌ This command can only be executed in a server.", ephemeral: true });
        }

        // 1️⃣ Defer reply for async DB calls
        await interaction.deferReply();

        // 2️⃣ Get or create user profile
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

        // 3️⃣ Check cooldown
        const cooldownTime = 1000 * 60 * 60; // 1 hour
        const cd = await Cooldown.findOne({ commandName: "drop", userId: interaction.user.id });

        if (cd && cd.endsAt > Date.now()) {
            const unix = Math.floor(cd.endsAt.getTime() / 1000);
            return interaction.editReply({ content: `⏳ You can use this command again <t:${unix}:R>.`, ephemeral: true });
        }
        

        // 4️⃣ Get unowned cards
        const ownedIds = userProfile.cards.map(c => c.cardId);
        const unownedCards = await Card.find({ _id: { $nin: ownedIds } });

        if (unownedCards.length === 0) {
            return interaction.editReply({ content: "❌ You already own all the cards!" });
        }

        // 5️⃣ Inventory check
        if (userProfile.cards.length >= userProfile.slots) {
            return interaction.editReply({ content: "🚫 Your inventory is full! Buy more slots to add more cards.", ephemeral: true });
        }

        // 6️⃣ Pick a random card
        const dropCard = unownedCards[Math.floor(Math.random() * unownedCards.length)];

        // 7️⃣ Add cooldown
        await Cooldown.findOneAndUpdate(
            { commandName: "drop", userId: interaction.user.id },
            { endsAt: new Date(Date.now() + cooldownTime) },
            { upsert: true }
        );

        // 8️⃣ Add card to user profile (duplicate-proof)
        userProfile.cards.push({ cardId: dropCard._id, level: 1 });
        await userProfile.save();

        // 9️⃣ Build embed with emojis and rarity color
        const rarityColors = {
            Common: Colors.Gray,
            Uncommon: Colors.Green,
            Rare: Colors.Blue,
            Legendary: Colors.Gold,
            Impossible: Colors.Purple
        };

        const embed = new EmbedBuilder()
            .setTitle("<:65115tada:1429757397252968579> Drop Card Collected!")
            .setDescription(
                `<:40915whalecard:1429749194993827890> **Dropped Card:** ${dropCard.name} (${dropCard.rarity})\n` +
                `🪙 **Price:** **<:Coinprt3:1429743100477309039>** ${dropCard.price}`
            )
            .setImage(dropCard.image)
            .setColor(rarityColors[dropCard.rarity] || Colors.Random)
            .setFooter({ text: "Collect, trade, and upgrade your cards!" });

        // 10️⃣ Send embed
        await interaction.editReply({ embeds: [embed] });
    },

    data: {
        name: "drop",
        description: "Drop Some Cards",
    },
};
