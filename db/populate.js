const fs = require('fs').promises;
const EventTicket = require('../models/event/EventTicket');
const EventDateInfos = require('../models/event/EventDateInfos');
const Event = require('../models/event/Event');
const Carousel = require('../models/event/sections/Carousel');
const Section = require('../models/event/sections/Section');
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');

async function createTickets(tickets) {
    const createdTickets = await Promise.all(
        tickets.map(async ticket => {
            const ticketId = new mongoose.Types.ObjectId(ticket._id.$oid);
            const existingTicket = await EventTicket.findOne({ _id: ticketId });
            if (!existingTicket) {
                const createdTicket = await EventTicket.create({
                    ...ticket,
                    _id: ticketId
                });
                return createdTicket._id;
            }
            return ticketId;
        })
    );
    return createdTickets;
}

async function createEventDate(date) {
    const dateId = new mongoose.Types.ObjectId(date._id.$oid);
    const existingDate = await EventDateInfos.findOne({ _id: dateId });
    if (!existingDate) {
        const createdDate = await EventDateInfos.create({
            ...date,
            _id: dateId,
            date: new Date(date.date.$date),
            tickets: await createTickets(date.tickets),
        });
        return createdDate._id;
    }
    return dateId;
}

async function populateEvents() {
    const data = await fs.readFile('./db/events.json', 'utf-8');
    await Promise.all(
        JSON.parse(data).map(async event => {
            const eventId = new mongoose.Types.ObjectId(event._id.$oid);
            const dates = await Promise.all(
                event.dates.map(date => createEventDate(date))
            );
            const existingEvent = await Event.findOne({ _id: eventId });
            if (!existingEvent) {
                await Event.create({
                    ...event,
                    _id: eventId,
                    dates: dates ? dates : []
                });
            }
        })
    );
}

async function populateCarousel() {
    await Carousel.deleteMany({});
    const data = await fs.readFile('./db/carousel.json', 'utf-8');
    const carousels = JSON.parse(data).map(carousel => ({
        ...carousel,
        _id: new mongoose.Types.ObjectId(carousel._id.$oid),
        events: carousel.events.map(eventId => new mongoose.Types.ObjectId(eventId.$oid)),
    }));

    for (const carousel of carousels) {
        const existingCarousel = await Carousel.findOne({ _id: carousel._id });

        if (!existingCarousel) {
            await Carousel.create(carousel);
        }
    }
}

async function populateSections() {
    const data = await fs.readFile('./db/sections.json', 'utf-8');
    const sections = JSON.parse(data).map(section => ({
        ...section,
        _id: new mongoose.Types.ObjectId(section._id.$oid),
        events: section.events.map(eventId => new mongoose.Types.ObjectId(eventId.$oid)),
    }));

    for (const section of sections) {
        const existingSection = await Section.findOne({ _id: section._id });

        if (!existingSection) {
            await Section.create(section);
        }
    }
}

async function populateUsers() {
    const data = await fs.readFile('./db/users.json', 'utf-8');
    const users = JSON.parse(data).map(user => ({
        ...user,
        _id: new mongoose.Types.ObjectId(user._id.$oid),
        birthDate: new Date(user.birthDate.$date)
    }));

    for (const user of users) {
        const existingUser = await User.findOne({ _id: user._id });

        if (!existingUser) {
            await User.create(user);
        }
    }
}

async function populateOrders() {
    const data = await fs.readFile('./db/orders.json', 'utf-8');
    const orders = JSON.parse(data).map(order => ({
        ...order,
        _id: new mongoose.Types.ObjectId(order._id.$oid),
        userId: new mongoose.Types.ObjectId(order.userId.$oid),
        eventId: new mongoose.Types.ObjectId(order.eventId.$oid),
        dateId: new mongoose.Types.ObjectId(order.dateId.$oid),
        orderDate: new Date(order.orderDate.$date),
        tickets: order.tickets.map(ticket => ({
            ...ticket,
            ticketId: new mongoose.Types.ObjectId(ticket.ticketId.$oid),
            _id: new mongoose.Types.ObjectId(ticket._id.$oid)
        }))
    }));

    for (const order of orders) {
        const existingOrder = await Order.findOne({ _id: order._id });

        if (!existingOrder) {
            await Order.create(order);
        }
    }
}

async function populateFromJSON() {
    await populateEvents();
    await populateCarousel();
    await populateSections();
    await populateUsers();
    await populateOrders();
}

module.exports = populateFromJSON;
