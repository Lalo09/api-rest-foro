'use strict'

var express = require('express');
var CommentController = require('../controllers/comment');

var router = express.Router();
var md_auth = require('../middlewares/autenticated');

router.post('/comment/topic/:topicId',md_auth.autenticated,CommentController.add);
router.put('/comment/:commentId',md_auth.autenticated,CommentController.update);
router.delete('/comment/:topicId/:commentId',md_auth.autenticated,CommentController.delete);

module.exports = router; //export object