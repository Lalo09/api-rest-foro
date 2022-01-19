//Routes for user

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
var md_auth = require('../middlewares/autenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir:'./uploads/users'});

/*Configure routes with controller and methods*/
//User routes
router.get('/test-user',UserController.test);
router.get('/test2-user',UserController.test2);
router.post('/register',UserController.save);//save user
router.post('/login',UserController.login);//login user
router.put('/update', md_auth.autenticated, UserController.update);//update data user
router.post('/upload-avatar', [md_auth.autenticated,md_upload], UserController.uploadAvatar);//upload avatar
router.get('/avatar/:fileName',UserController.avatar); //show avatar
router.get('/users',UserController.getusers); //show user
router.get('/user/:userId',UserController.getuser); //show specific user

module.exports = router; //export object