const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    events: [
        {
            type: mongoose.ObjectId,
            ref: 'Event',
            required: true
        }
    ]
});

module.exports = mongoose.model('Section', SectionSchema);