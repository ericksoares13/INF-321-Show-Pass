var express = require('express');
var router = express.Router();

/* GET event page. */
router.get('/olivia-rodrigo', function(req, res, next) {
    res.render('events/event');
});

/* GET ticket page. */
router.get('/olivia-rodrigo/ingressos', function(req, res, next) {
    res.render('events/ticket');
});

/* GET confirmation page. */
router.get('/olivia-rodrigo/ingressos/confirmacao', function(req, res, next) {
    res.render('events/confirmation');
});

module.exports = router;