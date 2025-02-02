const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const UserService = require('../services/userService');
const EventService = require('../services/eventService');

/* Authenticate user */
const authenticate = function(req, res, next) {
    const authToken = req.cookies.authToken;
  
    if (!authToken) {
        return res.status(401).json({ message: 'Acesso negado.' });
    }
  
    try {
        jwt.verify(authToken, process.env.JWT_SECRET);
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

        res.render('index', {
            carouselEvents: carouselEvents,
            eventsSections: sectionsEvents,
            eventsSearch: null
        });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível carregar a tela inicial.' });
    }
});

/* Search event HOME. */
router.post('/', async function(req, res, next) {
    const searchQuery = req.body.searchQuery.trim();

    if (!searchQuery) {
        return res.redirect('/');
    }
    
    try {
        const events = await EventService.searchEvents(searchQuery);
        res.render('index', {
            carouselEvents: null,
            eventsSections: null,
            eventsSearch: events
        });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível realizar a busca.' });
    }
});

/* GET orders page. */
router.get('/meus-pedidos', authenticate, async function(req, res, next) {
    const userId = req.cookies.userId;
    try {
        const orders = await UserService.getOrders(userId);
        res.render('orders', { orders: orders });
    } catch (e) {
        res.status(400).json({ message: e });
    }
});

/* Search event ORDERS. */
router.post('/meus-pedidos', authenticate, async function(req, res, next) {
    const searchQuery = req.body.searchQuery.trim();
    const userId = req.cookies.userId;

    if (!searchQuery) {
        return res.redirect('/meus-pedidos');
    }
    
    try {
        const orders = await UserService.searchOrders(searchQuery, userId);
        res.render('orders', { orders: orders });
    } catch (e) {
        res.status(400).json({ message: e });
    }
});

/* GET profile page. */
router.get('/meu-perfil', authenticate, async function(req, res, next) {
    const userId = req.cookies.userId;
    const user = await UserService.getUserInfos(userId);
    res.render('profile', { user, error: {} });
});

/* PATCH profile page. */
router.post('/meu-perfil', authenticate, async function(req, res, next) {
    const userId = req.cookies.userId;
    let user = await UserService.getUserInfos(userId);
    let params = {};

    if (req.body.name) {
        params.name = req.body.name;
        params.user = req.body.user;
        params.cellphone = req.body.cellphone;
    }

    if (req.body.password) {
        params.oldPassword = req.body.oldPassword;
        params.password = req.body.password;
        params.checkPassword = req.body.checkPassword;
    }

    try {
        await UserService.updateUser(userId, params);
        user = await UserService.getUserInfos(userId);
        res.redirect('/');
    } catch (error) {
        user = await UserService.getUserInfos(userId);
        user.oldPassword = req.body.oldPassword;
        user.password = req.body.password;
        user.checkPassword = req.body.checkPassword;
        res.status(400).render('profile', { user: user, error: error });
    }
});

/* GET support page. */
router.get('/suporte', function(req, res, next) {
    res.render('support', { error: {} });
});

/* Support question */
router.post('/suporte', function(req, res, next) {
    res.render('support', { error: {} });
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
        
        if (loggedUser.admin) {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
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
