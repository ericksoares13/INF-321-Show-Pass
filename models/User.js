const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    admin: {
        type: Boolean,
        require: true
    },
    name: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    cpf: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    cellphone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);
