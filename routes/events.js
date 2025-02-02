var express = require('express');
var router = express.Router();

const EventService = require('../services/eventService');

/* GET event page. */
router.get('/:eventLink', async function(req, res) {
    try {
        const eventLink = req.params.eventLink;
        const event = await EventService.getEventPage(eventLink);
        res.render('events/event', { event });
    } catch (e) {
        res.status(400).json(e);
    }
});

/* GET ticket page. */
router.get('/:eventLink/ingressos/data-:index', async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        const index = parseInt(req.params.index);
        const date = await EventService.getEventDate(eventLink, index);
        res.render('events/ticket', { date, index });
    } catch (e) {
        res.status(400).json(e);
    }
});

/* GET confirmation page. */
router.get('/:eventLink/ingressos/data-:index/confirmacao', function(req, res, next) {
    res.render('events/confirmation');
});

/* GET payment page. */
router.get('/:eventLink/ingressos/data-:index/confirmacao/pagamento', function(req, res, next) {
    res.render('events/payment');
});

/* GET conclusion page. */
router.get('/:eventLink/ingressos/data-:index/confirmacao/pagamento/conclusao', function(req, res, next) {
    res.render('events/conclusion');
});

module.exports = router;