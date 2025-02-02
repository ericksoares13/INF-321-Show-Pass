const mongoose = require('mongoose');

const EventDateInfosSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    locale: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    tickets: {
        type: [mongoose.ObjectId],
        ref: 'EventTicket',
        required: true
    }
});

module.exports = mongoose.model('EventDateInfos', EventDateInfosSchema);
