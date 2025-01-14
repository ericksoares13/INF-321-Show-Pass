const fs = require('fs').promises;
const Event = require('../models/event/Event');

async function populateFromJSON() {
    await Event.deleteMany({});
    const data = await fs.readFile('./db/events.json', 'utf-8');
    await Event.insertMany(JSON.parse(data));
}

module.exports = populateFromJSON;
