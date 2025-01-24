const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
    events: [
        {
            type: mongoose.ObjectId,
            ref: 'Event',
            required: true
        }
    ]
});

module.exports = mongoose.model('Carousel', CarouselSchema);