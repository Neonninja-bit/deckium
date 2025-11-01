const Userprofile = require("../../schemas/Userprofile");
const { EmbedBuilder, Colors } = require("discord.js");

const coinEmoji = "<:Coinprt3:1429743100477309039>";

module.exports = {
    run: async ({ interaction }) => {
        const targetUser = interaction.options.getUser("target-user") || interaction.user;
        const targetUserId = targetUser.id;

        try {
            // Acknowledge the interaction early
            await interaction.deferReply();

            let userProfile = await Userprofile.findOne({ userId: targetUserId });

            if (!userProfile) {
                userProfile = new Userprofile({
                    userId: targetUserId,
                    balance: 0,
                    cards: [],
                });
                await userProfile.save();
            }

            const cardCount = userProfile.cards?.length ? userProfile.cards.length : 0;
            const balance = userProfile.balance || 0;

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${targetUser.username}'s Balance`,
                    iconURL: targetUser.displayAvatarURL()
                })
                .setDescription(
                    `<a:98074money:1429747976825471016> **Current Balance:** ${coinEmoji} ${balance.toLocaleString()}\n` +
                    `<:40915whalecard:1429749194993827890> **Total Cards:** ${cardCount > 0 ? cardCount : "No Cards Yet"}`
                )
                .setColor(Colors.Green)
                .setFooter({
                    text: `Deckium Bot • Balance`
                });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error handling /balance command:", error);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply("❌ Something went wrong while fetching balance.");
            } else {
                await interaction.reply({ content: "❌ Something went wrong.", ephemeral: true });
            }
        }
    },

    data: {
        name: "balance",
        description: "Check your balance easily",
        options: [
            {
                name: "target-user",
                description: "The user whose balance you want to see",
                type: 6, // USER
            },
        ],
    },
};
