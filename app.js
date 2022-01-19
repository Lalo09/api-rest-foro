'use strict'

// Requires
var express = require("express");
var bodyParser = require("body-parser");

//Execute express to create web server
var app = express();

//Load routing files
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment')

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json())

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Routes
app.use('/api',user_routes);
app.use('/api',topic_routes);
app.use('/api',comment_routes);

/**
 * Route test display a json [example]
 */
app.get('/test', (req,res)=>{
    return res.status(200).send({
        name: 'Eduardo',
        message : 'Hello world from nodejs'
    })
});

//Exportar module
module.exports = app;