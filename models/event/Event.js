const mongoose = require('mongoose');
const EventDateInfosSchema = require('./EventDateInfos');

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dates: {
        type: [EventDateInfosSchema],
        required: true
    },
    name: {
        
    }
});

module.exports = mongoose.model('Event', EventSchema);