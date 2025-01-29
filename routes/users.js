const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

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

async function getUserInfos(userId) {
    const user = await UserService.getUserById(userId);
    return {
        name: user.name,
        user: user.user,
        cpf: user.cpf,
        birthDate: user.birthDate,
        cellphone: user.cellphone,
        email: user.email
    };
}

/* Authenticate user */
const authenticate = function(req, res, next) {
    const authToken = req.cookies.authToken;
  
    if (!authToken) return res.status(401).json({ message: 'Acesso negado.' });
  
    try {
        const verified = jwt.verify(authToken, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: 'Acesso negado.' });
    }
};

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

/* GET orders page. */
router.get('/meus-pedidos', authenticate, function(req, res, next) {
    res.render('orders');
});

/* GET profile page. */
router.get('/meu-perfil', authenticate, async function(req, res, next) {
    const userId = req.cookies.userId;
    const user = await getUserInfos(userId);
    res.render('profile', { user });
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
        const createdUser = await UserService.createUser(user);
        const token = UserService.generateToken(createdUser);
        res.cookie('authToken', token, { httpOnly: true, secure: true, maxAge: 3600000 });
        res.cookie('userId', createdUser._id, { httpOnly: true, secure: true, maxAge: 3600000 });
        res.redirect('/');
    } catch (error) {
        res.status(400).render('register', { user, error });
    }
});

/* GET login page. */
router.get('/entrar', function(req, res, next) {
    res.render('login', {
        user: {},
        error: {}
    });
});

/* Login user */
router.post('/entrar', async function(req, res, next) {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    try {
        const loggedUser = await UserService.loginUser(user);
        const token = UserService.generateToken(loggedUser);
        res.cookie('authToken', token, { httpOnly: true, secure: true, maxAge: 3600000 });
        res.cookie('userId', loggedUser._id, { httpOnly: true, secure: true, maxAge: 3600000 });
        res.redirect('/');
    } catch (error) {
        res.status(400).render('login', { user, error });
    }
});

/* Logout user */
router.get('/sair', function(req, res, next) {
    res.clearCookie('authToken');
    res.clearCookie('userId');
    res.redirect('/');
});

/* Authenticate user */
router.get('/authenticate', authenticate, function(req, res, next) {
    res.status(200).json({ message: 'Acesso permitido.' });
});

module.exports = router;
