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
    
    async getEventByField(fieldAndValue) {
        const event = await Event.findOne(fieldAndValue);
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

    async getIndexEventInfos(eventId) {
        const event = await this.getEventById(eventId);
        return {
            name: event.name,
            image: event.image,
            description: event.description,
            link: `/eventos/${event.link}`
        };
    }

    async getEventPage(eventLink) {
        const event = await this.getEventByField({link: eventLink});

        return {
            image: event.image,
            dates: event.dates.map(d => {
                const formattedDate = new Date(d.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
                return {
                    city: d.city,
                    state: d.state,
                    locale: d.locale,
                    date: capitalizedDate,
                    link: event.link + '/ingressos'
                };
            }),
            infos: event.infos.replace(/\n/g, '<br>'),
            classification: event.classification.replace(/\n/g, '<br>'),
            ticketSell: event.ticketSell.replace(/\n/g, '<br>'),
            ticketPrice: this.#formatTickets(event.ticketPrice),
            sectorImage: event.sectorImage
        };
    }
    
    #formatTickets = (text) => {
        const lines = text.trim().split('\n');
        let html = '<ul>';
        let sublistOpen = false;

        for (let line of lines) {
            if (line.startsWith('* ')) {
                if (sublistOpen) {
                    html += '</ul></li>';
                    sublistOpen = false;
                }

                html += `<li><strong class="d-block mb-3">${line.slice(2)}</strong>`;
                sublistOpen = true;
                html += '<ul class="mb-4">';
            } else if (line.startsWith(' * ')) {
                html += `<li>${line.slice(3)}</li>`;
            }
        }

        if (sublistOpen) {
            html += '</ul></li>';
        }

        html += '</ul>';
        return html;
    };
}

module.exports = new EventService();
