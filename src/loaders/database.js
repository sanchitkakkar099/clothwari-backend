const mongoose = require("mongoose");

module.exports = () => {
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/clothwari')
            .then(() => console.log('Database Connected!'));
    } catch (error) {
        console.log("error in database connection");
    }
}