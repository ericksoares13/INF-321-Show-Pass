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
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    soldAmount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('EventTicket', EventTicketSchema);
