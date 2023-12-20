const mongoose = require("mongoose");

module.exports = async () => {
    try {
        mongoose.connect("mongodb+srv://user:eh9pawgjRZqZTjQx@cluster0.qtt9p2f.mongodb.net/clothwari")    //process.env.MONGODB_URL)
            .then(() => console.log('Database Connected!'));
        mongoose.set('debug', true)
    } catch (error) {
        console.log("error in database connection");
    }
}