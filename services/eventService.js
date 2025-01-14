const Event = require('../models/event/Event');

class EventService {
    async getAllEvents() {
        return await Event.find({});
    }

    async createEvent(event) {
    }

    async getCarousel() {
        const events = await Event.find({});

        return events.map(element => ({
            'name': element.name,
            'image': element.image,
            'description': element.description,
            'link': element.link
        }));
    }

    async getEventsSections() {
        const events = await Event.find({});
        const array = events.map(element => ({
            'name': element.name,
            'image': element.image,
            'description': element.description,
            'link': element.link
        }));

        return [
            {
                'section': 'Para toda a família',
                'events': array.slice(0, 3)
            },
            {
                'section': 'Destaques da semana',
                'events': [array[0], array[1], array[3]]
            }
        ];
    }
}

module.exports = new EventService();
