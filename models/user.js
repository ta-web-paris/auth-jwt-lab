const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const {Schema} = mongoose;

const userSchema = new Schema ({
    name: {
        type: String,
        required: true,
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);