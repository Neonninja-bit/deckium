const { CommandInteraction, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserProfile = require("../../schemas/Userprofile"); // adjust path if needed

module.exports = {
    data: {
        name: "buy-slots",
        description: "Buy extra inventory slots for your cards",
        options: [
            {
                name: "amount",
                description: "How many slots do you want to buy?",
                type: 4, // INTEGER
                required: true
            }
        ]
    },

    /**
     * @param {CommandInteraction} interaction
     */
    run: async ({ interaction }) => {
        const userId = interaction.user.id;
        const amount = interaction.options.getInteger("amount");

        // Cost per slot
        const slotPrice = 100000;
        const totalCost = slotPrice * amount;

        let userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
          userProfile = new UserProfile({
            userId: interaction.user.id,
            balance: 0,
            cards: [],
            slots: 10,
          });
        }

        if (amount <= 0) {
            return interaction.reply("🚫 You must buy at least 1 slot.");
        }

        if (userProfile.balance < totalCost) {
            return interaction.reply(`❌ You need ⬡ ${totalCost} to buy ${amount} slots, but you only have ⬡ ${userProfile.balance}.`);
        }

        // Deduct balance and increase slots
        userProfile.balance -= totalCost;
        userProfile.slots = (userProfile.slots || 10) + amount; // default 10 if not set
        await userProfile.save();

        const embed = new EmbedBuilder()
            .setTitle("<:5376itemcommonchest:1429755307952832563> Inventory Expanded!")
            .setDescription(`<:143910verified:1429754669240160408> You bought **${amount} slot(s)** for <:Coinprt3:1429743100477309039> ${totalCost}.`)
            .addFields(
                { name: "New Slot Capacity", value: `${userProfile.slots}`, inline: true },
                { name: "Remaining Balance", value: `⬡ ${userProfile.balance}`, inline: true }
            )
            .setColor("Green")
            .setFooter({ text: "Deckium Bot • Slot Expansion" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
