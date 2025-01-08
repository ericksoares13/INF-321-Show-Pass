var express = require('express');
var router = express.Router();

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

module.exports = router;
