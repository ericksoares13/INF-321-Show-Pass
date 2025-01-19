const Event = require('../models/event/Event');

class EventService {
    async getAllEvents() {
        return await Event.find({});
    }

    async createEvent(event) {
    }

    async getCarousel() {
        const events = await Event.find({});

        const carouselEvents = events.map(element => ({
            'name': element.name,
            'image': element.image,
            'description': element.description,
            'link': 'eventos/olivia-rodrigo'
        }));

        return carouselEvents.slice(3, 7);
    }

    async getEventsSections() {
        const events = await Event.find({});
        const array = events.map(element => ({
            'name': element.name,
            'image': element.image,
            'description': element.description,
            'link': 'eventos/olivia-rodrigo'
        }));

        return [
            {
                'section': 'Para toda a família',
                'events': array.slice(0, 3)
            },
            {
                'section': 'Destaques da semana',
                'events': [array[3], array[4], array[6]]
            }
        ];
    }
}

module.exports = new EventService();
