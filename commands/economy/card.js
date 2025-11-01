const { ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const sharp = require("sharp");
const fetch = require("node-fetch"); // npm install node-fetch@2
const path = require("path");
const Card = require("../../schemas/cards.js");
const UserProfile = require("../../schemas/Userprofile.js");

module.exports = {
    run: async ({ interaction }) => {

        await interaction.deferReply();

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

        // Find the actual card in user's collection
        const userCard = userProfile.cards.find(c => c.cardId && c.cardId.toString() === card._id.toString());
        const level = userCard?.level || 1; // exact stored level

        // --- Fetch the card image from URL ---
const response = await fetch(card.image);
if (!response.ok) return interaction.editReply("❌ Failed to fetch card image.");
const cardImageBuffer = await response.buffer();

// --- Get actual image dimensions ---
const metadata = await sharp(cardImageBuffer).metadata();
const width = metadata.width;
const height = metadata.height;

// --- Calculate positions ---
const centerX = width / 2;
const bottomY = height - 52;

// --- Create SVG overlay ---
const svgText = `
<svg width="${width}" height="${height}">
  <style>
    @font-face {
      font-family: 'Greater Theory';
      src: url('file://${path.join(__dirname, "../../fonts/GreaterTheory.otf")}');
    }
    .code { fill: #000000ff; font-size: 40px; font-family: 'Greater Theory'; text-anchor: end; }
    .level { fill: #00FF00; font-size: 40px; font-family: 'Greater Theory'; text-anchor: start; }
  </style>
  <text x="${centerX - 10}" y="${bottomY}" class="code">${card.code}</text>
  <text x="${centerX + 50}" y="${bottomY}" class="level">${level}</text>
</svg>
`;

// --- Composite SVG on card image with Sharp ---
const finalBuffer = await sharp(cardImageBuffer)
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .png()
    .toBuffer();



// Convert Sharp result to Discord attachment
const attachment = new AttachmentBuilder(finalBuffer, { name: `${card.code}_card.png` });

        // --- Send embed ---
        const embed = new EmbedBuilder()
            .setDescription(`
<:854998stars:1429756376661364817> **Rarity:** \`${card.rarity}\`
<a:98074money:1429747976825471016> **Price:** **⬡** ${card.price}
`)
            .setColor(card.rarity === "Impossible" ? "#FFD700" : "#C0C0C0")
            .setFooter({
                text: userCard ? "✅ You have this card" : "❌ You don't have this card",
            })
            .setTimestamp()
            .setImage(`attachment://${card.code}_card.png`);

        // Send embed with the image
await interaction.editReply({
    embeds: [embed],
    files: [attachment],
});
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
