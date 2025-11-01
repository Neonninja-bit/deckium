const prettyMilliseconds = require("pretty-ms");

const { EmbedBuilder } = require("discord.js")
const Cooldown = require("../../schemas/cooldown");
const Userprofile = require("../../schemas/Userprofile");

function getRandomNumber(x, y) {
    const range = y - x + 1;
    const randomNumber = Math.floor(Math.random() * range);
    return randomNumber + x; 
}


module.exports = {
    run: async ({ interaction }) => {
        if (!interaction.inGuild()) {
            await interaction.reply({
                content: 'You can Only use this command in a server',
                ephemeral: true,
            }); 
            return;
        }

        try {
            await interaction.deferReply();

            const commandName = 'beg';
            const userId = interaction.user.id;

            let cooldown = await Cooldown.findOne({ userId, commandName })

            if (cooldown && Date.now() < cooldown.endsAt) {
                const {} = await import('pretty-ms');

                await interaction.editReply(
                    `You're on a cooldown, come back after ${prettyMilliseconds(cooldown.endsAt - Date.now())}`
                );
                return;
            }

            if (!cooldown) {
                cooldown = new Cooldown({ userId, commandName });
            }

            const chance = getRandomNumber(0, 100);

            if (chance < 30) {
                await interaction.editReply(
                    `Oh! You didn't get anything this time try again later 😭`
                )

                cooldown.endsAt = Date.now() + 300_000;
                await cooldown.save();
                return;
            };
            

            const amount = getRandomNumber(200, 1500);

            let userProfile = await Userprofile.findOne({ userId }).select('userId balance')

            if (!userProfile) { 
                userProfile = new Userprofile({ userId })
            };

            userProfile.balance += amount;

            cooldown.endsAt = Date.now() + 300_000;

            await Promise.all([cooldown.save(), userProfile.save()])

const begEmbed = new EmbedBuilder()
  .setColor("#f1c40f") // goldish color for coins
  .setTitle("<:95235poorhomeless:1429748038934597642> Beg Results")
  .setDescription(
    `You got **<:Coinprt3:1429743100477309039> ${amount.toLocaleString()}**\n` +
    `<a:98074money:1429747976825471016> New Balance: **<:Coinprt3:1429743100477309039> ${userProfile.balance.toLocaleString()}**`
  )
  .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
  .setFooter({
    text: "Deckium Bot • Beg",
  })
  .setTimestamp();

await interaction.editReply({ embeds: [begEmbed] });

        } catch (error) {
            console.log(`error handling /beg ${error}`);
        }
    },
    data: {
        name: 'beg',
        description: 'Beg to get some money.'
    }
}