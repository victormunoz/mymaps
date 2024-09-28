const mongoose = require('mongoose');
const Constants = require("../config/constants");


// define the schema for our user model
const Schema = mongoose.Schema(
    {
        email : String,
        name: String,
        password: String,
        role:String,
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('User', Schema);

