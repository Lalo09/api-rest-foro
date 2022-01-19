'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-generar-eñ-token-789';

exports.autenticated =  function(req,res,next){
    //console.log("Middleware autenticated test");

    //Chech authorization
    if (!req.headers.authorization) {
        return res.status(403).send({
           message: 'The request have not authorization' 
        });
    }

    //clear token
    var token = req.headers.authorization.replace(/['"]+/g,'')

    try {
        //decode token
        var payload = jwt.decode(token,secret);

        //Check token expiration
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'Token has expired' 
             });
        }        
    } catch (error) {
        return res.status(404).send({
            message: 'Token not valid' 
         });
    }

    //Adjunt identify user to request
    req.user= payload;

    //go to action
    next();
};