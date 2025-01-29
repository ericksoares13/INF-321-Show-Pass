const fs = require('fs').promises;
const Event = require('../models/event/Event');
const Carousel = require('../models/event/sections/Carousel');
const Section = require('../models/event/sections/Section');
const User = require('../models/User');
const mongoose = require('mongoose');

async function populateEvents() {
    const data = await fs.readFile('./db/events.json', 'utf-8');
    const events = JSON.parse(data).map(event => ({
        ...event,
        _id: new mongoose.Types.ObjectId(event._id.$oid),
        dates: event.dates.map(date => ({
            ...date,
            _id: new mongoose.Types.ObjectId(date._id.$oid),
            date: new Date(date.date.$date),
            tickets: date.tickets.map(ticket => ({
                ...ticket,
                _id: new mongoose.Types.ObjectId(ticket._id.$oid),
            }))
        })),
    }));

    for (const event of events) {
        const existingEvent = await Event.findOne({ _id: event._id });

        if (!existingEvent) {
            await Event.create(event);
        }
    }
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
            await User.create(userData);
        }
    }
}

async function populateFromJSON() {
    await populateEvents();
    await populateCarousel();
    await populateSections();
    await populateUsers();
}

module.exports = populateFromJSON;
