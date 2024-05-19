const mongoose = require("mongoose");
require("dotenv").config();

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to the database");
    } catch (error) {
        console.log(error);
        throw new Error("Could not connect to the database !!!");
    }
};

module.exports = {
    connection,
};
