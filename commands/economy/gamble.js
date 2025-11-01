const { options, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Userprofile = require("../../schemas/Userprofile");

module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: `You can only execute this command in a server`,
                ephemeral: true,
            });
            return;
        }

        const amount = interaction.options.getNumber('amount');

        if (amount < 10) {
            interaction.reply('You must gamble at least **⬡** 10');
            return;
        }

        let userProfile = await Userprofile.findOne({
            userId: interaction.user.id,
        });

        if (!userProfile) {
            userProfile = new Userprofile({
                userId: interaction.user.id
            });
        }
if (userProfile) {
            if (amount > userProfile.balance) {
                interaction.reply(`You Don't have enough balance`);
                return;
            };

            const didWin = Math.random() > 0.5;

            if (!didWin) {
                userProfile.balance -= amount;
                await userProfile.save()

                interaction.reply(`You Didn't win anything this time Try again!`);
                return;
            }

            const amountWon = Number((amount * (Math.random() + 0.55)).toFixed(0));

            userProfile.balance += amountWon;
            await userProfile.save()

            const gambleEmbed = new EmbedBuilder()
  .setColor("#000000") // black color
  .setTitle("<:65115tada:1429757397252968579> Gamble Result!")
  .setDescription(
    `You won **<:Coinprt3:1429743100477309039> ${amountWon.toLocaleString()}**!\n` +
    `<a:98074money:1429747976825471016> New Balance: **<:Coinprt3:1429743100477309039> ${userProfile.balance.toLocaleString()}**`
  )
  .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
  .setFooter({ text: "Deckium Bot • Gamble" })
  .setTimestamp();

await interaction.reply({ embeds: [gambleEmbed] });
        }

        // Add the rest of your gambling logic here
    },
    data: {
        name: 'gamble',
        description: 'Gamble and earn some Money',
        options: [
            {
                name: 'amount',
                description: 'The Amount you want to gamble',
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    }
}