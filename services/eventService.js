const Event = require('../models/event/Event');
const Carousel = require('../models/event/sections/Carousel');
const Section = require('../models/event/sections/Section');

class EventService {
    async getAllEvents() {
        return await Event.find({});
    }

    async getEventById(eventId) {
        const event = await Event.findById(eventId);
        if (!event) {
            return;
        }
        return event;
    }

    async createEvent(event) {
    }

    async getCarousel() {
        const carousel = await Carousel.find({});
        const carouselFlated = carousel.flatMap(carouselItem => carouselItem.events);
        return carouselFlated;
    }

    async getSections() {
        const sections = await Section.find({});
        return sections;
    }
}

module.exports = new EventService();
