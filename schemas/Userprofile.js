const { Schema, model } = require('mongoose');

const userProfileSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastDailyCollected: {
    type: Date,
  },
  cards: [
    {
      cardId: { type: Schema.Types.ObjectId, ref: 'Card' },
      level: { type: Number, default: 1 } // 👈 every new card starts at level 1
    }
  ],
  slots: { type: Number, default: 10 }, // max cards they can hold

}, { timestamps: true });

module.exports = model('UserProfile', userProfileSchema);
