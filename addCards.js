const mongoose = require("mongoose");
const Card = require("./schemas/cards"); // your schema path
require('dotenv/config'); // load .env

async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Database Connected.');

        // Cards to add
        const cards = [
            {name: 'Hermione Granger', image: 'https://i.imgur.com/aGtPI8Y.jpeg', rarity: 'Impossible', code: 'HP2', price: 10000},
            {name: 'Harry Potter', image: 'https://i.imgur.com/0kNUYFv.jpeg', rarity: 'Impossible', code: 'HP1', price: 100}
        ];

        // Insert cards
        await Card.insertMany(cards);
        console.log('✅ Cards added to database.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        // Disconnect
        await mongoose.disconnect();
        console.log('🛑 Database Disconnected.');
    }
}

main(); // Run the async function
