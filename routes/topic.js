'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');

var router = express.Router();
var md_auth = require('../middlewares/autenticated');

router.get('/test-topic',TopicController.test);
router.post('/topic',md_auth.autenticated,TopicController.save);
router.get('/topics/:page?',TopicController.getTopics);
router.get('/user-topics/:user',TopicController.getTopicsByUser);
router.get('/topic/:id',TopicController.getTopic);
router.put('/topic/:id',md_auth.autenticated,TopicController.update);
router.delete('/topic/:id',md_auth.autenticated,TopicController.delete);
router.get('/search/:search',TopicController.search);

module.exports = router; //export object