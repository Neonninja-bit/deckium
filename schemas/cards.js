const { Schema, model } = require('mongoose');

const cardSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    rarity: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,   // 👈 ensures no duplicate codes
    },
    rate: {
        type: Number,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        unique: false,
    }
}, { timestamps: true });  // 👈 fixed typo

module.exports = model('Card', cardSchema);
