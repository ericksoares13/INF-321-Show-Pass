var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const upload = require('../db/multerConfig');

const UserService = require('../services/userService');
const EventService = require('../services/eventService');
const Event = require('../models/event/Event');

/* Authenticate user */
const authenticate = async function(req, res, next) {
    const authToken = req.cookies.authToken;
    const userId = req.cookies.userId;
  
    if (!authToken) {
        return res.status(401).render('error', { error: {
            message: 'Acesso negado.'
        }});
    }
  
    const user = await UserService.getUserById(userId);

    if (!user || !user.admin) {
        return res.status(401).render('error', { error: {
            message: 'Usuário precisa ser administrador.'
        }});
    }

    try {
        jwt.verify(authToken, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(400).render('error', { error: {
            message: 'Acesso negado.'
        }});
    }
};

/* GET admin page. */
router.get('/', authenticate, async function(req, res, next) {
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
        res.status(400).render('error', { error: {
            message: 'Não foi possível carregar a tela inicial.'
        }});
    }
});

/* GET admin-events page. */
router.get('/eventos', authenticate, async function(req, res, next) {
    try {
        const events = await EventService.getAllEventsAdmin();
        res.render('admin/events', { events: events });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao listar eventos'
        }});
    }
});

/* GET admin-events page. */
router.post('/eventos', authenticate, async function(req, res, next) {
    const searchQuery = req.body.searchQuery.trim();

    if (!searchQuery) {
        return res.redirect('eventos');
    }
    
    try {
        const events = (await EventService.searchEvents(searchQuery)).map(event => {
            return {
                ...event,
                link: event.link.replace("eventos/", "admin/eventos/editar/")
            };
        });
        res.render('admin/events', { events: events });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Não foi possível realizar a busca.'
        }});
    }
});

/* GET admin-create-events page. */
router.get('/eventos/criar', authenticate, async function(req, res, next) {
    res.render('admin/create-event', { event: {}, error: {} });
});

/* Create-event. */
router.post('/eventos/criar', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'sectorImage', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files.image || !req.files.sectorImage) {
            return res.status(400).render('error', {
                error: {
                    message: 'Necessário duas imagens.'
                }
            });
        }

        const imageUrl = `/images/${req.files.image[0].filename}`;
        const sectorImageUrl = `/images/${req.files.sectorImage[0].filename}`;

        await EventService.createEvent({
            ...req.body,
            image: imageUrl,
            sectorImage: sectorImageUrl,
            dates: req.body.dates && req.body.dates.length > 0
                ? await Promise.all(req.body.dates.map(async (date, index) => {
                    const createdDate = (await EventService.createDate({
                        ...date,
                        index: index,
                        tickets: await Promise.all(date.tickets.map(async ticket => {
                            return (await EventService.createTicket({
                                ...ticket,
                                soldAmount: 0
                            }))._id;
                        }))
                    }))._id;
                    return createdDate;
                }))
                : []
        });

        res.redirect('/admin/eventos');
    } catch (e) {
        res.status(400).render('error', {
            error: {
                message: 'Erro ao criar evento. ' + e
            }
        });
    }
});

/* GET admin-edit-events page. */
router.get('/eventos/editar/:eventLink', async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        const event = await Event.findOne({link: eventLink}).populate({
            path: 'dates',
            populate: {
                path: 'tickets'
            }
        })
        .lean()
        .exec();

        editedEvent = {
            ...event,
            dates: event.dates.map(d => {
                const formattedDate = new Date(d.date).toISOString().split('T')[0];
                return {
                    ...d,
                    date: formattedDate,
                };
            })
        };

        res.render('admin/edit-event', { event : editedEvent, error: {}, link: eventLink });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao editar evento.'
        }});
    }
});

/* Edit-event. */
router.post('/eventos/editar/:eventLink', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'sectorImage', maxCount: 1 }
]), async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        const event = req.body;

        if (req.files.image) {
            event.image = `/images/${req.files.image[0].filename}`;
        }

        if (req.files.sectorImage) {
            event.sectorImage = `/images/${req.files.sectorImage[0].filename}`;
        }

        console.log(eventLink);
        await EventService.updateEvent(eventLink, event);

        res.redirect('/admin/eventos');
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao editar evento.' + e
        }});
    }
});

/* GET admin-carousel page. */
router.get('/carrossel', authenticate, async function(req, res, next) {
    try {
        const events = await EventService.getCarouseAdmin();
        res.render('admin/carousel', { events: events });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao listar carrossel'
        }});
    }
});

/* GET admin-carousel page. */
router.post('/carrossel', authenticate, async function(req, res, next) {
    const searchQuery = req.body.searchQuery.trim();

    if (!searchQuery) {
        return res.redirect('carrossel');
    }
    
    try {
        const events = (await EventService.searchEvents(searchQuery)).map(event => {
            return {
                ...event,
                isCarouselItem: false,
                link: event.link.replace("eventos/", "admin/carrossel/adicionar/")
            };
        });
        res.render('admin/carousel', { events: events });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Não foi possível realizar a busca.'
        }});
    }
});

/* DELETE carousel item. */
router.post('/carrossel/deletar/:eventLink', authenticate, async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        await EventService.deleteCarouselItem(eventLink);
        res.redirect('/admin/carrossel');
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao deletar item.'
        }});
    }
});

/* ADD carousel item. */
router.post('/carrossel/adicionar/:eventLink', authenticate, async function(req, res, next) {
    try {
        const eventLink = req.params.eventLink;
        await EventService.addCarouselItem(eventLink);
        res.redirect('/admin/carrossel');
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao deletar item.'
        }});
    }
});

/* GET admin-sections page. */
router.get('/secoes', authenticate, async function(req, res, next) {
    try {
        const sections = await EventService.getSections();
        const sectionsEvents = await Promise.all(
            sections.map(async section => {
                const eventInfos = await Promise.all(
                    section.events.map(async eventId => await EventService.getIndexEventInfosAdmin(eventId))
                );
                return {
                    section: section.name,
                    link: section.link,
                    events: eventInfos
                };
            })
        );

        res.render('admin/sections', {
            eventsSections: sectionsEvents,
            eventsSearch: null
        });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Não foi possível carregar as seções.'
        }});
    }
});

/* DELETE carousel item. */
router.post('/secoes/:sectionLink/:eventLink/remover', authenticate, async function(req, res, next) {
    try {
        const sectionLink = req.params.sectionLink;
        const eventLink = req.params.eventLink;
        await EventService.deleteSectionlItem(sectionLink, eventLink);
        res.redirect('/admin/secoes');
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao deletar item.'
        }});
    }
});

/* ADD carousel item. */
router.post('/secoes/:sectionLink/adicionar', authenticate, async function(req, res, next) {
    try {
        const sectionLink = req.params.sectionLink;
        const eventsIds = await EventService.getAllEventsWithOutSection(sectionLink);
        const events = await Promise.all(eventsIds.map(async eventId => {
            const eventInfos =  await EventService.getIndexEventInfosAdmin(eventId);
            return {
                section: sectionLink,
                name: eventInfos.name,
                link: eventInfos.link,
                image: eventInfos.image,
                description: eventInfos.description
            };
        }));

        res.render('admin/sections', {
            eventsSections: null,
            eventsSearch: events
        });
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao listar itens para adicionar.'
        }});
    }
});

/* ADD carousel item. */
router.post('/secoes/:sectionLink/adicionar/:eventLink', authenticate, async function(req, res, next) {
    try {
        const sectionLink = req.params.sectionLink;
        const eventLink = req.params.eventLink;
        await EventService.addSectionlItem(sectionLink, eventLink);
        res.redirect('/admin/secoes');
    } catch (e) {
        res.status(400).render('error', { error: {
            message: 'Erro ao listar itens para adicionar.'
        }});
    }
});

/* Authenticate admin */
router.get('/authenticate', authenticate, function(req, res, next) {
    res.status(200).json({ message: 'Acesso permitido.' });
});

module.exports = router;