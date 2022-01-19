'use strict'

var mongoose = require('mongoose'); //Import methods for model
var Schema = mongoose.Schema; //Use schema from mongoose

//Model
var UserSchema = Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    image: String,
    role: String
});

UserSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;

    return obj;
}

//Export model
module.exports = mongoose.model('User',UserSchema); //lowercase and pluralize objects ex. users

