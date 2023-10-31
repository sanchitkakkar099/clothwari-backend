const mongoose = require("mongoose");

module.exports = () => {
    try {
        mongoose.connect(process.env.MONGODB_URL)
            .then(() => console.log('Database Connected!'));
        mongoose.set('debug', true)
    } catch (error) {
        console.log("error in database connection");
    }
}