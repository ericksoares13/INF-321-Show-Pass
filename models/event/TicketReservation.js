const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    sector: {
        type: String,
        required: true
    },
    ticketType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const TicketReservationSchema = new mongoose.Schema({
    eventLink: {
        type: String,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.ObjectId,
        required: true
    },
    tickets: {
        type: [TicketSchema],
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: {
            expires: '10m'
        }
    }
});

TicketReservationSchema.index({ eventLink: 1, index: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TicketReservation', TicketReservationSchema);
