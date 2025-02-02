const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.ObjectId,
        ref: 'Event',
        required: true
    },
    dateId: {
        type: mongoose.ObjectId,
        ref: 'EventDateInfos',
        required: true
    },
    tickets: [{
        ticketId: {
            type: mongoose.ObjectId,
            ref: 'EventTicket',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    orderDate: {
        type: Date,
        required: true
    },
    orderNum: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Order', OrderSchema);
