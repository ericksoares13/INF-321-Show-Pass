const Event = require('../models/event/Event');
const EventDateInfos = require('../models/event/EventDateInfos');
const EventTicket = require('../models/event/EventTicket');
const TicketReservation = require('../models/event/TicketReservation');
const Carousel = require('../models/event/sections/Carousel');
const Section = require('../models/event/sections/Section');
const Fuse = require('fuse.js');

class EventService {
    async getAllEvents() {
        return await Event.find({});
    }

    async getAllEventsAdmin() {
        const events = await this.getAllEvents();
        return events.map(event => {
            return {
                name: event.name,
                image: event.image,
                description: event.description,
                link: `/admin/eventos/editar/${event.link}`
            };
        });
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

    async getEventAndDatesByField(fieldAndValueEvent, fieldAndValueDate) {
        const event = await Event.findOne(fieldAndValueEvent).populate({
            path: 'dates',
            match: fieldAndValueDate
        }).exec();
        return event;
    }

    async createEvent(event) {
        return await Event.create(event);
    }

    async updateEvent(eventLink, event) {
        await Event.findOneAndUpdate({ link: eventLink }, { $set: event });
    }

    async createDate(date) {
        return await EventDateInfos.create(date);
    }

    async createTicket(ticket) {
        return await EventTicket.create(ticket);
    }

    async getCarousel() {
        const carousel = await Carousel.find({});
        const carouselFlated = carousel.flatMap(carouselItem => carouselItem.events);
        return carouselFlated;
    }

    async getCarouseAdmin() {
        const carousel = await Carousel.find({}).populate('events');
        const carouselFlated = carousel.flatMap(carouselItem => carouselItem.events);
        return carouselFlated.map(event => {
            return {
                isCarouselItem: true,
                link: event.link,
                name: event.name,
                image: event.image,
                description: event.description
            };
        });
    }

    async deleteCarouselItem(eventLink) {
        const event = await this.getEventByField({ link: eventLink });
        await Carousel.updateOne(
            {},
            { $pull: { events: event._id } }
        );
    }

    async addCarouselItem(eventLink) {
        const event = await this.getEventByField({ link: eventLink });
        await Carousel.updateOne(
            {},
            { $addToSet: { events: event._id } }
        );
    }

    async getIndexEventInfosAdmin(eventId) {
        const event = await this.getEventById(eventId);
        return {
            isCarouselItem: true,
            name: event.name,
            image: event.image,
            description: event.description,
            link: event.link
        };
    }

    async deleteSectionlItem(sectionLink, eventLink) {
        const event = await this.getEventByField({ link: eventLink });
        await Section.updateOne(
            { link: sectionLink },
            { $pull: { events: event._id } }
        );
    }

    async addSectionlItem(sectionLink, eventLink) {
        const event = await this.getEventByField({ link: eventLink });
        await Section.findOneAndUpdate(
            { link: sectionLink },
            { $addToSet: { events: event._id } }
        );
    }

    async getAllEventsWithOutSection(sectionLink) {
        const allEventsIds = (await this.getAllEvents()).map(event => event._id);
        const sectionIds = (await Section.findOne({ link: sectionLink })).events;
        return allEventsIds.filter(eventId => !sectionIds.includes(eventId));
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

    async getEventDateComplete(eventLink, index) {
        const event = await Event.findOne({ link: eventLink })
            .populate({
                path: 'dates',
                match: { index: index },
                populate: {
                    path: 'tickets'
                }
            })
            .exec();

        return event;
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
            .exec();

        if (!event) {
            throw 'Evento não encontrado.';
        }

        const selectedDate = event.dates.find(date => date.index === index);

        if (!selectedDate) {
            throw 'Data não encontrada.';
        }

        const reservedTickets = await TicketReservation.find({
            eventLink,
            index
        });

        const reservedCount = {};
        reservedTickets.forEach(reservation => {
            reservation.tickets.forEach(ticket => {
                const sector = String(ticket.sector).trim();
                const category = String(ticket.ticketType).trim();

                if (!reservedCount[sector]) {
                    reservedCount[sector] = {};
                }

                if (!reservedCount[sector][category]) {
                    reservedCount[sector][category] = 0;
                }

                reservedCount[sector][category] += ticket.quantity;
            });
        });

        const sectors = {};
        selectedDate.tickets.forEach(ticket => {
            const sector = String(ticket.sector).trim();
            const category = String(ticket.category).trim();

            if (!sectors[sector]) {
                sectors[sector] = {};
            }

            const reservedAmount = reservedCount[sector]?.[category] || 0;
            const availableAmount = ticket.totalAmount - ticket.soldAmount - reservedAmount;

            sectors[sector][category] = {
                value: ticket.value,
                totalAmount: ticket.totalAmount,
                soldAmount: ticket.soldAmount + reservedAmount
            };
        });

        return {
            sectorImage: event.sectorImage,
            sectors: sectors
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
