var express = require('express');
var router = express.Router();

const EventService = require('../services/eventService');

/* GET event page. */
router.get('/:eventLink', async function(req, res) {
    const eventLink = req.params.eventLink;
    const event = await EventService.getEventPage(eventLink);
    res.render('events/event', { event });
});

/* GET ticket page. */
router.get('/olivia-rodrigo-guts-world-tour/ingressos', function(req, res, next) {
    res.render('events/ticket');
});

/* GET confirmation page. */
router.get('/olivia-rodrigo-guts-world-tour/ingressos/confirmacao', function(req, res, next) {
    res.render('events/confirmation');
});

module.exports = router;