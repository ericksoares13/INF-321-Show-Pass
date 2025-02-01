const mongoose = require('mongoose');
const EventTicketSchema = require('./EventTicket');

const EventDateInfosSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true,
        unique: true
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
        type: [EventTicketSchema],
        required: true
    }
});

module.exports = EventDateInfosSchema;
