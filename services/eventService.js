const Event = require('../models/event/Event');
const Carousel = require('../models/event/sections/Carousel');
const Section = require('../models/event/sections/Section');
const Fuse = require('fuse.js');

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

    async searchEvents(searchQuery) {
        const options = {
            includeScore: true,
            threshold: 0.3,
            keys: ['name', 'link', 'description', 'infos', 'dates.state', 'dates.city', 'dates.locale', 'dates.address']
        };
        const events = await Event.find().populate('dates').exec();
        const fuseEvents = new Fuse(events, options);
        const eventResults = fuseEvents.search(searchQuery);
        const foundEvents = await Promise.all(eventResults.map(async result => await this.getIndexEventInfos(result.item._id)));

        return foundEvents;
    }

    async getIndexEventInfos(eventId) {
        const event = await this.getEventById(eventId);
        return {
            name: event.name,
            image: event.image,
            description: event.description,
            link: `/eventos/${event.link}`,
            active: event.dates.length != 0
        };
    }

    async getEventPage(eventLink) {
        const event = await Event.findOne({ link: eventLink }).populate('dates').exec();

        if (!event) {
            throw 'Evento não encontrado.';
        }

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
                    index: d.index,
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

    async getEventDate(eventLink, index) {
        const event = await Event.findOne({ link: eventLink })
            .populate({
                path: 'dates',
                match: { index: index },
                populate: {
                    path: 'tickets'
                }
            })
            .exec()

        if (!event) {
            throw 'Evento não encontrado.';
        }

        const selectedDate = event.dates.find(date => date.index === index);

        if (!selectedDate) {
            throw 'Data não encontrada.';
        }

        const sectors = {};
        selectedDate.tickets.forEach(ticket => {
            const sector = String(ticket.sector).trim();
            if (!sectors[sector]) {
                sectors[sector] = {};
            }

            const category = String(ticket.category).trim();
            sectors[sector][category] = {
                value: ticket.value,
                totalAmount: ticket.totalAmount,
                soldAmount: ticket.soldAmount,
            }
        });

        return {
            sectorImage: event.sectorImage,
            sectors: sectors
        }
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
