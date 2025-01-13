const mongoose = require('mongoose');

const EventTicketSchema = new mongoose.Schema({
    sector: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    value: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: String,
        required: true
    },
    soldAmount: {
        type: String,
        required: true
    }
});

module.exports = EventTicketSchema;
