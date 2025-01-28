var express = require('express');
var router = express.Router();

const UserService = require('../services/userService');
const EventService = require('../services/eventService');

async function getEventInfos(eventId) {
    const event = await EventService.getEventById(eventId);
    return {
        name: event.name,
        image: event.image,
        description: event.description,
        link: 'eventos/olivia-rodrigo'
    };
}

/* GET home page. */
router.get('/', async function(req, res, next) {
    try {
        const carouselEventIds = await EventService.getCarousel();
        const carouselEvents = await Promise.all(
            carouselEventIds.map(async eventId => await getEventInfos(eventId))
        );
        
        const sections = await EventService.getSections();
        const sectionsEvents = await Promise.all(
            sections.map(async section => {
                const eventInfos = await Promise.all(
                    section.events.map(async eventId => await getEventInfos(eventId))
                );
                return {
                    section: section.name,
                    events: eventInfos
                };
            })
        );

        res.render('index', {
            carouselEvents: carouselEvents,
            eventsSections: sectionsEvents
        });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível carregar a tela inicial.' });
    }
});

/* GET support page. */
router.get('/suporte', function(req, res, next) {
    res.render('support');
});

/* GET register page. */
router.get('/cadastrar', function(req, res, next) {
    res.render('register', {
        user: {},
        error: {}
    });
});

/* GET login page. */
router.get('/entrar', function(req, res, next) {
    res.render('login');
});

/* GET orders page. */
router.get('/meus-pedidos', function(req, res, next) {
    res.render('orders');
});

/* GET profile page. */
router.get('/meu-perfil', function(req, res, next) {
    res.render('profile');
});

/* Register user */
router.post('/cadastrar', async function(req, res, next) {
    const user = {
        name: req.body.name,
        user: req.body.user,
        cpf: req.body.cpf,
        birthDate: req.body.birthDate,
        cellphone: req.body.cellphone,
        email: req.body.email,
        password: req.body.password,
        checkPassword: req.body.checkPassword
    }

    try {
        await UserService.createUser(user);
        res.redirect('/');
    } catch (error) {
        res.status(400).render('register', { user, error });
    }
});

module.exports = router;
