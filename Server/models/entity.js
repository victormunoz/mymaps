const mongoose = require('mongoose');
const Constants = require("../config/constants");


// define the schema for our user model
const Schema = mongoose.Schema(
    {
        adminMail: String,
        name: String,
        password: String,
        role:String,
        identity: String,
        address: String,
        version	: String,
        status: String,
    }
);


// create the model for users and expose it to our app
module.exports = mongoose.model('Entity', Schema);

