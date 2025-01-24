const fs = require('fs').promises;
const Event = require('../models/event/Event');
const Carousel = require('../models/event/sections/Carousel');
const Section = require('../models/event/sections/Section');

async function populateEvents() {
    await Event.deleteMany({});
    const data = await fs.readFile('./db/events.json', 'utf-8');
    await Event.insertMany(JSON.parse(data));
}

async function populateCarousel() {
    await Carousel.deleteMany({});

    const olivia = await Event.find({ name: /GUTS WORLD TOUR/ });
    const lolla = await Event.find({ name: /LOLLAPALOOZA BRASIL 2025/ });
    const coldplay = await Event.find({ name: /COLDPLAY/ });
    const theTown = await Event.find({ name: /THE TOWN 2025/ });
    const caetano = await Event.find({ name: /CAETANO VELOSO & MARIA BETHÂNIA/ });

    const carousel = new Carousel({
        events: [olivia[0]._id, lolla[0]._id, coldplay[0]._id, theTown[0]._id, caetano[0]._id]
    });

    await carousel.save();
}

async function populateSections() {
    await Section.deleteMany({});

    const caetano = await Event.find({ name: /CAETANO VELOSO & MARIA BETHÂNIA/ });
    const natirues = await Event.find({ name: /NATIRUTS - LEVE COM VOCÊ/ });
    const malvadas = await Event.find({ name: /MENINAS MALVADAS - O MUSICAL/ });

    const olivia = await Event.find({ name: /GUTS WORLD TOUR/ });
    const lolla = await Event.find({ name: /LOLLAPALOOZA BRASIL 2025/ });
    const theTown = await Event.find({ name: /THE TOWN 2025/ });

    const forAllFamily = new Section({
        name: 'Para toda a família',
        events: [caetano[0]._id, natirues[0]._id, malvadas[0]._id]
    });

    const weekHighlights = new Section({
        name: 'Destaques da semana',
        events: [olivia[0]._id, lolla[0]._id, theTown[0]._id]
    });

    await forAllFamily.save();
    await weekHighlights.save();
}

async function populateFromJSON() {
    await populateEvents();
    await populateCarousel();
    await populateSections();
}

module.exports = populateFromJSON;
