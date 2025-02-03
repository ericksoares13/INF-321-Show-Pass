var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const EventService = require('../services/eventService');
const TicketReservation = require('../models/event/TicketReservation');
const UserService = require('../services/userService');

/* Authenticate user */
const authenticate = function(req, res, next) {
    const authToken = req.cookies.authToken;
  
    if (!authToken) {
        return res.redirect('/entrar');
    }
  
    try {
        jwt.verify(authToken, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.redirect('/entrar');
    }
};

/* GET event page. */
router.get('/:eventLink', async function(req, res) {
    try {
        const eventLink = req.params.eventLink;
        const event = await EventService.getEventPage(eventLink);
        res.render('events/event', { event });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao carregar evento.'
        }});
    }
});

/* GET ticket page. */
router.get('/:eventLink/ingressos/data-:index', authenticate, async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        const index = parseInt(req.params.index);

        const lastSelection = req.cookies[`lastSelection_${eventLink}_${index}`];
        const totalPrice = req.cookies[`totalPrice_${eventLink}_${index}`];

        if (lastSelection && totalPrice) {
            return res.redirect(`data-${index}/confirmacao/pagamento`);
        }

        const date = await EventService.getEventDate(eventLink, index);
        res.render('events/ticket', { date, index, eventLink });
    } catch (e) {
        res.redirect('/entrar');
    }
});

/* Confirmation page. */
router.post('/:eventLink/ingressos/data-:index/confirmacao', authenticate, async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        const index = parseInt(req.params.index);
        const event = await EventService.getEventAndDatesByField({ link: eventLink }, { index: index });

        const { selectedTickets, totalPrice } = req.body;
        const tickets = JSON.parse(selectedTickets);
        
        res.render('events/confirmation', { tickets, totalPrice, event: {
            name: event.name,
            city: event.dates[0].city,
            date: event.dates[0].date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        }});
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao selecionar ingresso.'
        }});
    }
});

/* GET payment page. */
router.get('/:eventLink/ingressos/data-:index/confirmacao/pagamento', authenticate, async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        const index = parseInt(req.params.index);

        const lastSelection = req.cookies[`lastSelection_${eventLink}_${index}`];
        const totalPrice = req.cookies[`totalPrice_${eventLink}_${index}`];

        if (!lastSelection || !totalPrice) {
            throw 'Acesso não permitido';
        }

        res.render('events/payment');
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro durante pagamento.'
        }});
    }
});

/* Payment page. */
router.post('/:eventLink/ingressos/data-:index/confirmacao/pagamento', authenticate, async function(req, res, next) {
    const eventLink = req.params.eventLink;
    const index = parseInt(req.params.index);
    try {
        const userId = req.cookies.userId;

        let { selectedTickets, totalPrice } = req.body;
        const tickets = JSON.parse(selectedTickets);
        totalPrice = Number(totalPrice.replace(',', '.'))
        
        res.cookie(`lastSelection_${eventLink}_${index}`, tickets, { 
            maxAge: 600000,
            httpOnly: true 
        });
        res.cookie(`totalPrice_${eventLink}_${index}`, totalPrice, { 
            maxAge: 600000,
            httpOnly: true 
        });
        
        await TicketReservation.create({
            eventLink,
            index,
            userId,
            tickets,
            totalPrice,
            expiresAt: new Date(Date.now() + 600000)
        });

        res.render('events/payment');
    } catch (e) {
        if (e?.errorResponse?.errmsg && e.errorResponse.errmsg.includes('duplicate key error collection')) {
            return res.redirect(`/eventos/${eventLink}/ingressos/data-${index}/confirmacao/pagamento`);
        }
        res.status(400).render('error', { error: {
            message: 'Erro durante pagamento.'
        }});
    }
});

/* GET conclusion page. */
router.post('/:eventLink/ingressos/data-:index/confirmacao/pagamento/conclusao', authenticate, async (req, res) => {
    try {
        const eventLink = req.params.eventLink;
        const index = parseInt(req.params.index);
        const userId = req.cookies.userId;

        const reservation = await TicketReservation.findOne({ eventLink, index, userId });
        
        if (!reservation) {
            res.status(400).render('error', { error: {
                message: 'Reserva expirada ou não encontrada.'
            }});
        }

        const lastSelection = req.cookies[`lastSelection_${eventLink}_${index}`];
        res.clearCookie(`lastSelection_${eventLink}_${index}`);
        res.clearCookie(`totalPrice_${eventLink}_${index}`);

        const event = await EventService.getEventDateComplete(eventLink, index);
        const result = lastSelection.map(ticket => {
            const matches = event.dates[0].tickets.filter(item => item.sector === ticket.sector && item.category === ticket.ticketType);
            
            if (matches.length > 0) {
                return matches.map(match => ({
                    quantity: ticket.quantity,
                    ticketId: match._id,
                }));
            }
            return [];
        }).flat();

        const user = await UserService.getUserById(userId);
        const order = await UserService.createOrder({
            userId: userId,
            eventId: event._id,
            dateId: event.dates[0]._id,
            tickets: result,
            type: req.body.paymentType,
            cardNumber: req.body.cardNumber || '--',
            name: req.body.cardHolder || user.name,
            installment: (req.body.paymentType == 'Crédito' ? req.body.installments : '--')
        });

        await reservation.deleteOne();

        res.render('events/conclusion', (await UserService.getOrder(order._id)));
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro durante conclusão.'
        }});
    }
});

// Remove expires tickets
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expiredReservations = await TicketReservation.find({ expiresAt: { $lt: now } });

    for (const reservation of expiredReservations) {
        await reservation.deleteOne();
    }
});

module.exports = router;
