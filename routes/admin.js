var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

const UserService = require('../services/userService');
const EventService = require('../services/eventService');

/* Authenticate user */
const authenticate = async function(req, res, next) {
    const authToken = req.cookies.authToken;
    const userId = req.cookies.userId;
  
    if (!authToken) {
        return res.status(401).json({ message: 'Acesso negado.' });
    }
  
    const user = await UserService.getUserById(userId);

    if (!user || !user.admin) {
        return res.status(401).json({ message: 'Usuário precisa ser administrador.' });
    }

    try {
        jwt.verify(authToken, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: 'Acesso negado.' });
    }
};

/* GET admin page. */
router.get('/', authenticate, async function(req, res) {
    try {
        const carouselEventIds = await EventService.getCarousel();
        const carouselEvents = await Promise.all(
            carouselEventIds.map(async eventId => await EventService.getIndexEventInfos(eventId))
        );
        
        const sections = await EventService.getSections();
        const sectionsEvents = await Promise.all(
            sections.map(async section => {
                const eventInfos = await Promise.all(
                    section.events.map(async eventId => await EventService.getIndexEventInfos(eventId))
                );
                return {
                    section: section.name,
                    events: eventInfos
                };
            })
        );

        res.render('admin/admin', {
            carouselEvents: carouselEvents,
            eventsSections: sectionsEvents
        });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível carregar a tela inicial.' });
    }
});

/* GET admin-events page. */
router.get('/eventos', authenticate, async function(req, res) {
    try {
        const events = await EventService.getAllEventsAdmin();
        console.log(events);
        res.render('admin/events', { events: events });
    } catch (e) {
        es.status(200).json({ message: 'Erro ao listar eventos' });
    }
});

/* GET admin-events page. */
router.post('/eventos', authenticate, async function(req, res) {
    const searchQuery = req.body.searchQuery.trim();

    if (!searchQuery) {
        return res.redirect('eventos');
    }
    
    try {
        const events = (await EventService.searchEvents(searchQuery)).map(event => {
            console.log(event.link);
            return {
                ...event,
                link: event.link.replace("eventos/", "admin/eventos/editar/")
            };
        });
        res.render('admin/events', { events: events });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível realizar a busca.' });
    }
});

/* GET admin-carousel page. */
router.get('/carrossel', authenticate, async function(req, res, next) {
    res.render('admin/carousel');
});

/* GET admin-sections page. */
router.get('/secoes', authenticate, function(req, res, next) {
    res.render('admin/sections');
});

/* Authenticate admin */
router.get('/authenticate', authenticate, function(req, res, next) {
    res.status(200).json({ message: 'Acesso permitido.' });
});

module.exports = router;