const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    phoneNumber: {type: String, required: true},
    otp: {type: Number}
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = {UserModel};