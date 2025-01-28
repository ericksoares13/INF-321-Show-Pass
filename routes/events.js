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

module.exports = router;
