const mongoose = require('mongoose');
const EventDateInfosSchema = require('./EventDateInfos');

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    infos: {
        type: String,
        required: true
    },
    classification: {
        type: String,
        required: true
    },
    ticketSell: {
        type: String,
        required: true
    },
    ticketPrice: {
        type: String,
        required: true
    },
    sectorImage: {
        type: String,
        required: true
    },
    dates: {
        type: [EventDateInfosSchema]
    }
});

module.exports = mongoose.model('Event', EventSchema);