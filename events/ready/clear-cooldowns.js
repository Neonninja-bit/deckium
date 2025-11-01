const Cooldown = require("../../schemas/cooldown");

module.exports = () => {
    setInterval( async () => {
        try {
            // check the selct shi also
            const cooldowns = await Cooldown.find().select('endsAt');
// check this in chatgpt
            for (const cooldown of cooldowns) {
                if (Date.now() < cooldown.endsAt) return;

                await cooldown.deleteOne({ _id: cooldown._id });

            }
        } catch (error) {
            console.log(`Error Clearing Cooldowns: ${error}`)
        }
        
    }, 3.6e+6);

}