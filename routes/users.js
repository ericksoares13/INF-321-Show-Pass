var express = require('express');
var router = express.Router();

const UserService = require('../services/userService');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

/* GET support page. */
router.get('/suporte', function(req, res, next) {
    res.render('support');
});

/* GET register page. */
router.get('/cadastrar', function(req, res, next) {
    res.render('register');
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
router.post('/cadastrar-usuario', async function(req, res, next) {
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
        res.redirect('/');
    } catch (e) {
        res.status(400).json({ message: e });
    }
});

module.exports = router;
