const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Userprofile = require("../../schemas/Userprofile");
const Card = require("../../schemas/cards");

module.exports = {
    run: async ({ interaction }) => {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        // 🧠 Fetch or create profile
        let userProfile = await Userprofile.findOne({ userId: targetUser.id });
        if (!userProfile) {
            userProfile = new Userprofile({ userId: targetUser.id, balance: 0, cards: [], slots: 10 });
            await userProfile.save();
        }

        const userCardsRaw = userProfile.cards || [];

        // ✅ Map cardIds properly
        const cardIds = userCardsRaw.map(c => c.cardId || c);
        const baseCards = await Card.find({ _id: { $in: cardIds } });

        // 🧩 Merge user cards with base card info
const userCards = userCardsRaw.map(uc => {
    if (!uc?.cardId) return null; // skip invalid entries
    const base = baseCards.find(bc => bc._id.toString() === uc.cardId.toString());
    if (!base) return null;
    return {
        name: base.name,
        rarity: base.rarity,
        code: base.code,
        level: uc.level || 1,
    };
}).filter(Boolean);


        // 🎨 Rarity emojis
        const rarityEmojis = {
            "Impossible": "🟥",
            "Legendary": "🟨",
            "Epic": "🟦",
            "Rare": "🟩",
            "Common": "⚪",
        };

        // 🧾 Build card list
        const cardList = userCards.map(c => {
            const rarityIcon = rarityEmojis[c.rarity] || "❔";
            const levelStars = "<:50266diamond1criticalops:1429759118050201741>".repeat(c.level);
            return `${rarityIcon} **${c.name}** [${c.rarity}] ${levelStars} (Code: \`${c.code}\`)`;
        }).join("\n");

        // 🧱 Embed
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${targetUser.username}'s Inventory`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(cardList || "*No cards in inventory yet.*")
            .addFields(
                { name: "<:3457stats:1429759365245829151> Collection Stats", value: `Total Cards: **${userCards.length}**`, inline: true },
                { name: "<:5376itemcommonchest:1429755307952832563> Inventory Slots", value: `${userProfile.cards.length}/${userProfile.slots || 10}`, inline: true },
            )
            .setColor('#000000')
            .setThumbnail("https://i.imgur.com/XK0x4Yz.png")
            .setFooter({ text: "Deckium Bot • inventory" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    data: {
        name: "inventory",
        description: `View somebody's inventory, leave empty to view your own.`,
        options: [
            {
                name: "user",
                description: `See another user's inventory.`,
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ],
    },
};
