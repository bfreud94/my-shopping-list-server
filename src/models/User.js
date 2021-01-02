const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
};

const UserSchema = mongoose.Schema({
    firstName: requiredString,
    lastName: {
        type: String
    },
    email: requiredString,
    password: requiredString
});

module.exports = mongoose.model('users', UserSchema);